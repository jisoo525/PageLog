import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { colors, layout, media } from '../styles/theme';
import { useAuth } from '../context/AuthContext';

const FooterWrapper = styled.footer`
  margin-top: 96px;
  border-top: 1px solid ${colors.line};
  background: ${colors.fill};
`;

const FooterInner = styled.div`
  max-width: ${layout.maxWidth};
  margin: 0 auto;
  padding: 32px ${layout.gutter} 40px;
  color: ${colors.textMuted};
  font-size: 12px;
  line-height: 1.8;

  ${media.mobile} {
    padding: 28px ${layout.gutterMobile} 36px;
  }

  nav {
    display: flex;
    gap: 16px;
    margin-bottom: 14px;
    color: ${colors.textSub};
    font-size: 13px;
    font-weight: 600;
  }

  nav a:hover {
    color: ${colors.text};
  }

  strong {
    display: block;
    margin-bottom: 2px;
    color: ${colors.sage700};
    font-size: 14px;
  }
`;

function Footer() {
  const { user } = useAuth();

  return (
    <FooterWrapper>
      <FooterInner>
        <nav aria-label="하단 메뉴">
          {user ? (
            <>
              <Link to="/">투데이</Link>
              <Link to="/library">내서재</Link>
              <Link to="/records/new">기록하기</Link>
            </>
          ) : (
            <>
              <Link to="/login">로그인</Link>
              <Link to="/signup">회원가입</Link>
            </>
          )}
        </nav>
        <strong>PageLog</strong>
        <p>책을 읽고, 생각을 기록하고, 나만의 서재를 채우다.</p>
        <p>© 2026 PageLog. My Reading Journal.</p>
      </FooterInner>
    </FooterWrapper>
  );
}

export default Footer;
