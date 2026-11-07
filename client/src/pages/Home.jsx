import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  FiCalendar,
  FiMessageSquare,
  FiChevronLeft,
  FiChevronRight,
  FiPause,
  FiPlay,
  FiMinus,
  FiPlus,
} from 'react-icons/fi';
import BookCover from '../components/BookCover';
import Section from '../components/Section';
import { colors, layout, media } from '../styles/theme';
import {
  fetchRecords,
  sortByCompleted,
  toLocalMonth,
  formatKoreanDate,
  fetchRecommendations,
  fetchGoal,
  saveGoal,
} from '../utils/records';

const Page = styled.div`
  max-width: ${layout.maxWidth};
  margin: 0 auto;
  padding: 24px ${layout.gutter} 0;

  ${media.mobile} {
    padding: 12px ${layout.gutterMobile} 0;
  }
`;

/* ───────── 메인 배너 ───────── */

const Banner = styled.section`
  position: relative;
  height: 320px;
  overflow: hidden;
  border-radius: 16px;

  ${media.mobile} {
    height: 260px;
  }
`;

const Slide = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  padding: 0 64px;
  background: ${({ $bg }) => $bg};
  color: ${({ $fg }) => $fg};
  opacity: ${({ $active }) => ($active ? 1 : 0)};
  transform: ${({ $active }) => ($active ? 'translateX(0)' : 'translateX(18px)')};
  pointer-events: ${({ $active }) => ($active ? 'auto' : 'none')};
  transition: opacity 0.45s ease, transform 0.45s ease;

  ${media.tablet} {
    padding: 0 36px;
  }

  ${media.mobile} {
    padding: 28px 22px 56px;
    align-items: flex-start;
  }
`;

const SlideText = styled.div`
  min-width: 0;
  max-width: 520px;

  .label {
    font-size: 14px;
    font-weight: 600;
    opacity: 0.8;
  }

  h2 {
    margin-top: 10px;
    font-size: 34px;
    font-weight: 700;
    line-height: 1.32;
    letter-spacing: -0.04em;
    word-break: keep-all;
  }

  .quote {
    display: -webkit-box;
    overflow: hidden;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    font-size: 28px;
  }

  .sub {
    margin-top: 12px;
    font-size: 15px;
    opacity: 0.85;
  }

  ${media.mobile} {
    h2 {
      font-size: 24px;
    }

    .quote {
      font-size: 20px;
    }

    .sub {
      font-size: 13px;
    }
  }
`;

const SlideButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  height: 40px;
  margin-top: 22px;
  padding: 0 18px;
  border-radius: 20px;
  background: ${({ $dark }) => ($dark ? colors.sage900 : colors.white)};
  color: ${({ $dark }) => ($dark ? colors.white : colors.sage900)};
  font-size: 14px;
  font-weight: 600;

  ${media.mobile} {
    height: 36px;
    margin-top: 16px;
    font-size: 13px;
  }
`;

const Goal = styled.div`
  margin-top: 22px;
  width: min(360px, 100%);

  .track {
    height: 6px;
    overflow: hidden;
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.7);
  }

  .bar {
    height: 100%;
    border-radius: inherit;
    background: ${colors.sage600};
    transition: width 0.4s ease;
  }

  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: 10px;
    font-size: 13px;
  }

  .edit {
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    font-size: 12px;
    font-weight: 600;
    text-decoration: underline;
    text-underline-offset: 3px;
    opacity: 0.8;
  }

  .stepper {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  button {
    display: grid;
    place-items: center;
    width: 24px;
    height: 24px;
    padding: 0;
    border: 1px solid rgba(47, 61, 47, 0.3);
    border-radius: 50%;
    background: transparent;
    color: inherit;
  }

  button:disabled {
    opacity: 0.35;
    cursor: default;
  }

  ${media.mobile} {
    margin-top: 16px;
  }
`;

const SlideVisual = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 14px;
  flex-shrink: 0;

  ${media.tablet} {
    > :nth-child(3) {
      display: none;
    }
  }

  ${media.mobile} {
    display: none;
  }
`;

const EmptyShelf = styled.div`
  width: 132px;
  aspect-ratio: 176 / 260;
  border: 1.5px dashed currentColor;
  border-radius: 6px;
  opacity: 0.35;
