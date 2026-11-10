const express = require("express");
const cors = require("cors");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const pool = require("./db");

const app = express();
const PORT = 3000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "pagelog-local-session-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ message: "로그인이 필요합니다." });
  }
  next();
}

// 서버 실행 확인
app.get("/api/health", (req, res) => {
  res.json({ message: "PageLog 서버가 정상적으로 실행 중입니다!" });
});

// 회원가입
app.post("/api/auth/signup", async (req, res) => {
  const username = String(req.body.username || "").trim();
  const nickname = String(req.body.nickname || "").trim();
  const password = String(req.body.password || "");

  if (!/^[A-Za-z0-9_]{4,20}$/.test(username)) {
    return res.status(400).json({ message: "아이디는 영문, 숫자, 밑줄(_)로 4~20자 입력해 주세요." });
  }
  if (nickname.length < 2 || nickname.length > 12) {
    return res.status(400).json({ message: "닉네임은 2~12자로 입력해 주세요." });
  }
  if (password.length < 6 || password.length > 100) {
    return res.status(400).json({ message: "비밀번호는 6자 이상 입력해 주세요." });
  }

  try {
    const [[existing]] = await pool.query("SELECT id FROM users WHERE username = ? LIMIT 1", [username]);
    if (existing) {
      return res.status(409).json({ message: "이미 사용 중인 아이디예요." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      "INSERT INTO users (username, nickname, password) VALUES (?, ?, ?)",
      [username, nickname, passwordHash]
    );

    const userId = result.insertId;

    req.session.user = { id: userId, username, nickname };
    res.status(201).json({ user: req.session.user });
  } catch (error) {
    console.error("회원가입 오류:", error);
    res.status(500).json({ message: "회원가입에 실패했습니다." });
  }
});

// 로그인
app.post("/api/auth/login", async (req, res) => {
  const username = String(req.body.username || "").trim();
  const password = String(req.body.password || "");

  if (!username || !password) {
    return res.status(400).json({ message: "아이디와 비밀번호를 입력해 주세요." });
  }

  try {
    const [[user]] = await pool.query(
      "SELECT id, username, nickname, password FROM users WHERE username = ? LIMIT 1",
      [username]
    );

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "아이디 또는 비밀번호가 맞지 않아요." });
    }

    req.session.user = { id: user.id, username: user.username, nickname: user.nickname };
    res.json({ user: req.session.user });
  } catch (error) {
    console.error("로그인 오류:", error);
    res.status(500).json({ message: "로그인에 실패했습니다." });
  }
});

// 현재 로그인 사용자 조회
app.get("/api/auth/me", requireAuth, async (req, res) => {
  try {
    const [[user]] = await pool.query(
      `SELECT id, username, nickname, created_at
       FROM users
       WHERE id = ?`,
      [req.session.user.id]
    );

    if (!user) {
      return res.status(404).json({ message: "회원을 찾을 수 없습니다." });
    }

    res.json({ user });
  } catch (error) {
    console.error("회원 정보 조회 오류:", error);
    res.status(500).json({ message: "회원 정보 조회에 실패했습니다." });
  }
});

// 로그아웃
app.post("/api/auth/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error("로그아웃 오류:", error);
      return res.status(500).json({ message: "로그아웃에 실패했습니다." });
    }
    res.clearCookie("connect.sid");
    res.json({ message: "로그아웃되었습니다." });
  });
});

