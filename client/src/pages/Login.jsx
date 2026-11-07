import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiArrowRight } from 'react-icons/fi';
import { colors, media } from '../styles/theme';
import { useAuth } from '../context/AuthContext';

const Page = styled.main`
  min-height: calc(100vh - 64px);
  display: grid;
  place-items: center;
  padding: 48px 24px;
  background: ${colors.beige100};
`;

const Card = styled.section`
  width: 100%;
  max-width: 430px;
  padding: 42px 40px 38px;
  border: 1px solid ${colors.beige300};
  border-radius: 20px;
  background: ${colors.ivory};
  box-shadow: 0 18px 50px rgba(82, 71, 52, 0.08);

  ${media.mobile} {
    padding: 32px 22px;
    border-radius: 16px;
  }
`;

const Brand = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: ${colors.sage900};
  font-size: 19px;
  font-weight: 800;

  span {
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    background: ${colors.sage600};
    color: ${colors.ivory};
    font-size: 14px;
  }
`;

const Heading = styled.div`
  margin: 34px 0 26px;
  h1 {
    color: ${colors.sage900};
    font-size: 28px;
    letter-spacing: -0.04em;
  }
  p {
    margin-top: 9px;
    color: ${colors.textSub};
    line-height: 1.6;
  }
`;

const Field = styled.label`
  display: block;
  margin-bottom: 18px;
  color: ${colors.textSub};
  font-size: 13px;
  font-weight: 600;

  input {
    display: block;
    width: 100%;
    height: 48px;
    margin-top: 8px;
    padding: 0 14px;
    border: 1px solid ${colors.lineStrong};
    border-radius: 9px;
    background: ${colors.white};
    color: ${colors.text};
    outline: none;
  }

  input:focus {
    border-color: ${colors.sage500};
    box-shadow: 0 0 0 3px rgba(125, 149, 119, 0.12);
  }
`;

const ErrorText = styled.div`
  margin: 2px 0 16px;
  padding: 12px 14px;
  border-radius: 9px;
  background: #fbefed;
  color: ${colors.danger};
  font-size: 13px;
  line-height: 1.5;
`;

const Submit = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 50px;
  margin-top: 4px;
  border: 0;
  border-radius: 10px;
  background: ${colors.sage700};
  color: ${colors.ivory};
  font-weight: 700;

  &:hover:not(:disabled) { background: ${colors.sage900}; }
  &:disabled { opacity: 0.5; cursor: default; }
`;

const Bottom = styled.p`
  margin-top: 22px;
  color: ${colors.textMuted};
  font-size: 13px;
  text-align: center;

  a {
    color: ${colors.sage700};
    font-weight: 700;
  }
`;

function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  function change(event) {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      await login(form.username, form.password);
      const destination = location.state?.from || '/';
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Page>
      <Card>
        <Brand><span>P</span>PageLog</Brand>
        <Heading>
          <h1>다시 만나서 반가워요.</h1>
          <p>읽은 책과 생각을 이어서 기록해 보세요.</p>
        </Heading>
        <form onSubmit={submit}>
          <Field>
            아이디
            <input name="username" value={form.username} onChange={change} autoComplete="username" required />
          </Field>
          <Field>
            비밀번호
            <input name="password" type="password" value={form.password} onChange={change} autoComplete="current-password" required />
          </Field>
          {error && <ErrorText role="alert">{error}</ErrorText>}
          <Submit type="submit" disabled={saving}>
            {saving ? '로그인 중...' : '로그인'} <FiArrowRight size={16} />
          </Submit>
        </form>
        <Bottom>계정이 없나요? <Link to="/signup">회원가입</Link></Bottom>
      </Card>
    </Page>
  );
}

export default Login;