`;

const BannerControls = styled.div`
  position: absolute;
  left: 64px;
  bottom: 24px;
  display: flex;
  align-items: center;
  height: 30px;
  padding: 0 4px;
  border-radius: 15px;
  background: rgba(0, 0, 0, 0.32);
  color: ${colors.white};
  font-size: 12px;

  button {
    display: grid;
    place-items: center;
    width: 26px;
    height: 26px;
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
  }

  span {
    min-width: 34px;
    text-align: center;
    font-variant-numeric: tabular-nums;
  }

  .dots {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-left: 2px;
    padding-left: 4px;
    border-left: 1px solid rgba(255, 255, 255, 0.3);
  }

  .dots button {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    transition: width 0.2s, background 0.2s;
  }

  .dots button.active {
    width: 16px;
    border-radius: 3px;
    background: ${colors.white};
  }

  ${media.tablet} {
    left: 36px;
  }

  ${media.mobile} {
    left: 22px;
    bottom: 16px;
  }
`;

/* ───────── 가로 책장 ───────── */

const Shelf = styled.div`
  display: flex;
  gap: 18px;
  overflow-x: auto;
  margin: 0 -${layout.gutter};
  padding: 0 ${layout.gutter} 4px;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  ${media.mobile} {
    gap: 12px;
    margin: 0 -${layout.gutterMobile};
    padding: 0 ${layout.gutterMobile} 4px;
  }