// 독서 기록 조회
app.get("/api/records", requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, title, author, summary, impression, completed_at, created_at, updated_at
      FROM reading_records
      WHERE user_id = ?
      ORDER BY completed_at DESC, id DESC
    `, [req.session.user.id]);
    res.json(rows);
  } catch (error) {
    console.error("독서 기록 조회 오류:", error);
    res.status(500).json({ message: "독서 기록을 불러오지 못했습니다." });
  }
});

// 독서 기록 저장
app.post("/api/records", requireAuth, async (req, res) => {
  const { title, author, summary, impression, completed_at } = req.body;

  if (!title?.trim() || !author?.trim() || !summary?.trim() || !impression?.trim() || !completed_at) {
    return res.status(400).json({ message: "모든 항목을 입력해 주세요." });
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO reading_records (user_id, title, author, summary, impression, completed_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.session.user.id, title.trim(), author.trim(), summary.trim(), impression.trim(), completed_at]
    );
    res.status(201).json({ message: "독서 기록이 저장되었습니다.", id: result.insertId });
  } catch (error) {
    console.error("독서 기록 저장 오류:", error);
    res.status(500).json({ message: "독서 기록 저장에 실패했습니다." });
  }
});

// 독서 기록 수정
app.put("/api/records/:id", requireAuth, async (req, res) => {
  const { title, author, summary, impression, completed_at } = req.body;

  if (!title?.trim() || !author?.trim() || !summary?.trim() || !impression?.trim() || !completed_at) {
    return res.status(400).json({ message: "모든 항목을 입력해 주세요." });
  }

  try {
    const [result] = await pool.execute(
      `UPDATE reading_records
       SET title = ?, author = ?, summary = ?, impression = ?, completed_at = ?
       WHERE id = ? AND user_id = ?`,
      [title.trim(), author.trim(), summary.trim(), impression.trim(), completed_at, req.params.id, req.session.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "해당 독서 기록을 찾을 수 없습니다." });
    }

    res.json({ message: "독서 기록이 수정되었습니다." });
  } catch (error) {
    console.error("독서 기록 수정 오류:", error);
    res.status(500).json({ message: "독서 기록 수정에 실패했습니다." });
  }
});

// 독서 기록 삭제
app.delete("/api/records/:id", requireAuth, async (req, res) => {
  try {
    const [result] = await pool.execute(
      "DELETE FROM reading_records WHERE id = ? AND user_id = ?",
      [req.params.id, req.session.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "해당 독서 기록을 찾을 수 없습니다." });
    }

    res.json({ message: "독서 기록이 삭제되었습니다." });
  } catch (error) {
    console.error("독서 기록 삭제 오류:", error);
    res.status(500).json({ message: "독서 기록 삭제에 실패했습니다." });
  }
});

// 월간 독서 목표 조회
app.get("/api/goals", requireAuth, async (req, res) => {
  const year = Number(req.query.year);
  const month = Number(req.query.month);
  if (!year || !month || month < 1 || month > 12) {
    return res.status(400).json({ message: "연도와 월을 확인해 주세요." });
  }

  const goalMonth = `${year}-${String(month).padStart(2, "0")}`;

  try {
    const [[row]] = await pool.query(
      `SELECT target_count FROM reading_goals
       WHERE user_id = ? AND goal_month = ?
       ORDER BY id DESC LIMIT 1`,
      [req.session.user.id, goalMonth]
    );
    res.json({ goal: row ? Number(row.target_count) : 4 });
  } catch (error) {
    console.error("독서 목표 조회 오류:", error);
    res.status(500).json({ message: "독서 목표를 불러오지 못했습니다." });
  }
});

// 월간 독서 목표 저장
app.put("/api/goals", requireAuth, async (req, res) => {
  const year = Number(req.body.year);
  const month = Number(req.body.month);
  const goal = Number(req.body.goal);

  if (!year || !month || month < 1 || month > 12 || !goal || goal < 1 || goal > 30) {
    return res.status(400).json({ message: "독서 목표는 1~30권 사이로 설정해 주세요." });
  }

  const goalMonth = `${year}-${String(month).padStart(2, "0")}`;

  try {
    const [[existing]] = await pool.query(
      `SELECT id FROM reading_goals
       WHERE user_id = ? AND goal_month = ?
       ORDER BY id DESC LIMIT 1`,
      [req.session.user.id, goalMonth]
    );

    if (existing) {
      await pool.execute(
        "UPDATE reading_goals SET target_count = ? WHERE id = ?",
        [goal, existing.id]
      );
    } else {
      await pool.execute(
        "INSERT INTO reading_goals (user_id, goal_month, target_count) VALUES (?, ?, ?)",
        [req.session.user.id, goalMonth, goal]
      );
    }

    res.json({ goal });
  } catch (error) {
    console.error("독서 목표 저장 오류:", error);
    res.status(500).json({ message: "독서 목표 저장에 실패했습니다." });
  }
});

// 추천 도서 조회
app.get("/api/recommendations", requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, title, author, category, description
      FROM recommended_books
      ORDER BY display_order ASC, id ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error("추천 도서 조회 오류:", error);
    res.status(500).json({ message: "추천 도서를 불러오지 못했습니다." });
  }
});

app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});

// 회원 정보 수정
app.put("/api/auth/me", requireAuth, async (req, res) => {
  const nickname = String(req.body.nickname || "").trim();

  if (nickname.length < 2 || nickname.length > 12) {
    return res.status(400).json({
      message: "닉네임은 2~12자로 입력해 주세요."
    });
  }

  try {
    await pool.execute(
      `UPDATE users
       SET nickname = ?
       WHERE id = ?`,
      [nickname, req.session.user.id]
    );

    // 세션의 닉네임도 변경
    req.session.user.nickname = nickname;

    res.json({
      message: "회원 정보가 수정되었습니다.",
      user: req.session.user
    });
  } catch (error) {
    console.error("회원 정보 수정 오류:", error);
    res.status(500).json({
      message: "회원 정보 수정에 실패했습니다."
    });
  }
});


// 회원 탈퇴
app.delete("/api/auth/me", requireAuth, async (req, res) => {
  try {
    await pool.execute(
      `DELETE FROM users
       WHERE id = ?`,
      [req.session.user.id]
    );

    req.session.destroy((error) => {
      if (error) {
        console.error("세션 삭제 오류:", error);
        return res.status(500).json({
          message: "회원 탈퇴 후 세션 삭제에 실패했습니다."
        });
      }

      res.clearCookie("connect.sid");
      res.json({
        message: "회원 탈퇴가 완료되었습니다."
      });
    });
  } catch (error) {
    console.error("회원 탈퇴 오류:", error);
    res.status(500).json({
      message: "회원 탈퇴에 실패했습니다."
    });
  }
});