`;

const ShelfItem = styled(Link)`
  flex: 0 0 150px;
  min-width: 0;
  scroll-snap-align: start;

  &:hover .cover {
    transform: translateY(-3px);
  }

  .cover {
    transition: transform 0.2s;
  }

  .title {
    display: -webkit-box;
    overflow: hidden;
    margin-top: 10px;
    color: ${colors.text};
    font-size: 14px;
    font-weight: 500;
    line-height: 1.4;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .meta {
    margin-top: 4px;
    overflow: hidden;
    color: ${colors.textMuted};
    font-size: 12px;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  ${media.mobile} {
    flex-basis: 108px;

    .title {
      font-size: 13px;
    }
  }
`;

/* ───────── 한 줄 감상 카드 ───────── */

const QuoteGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;

  ${media.tablet} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  ${media.mobile} {
    display: flex;
    overflow-x: auto;
    gap: 12px;
    margin: 0 -${layout.gutterMobile};
    padding: 0 ${layout.gutterMobile};
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

const QuoteCard = styled(Link)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 220px;
  padding: 22px 20px 18px;
  border-radius: 12px;
  background: ${({ $tone }) => $tone};
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-3px);
  }

  blockquote {
    display: -webkit-box;
    overflow: hidden;
    margin: 0;
    color: ${colors.text};
    font-size: 16px;
    font-weight: 500;
    line-height: 1.6;
    word-break: keep-all;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
  }

  .book {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 18px;
    min-width: 0;
  }

  .book div {
    min-width: 0;
  }

  strong,
  span {
    display: block;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  strong {
    color: ${colors.text};
    font-size: 13px;
    font-weight: 600;
  }

  span {
    margin-top: 2px;
    color: ${colors.textMuted};
    font-size: 12px;
  }

  ${media.mobile} {
    flex: 0 0 240px;
    min-height: 200px;
  }
`;

/* ───────── 추천 도서 랭킹 ───────── */

const Chips = styled.div`
  display: flex;
  gap: 6px;
  overflow-x: auto;
  margin-bottom: 20px;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Chip = styled.button`
  flex-shrink: 0;
  height: 32px;
  padding: 0 14px;
  border: 1px solid ${({ $active }) => ($active ? colors.sage600 : colors.lineStrong)};
  border-radius: 16px;
  background: ${({ $active }) => ($active ? colors.sage600 : colors.white)};
  color: ${({ $active }) => ($active ? colors.white : colors.textSub)};
  font-size: 13px;
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
`;

const RankGrid = styled.ol`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-auto-flow: column;
  grid-template-rows: repeat(${({ $rows }) => $rows}, auto);
  gap: 20px 32px;
  margin: 0;
  padding: 0;
  list-style: none;

  ${media.tablet} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: repeat(${({ $rowsTablet }) => $rowsTablet}, auto);
  }

  ${media.mobile} {
    grid-template-columns: minmax(0, 1fr);
    grid-auto-flow: row;
    grid-template-rows: none;
    gap: 16px;
  }
`;

const RankItem = styled.li`
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;

  .rank {
    flex-shrink: 0;
    width: 22px;
    color: ${colors.text};
    font-size: 18px;
    font-weight: 700;
    text-align: center;
  }

  .info {
    min-width: 0;
  }

  .title,
  .author,
  .desc {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .title {
    color: ${colors.text};
    font-size: 15px;
    font-weight: 600;
  }

  .author {
    margin-top: 3px;
    color: ${colors.textMuted};
    font-size: 13px;
  }

  .desc {
    margin-top: 6px;
    color: ${colors.textSub};
    font-size: 12px;
  }
`;

/* ───────── 상태 ───────── */

const Empty = styled.div`
  padding: 40px 20px;
  border-radius: 12px;
  background: ${colors.fill};
  color: ${colors.textMuted};
  font-size: 14px;
  line-height: 1.7;
  text-align: center;

  a {
    display: inline-block;
    margin-top: 10px;
    color: ${colors.sage600};
    font-weight: 600;
  }
`;

const Toast = styled.div`
  position: fixed;
  left: 50%;
  bottom: 32px;
  z-index: 100;
  transform: translateX(-50%);
  padding: 13px 20px;
  border-radius: 8px;
  background: ${colors.sage900};
  color: ${colors.white};
  font-size: 14px;
  white-space: nowrap;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
`;

const fallbackRecommendations = [
  { title: '어린 왕자', author: '앙투안 드 생텍쥐페리', category: '소설', description: '마음으로 보아야 잘 보인다는 것' },
  { title: '사피엔스', author: '유발 하라리', category: '인문', description: '인류는 어떻게 지구의 지배자가 되었나' },
  { title: '언어의 온도', author: '이기주', category: '에세이', description: '말과 글에 담긴 따뜻함과 차가움' },
];

const defaultCategories = ['종합', '소설', '인문', '에세이'];
const quoteTones = [colors.beige100, colors.sage50, colors.beige200, colors.sage100];
const SLIDE_COUNT = 3;

function Home() {
  const location = useLocation();
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendationLoading, setRecommendationLoading] = useState(true);
  const [error, setError] = useState('');
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [category, setCategory] = useState('종합');
  const [toast, setToast] = useState(location.state?.savedMessage || '');
  const [goalEditing, setGoalEditing] = useState(false);

  const [goal, setGoal] = useState(4);

  useEffect(() => {
    let ignore = false;

    fetchRecords()
      .then((data) => {
        if (!ignore) setRecords(sortByCompleted(data));
      })
      .catch((err) => {
        console.error('독서 기록 조회 오류:', err);
        if (!ignore) setError('서버에 연결할 수 없어요. 서버가 실행 중인지 확인해 주세요.');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  // 저장 직후 넘어온 메시지는 한 번만 보여주고 기록에서 지웁니다.
  useEffect(() => {
    let ignore = false;
    const now = new Date();
    fetchGoal(now.getFullYear(), now.getMonth() + 1)
      .then((data) => {
        if (!ignore) setGoal(Number(data.goal) || 4);
      })
      .catch((err) => console.error('독서 목표 조회 오류:', err));
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    let ignore = false;

    fetchRecommendations()
      .then((data) => {
        if (!ignore) setRecommendations(data);
      })
      .catch((err) => {
        console.error('추천 도서 조회 오류:', err);
        if (!ignore) setRecommendations(fallbackRecommendations);
      })
      .finally(() => {
        if (!ignore) setRecommendationLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!location.state?.savedMessage) return;
    navigate(location.pathname, { replace: true, state: null });
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => setSlide((s) => (s + 1) % SLIDE_COUNT), 5000);
    return () => clearInterval(timer);
  }, [paused]);

  async function changeGoal(delta) {
    const next = Math.min(30, Math.max(1, goal + delta));
    if (next === goal) return;
    setGoal(next);
    const now = new Date();
    try {
      await saveGoal(now.getFullYear(), now.getMonth() + 1, next);
    } catch (err) {
      console.error('독서 목표 저장 오류:', err);
    }
  }

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthLabel = `${now.getMonth() + 1}월`;

  const monthlyRecords = useMemo(
    () => records.filter((r) => toLocalMonth(r.completed_at) === currentMonth),
    [records, currentMonth]
  );

  const progress = Math.min(100, Math.round((monthlyRecords.length / goal) * 100));
  const remaining = Math.max(0, goal - monthlyRecords.length);
  const latest = records[0];
  const quoted = records.find((r) => r.impression?.trim());

  const categories = [...new Set([
    ...defaultCategories,
    ...recommendations.map((book) => book.category).filter(Boolean),
  ])];

  const rankedBooks = recommendations.filter(
    (book) => category === '종합' || book.category === category
  );

  return (
    <Page>
      <Banner aria-roledescription="carousel" aria-label="나의 독서 소식">
        <Slide $active={slide === 0} $bg={colors.sage100} $fg={colors.sage900}>
          <SlideText>
            <div className="label">{monthLabel} 독서 목표</div>
            <h2>
              이번 달 {monthlyRecords.length}권을 읽었어요
            </h2>
            <p className="sub">
              {remaining > 0
                ? `목표까지 ${remaining}권 남았어요. 오늘도 한 페이지씩!`
                : '이번 달 목표를 달성했어요. 정말 멋져요!'}
            </p>
            <Goal>
              <div className="track">
                <div className="bar" style={{ width: `${progress}%` }} />
              </div>
              <div className="row">
                <span>{progress}% 달성</span>
                {goalEditing ? (
                  <div className="stepper">
                    <button
                      type="button"
                      onClick={() => changeGoal(-1)}
                      disabled={goal <= 1}
                      aria-label="목표 한 권 줄이기"
                    >
                      <FiMinus size={12} />
                    </button>
                    <span>목표 {goal}권</span>
                    <button
                      type="button"
                      onClick={() => changeGoal(1)}
                      disabled={goal >= 30}
                      aria-label="목표 한 권 늘리기"
                    >
                      <FiPlus size={12} />
                    </button>
                    <button
                      type="button"
                      className="edit"
                      onClick={() => setGoalEditing(false)}
                    >
                      완료
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="edit"
                    onClick={() => setGoalEditing(true)}
                  >
                    목표 수정
                  </button>
                )}
              </div>
            </Goal>
          </SlideText>
          <SlideVisual>
            {monthlyRecords.length > 0
              ? monthlyRecords.slice(0, 3).map((r) => (
                  <BookCover key={r.id} title={r.title} author={r.author} width={132} font={14} />
                ))
              : [0, 1, 2].map((i) => <EmptyShelf key={i} />)}
          </SlideVisual>
        </Slide>

        <Slide $active={slide === 1} $bg={colors.beige200} $fg={colors.sage900}>
          <SlideText>
            <div className="label">최근 완독한 책</div>
            {latest ? (
              <>
                <h2>{latest.title}</h2>
                <p className="sub">
                  {latest.author} · {formatKoreanDate(latest.completed_at)} 완독
                </p>
                <SlideButton to={`/library?id=${latest.id}`} $dark>
                  기록 다시 보기
                </SlideButton>
              </>
            ) : (
              <>
                <h2>
                  첫 번째 책을
                  <br />
                  기록해 보세요
                </h2>
                <p className="sub">작은 기록이 모여 나만의 서재가 됩니다.</p>
                <SlideButton to="/records/new" $dark>
                  기록 시작하기
                </SlideButton>
              </>
            )}
          </SlideText>
          <SlideVisual>
            {latest ? (
              <BookCover title={latest.title} author={latest.author} width={176} font={18} />
            ) : (
              <EmptyShelf style={{ width: 176 }} />
            )}
          </SlideVisual>
        </Slide>

        <Slide $active={slide === 2} $bg={colors.sage700} $fg={colors.beige100}>
          <SlideText>
            <div className="label">나의 한 줄</div>
            {quoted ? (
              <>
                <h2 className="quote">“{quoted.impression}”</h2>
                <p className="sub">
                  {quoted.title} · {quoted.author}
                </p>
              </>
            ) : (
              <>
                <h2>
                  기록이 쌓이면
                  <br />
                  나의 문장이 여기에 보여요
                </h2>
                <p className="sub">책을 덮으며 남긴 생각을 다시 만나 보세요.</p>
              </>
            )}
          </SlideText>
          <SlideVisual>
            {quoted && (
              <BookCover title={quoted.title} author={quoted.author} width={150} font={16} />
            )}
          </SlideVisual>
        </Slide>

        <BannerControls>
          <button
            type="button"
            onClick={() => setSlide((s) => (s + SLIDE_COUNT - 1) % SLIDE_COUNT)}
            aria-label="이전 배너"
          >
            <FiChevronLeft size={14} />
          </button>
          <span aria-live="polite">
            {slide + 1} / {SLIDE_COUNT}
          </span>
          <button
            type="button"
            onClick={() => setSlide((s) => (s + 1) % SLIDE_COUNT)}
            aria-label="다음 배너"
          >
            <FiChevronRight size={14} />
          </button>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? '배너 자동 넘김 재생' : '배너 자동 넘김 멈춤'}
          >
            {paused ? <FiPlay size={12} /> : <FiPause size={12} />}
          </button>
          <div className="dots" aria-label="배너 선택">
            {Array.from({ length: SLIDE_COUNT }).map((_, index) => (
              <button
                key={index}
                type="button"
                className={slide === index ? 'active' : ''}
                onClick={() => setSlide(index)}
                aria-label={`${index + 1}번 배너 보기`}
                aria-current={slide === index ? 'true' : undefined}
              />
            ))}
          </div>
        </BannerControls>
      </Banner>

      <Section
        title="최근 완독한 책"
        description={records.length > 0 ? `지금까지 ${records.length}권을 기록했어요` : undefined}
        moreTo="/library"
      >
        {loading ? (
          <Empty>독서 기록을 불러오는 중이에요...</Empty>
        ) : error ? (
          <Empty>{error}</Empty>
        ) : records.length === 0 ? (
          <Empty>
            아직 기록한 책이 없어요.
            <br />
            <Link to="/records/new">첫 기록 남기기</Link>
          </Empty>
        ) : (
          <Shelf>
            {records.slice(0, 12).map((record) => (
              <ShelfItem key={record.id} to={`/library?id=${record.id}`}>
                <BookCover className="cover" title={record.title} author={record.author} />
                <div className="title">{record.title}</div>
                <div className="meta">{record.author}</div>
              </ShelfItem>
            ))}
          </Shelf>
        )}
      </Section>

      <Section id="quotes" title="나의 한 줄 감상" description="책을 덮으며 남긴 생각들">
        {records.length === 0 ? (
          <Empty>{loading ? '불러오는 중이에요...' : '기록을 남기면 이곳에 감상이 모여요.'}</Empty>
        ) : (
          <QuoteGrid>
            {records.slice(0, 4).map((record, index) => (
              <QuoteCard
                key={record.id}
                to={`/library?id=${record.id}`}
                $tone={quoteTones[index % quoteTones.length]}
              >
                <blockquote>{record.impression}</blockquote>
                <div className="book">
                  <div>
                    <strong>{record.title}</strong>
                    <span>{formatKoreanDate(record.completed_at)}</span>
                  </div>
                </div>
              </QuoteCard>
            ))}
          </QuoteGrid>
        )}
      </Section>

      <Section id="recommend" title="PageLog 추천 도서" description="다음에 읽을 책을 골라 보세요">
        <Chips role="tablist" aria-label="추천 도서 분류">
          {categories.map((name) => (
            <Chip
              key={name}
              type="button"
              role="tab"
              aria-selected={category === name}
              $active={category === name}
              onClick={() => setCategory(name)}
            >
              {name}
            </Chip>
          ))}
        </Chips>

        {recommendationLoading ? (
          <Empty>추천 도서를 불러오는 중이에요...</Empty>
        ) : rankedBooks.length === 0 ? (
          <Empty>현재 분류에 등록된 추천 도서가 없어요.</Empty>
        ) : (
          <RankGrid
            $rows={Math.ceil(rankedBooks.length / 3)}
            $rowsTablet={Math.ceil(rankedBooks.length / 2)}
          >
            {rankedBooks.map((book, index) => (
              <RankItem key={book.id || book.title}>
                <span className="rank">{index + 1}</span>
                <div className="info">
                  <div className="title">{book.title}</div>
                  <div className="author">{book.author}</div>
                  <div className="desc">{book.description}</div>
                </div>
              </RankItem>
            ))}
          </RankGrid>
        )}
      </Section>

      {toast && <Toast role="status">{toast}</Toast>}
    </Page>
  );
}

export default Home;
