import { NavLink, Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiEdit3, FiLogIn, FiLogOut } from 'react-icons/fi';
import { colors, layout, media } from '../styles/theme';
import { useAuth } from '../context/AuthContext';

const HeaderWrapper = styled.header`
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(250, 247, 239, 0.96);
  border-bottom: 1px solid ${colors.beige300};
  backdrop-filter: blur(12px);
`;
const HeaderInner = styled.div`
  display: flex; align-items: center; max-width: ${layout.maxWidth}; height: ${layout.headerHeight};
  margin: 0 auto; padding: 0 ${layout.gutter};
  ${media.mobile} { height: 56px; padding: 0 ${layout.gutterMobile}; }
`;
const Logo = styled(Link)`
  display: flex; align-items: center; gap: 8px; margin-right: 48px; color: ${colors.sage900}; font-size: 20px; font-weight: 800; letter-spacing: -0.04em;
  .mark { display: grid; place-items: center; width: 26px; height: 26px; border-radius: 8px; background: ${colors.sage600}; color: ${colors.ivory}; font-size: 14px; font-weight: 800; }
  ${media.mobile} { margin-right: 20px; font-size: 18px; }
`;
const Navigation = styled.nav`
  display: flex; align-items: stretch; align-self: stretch; gap: 36px;
  ${media.mobile} { gap: 18px; }
`;
const MenuLink = styled(NavLink)`
  position: relative; display: flex; align-items: center; color: ${colors.textMuted}; font-size: 15px; font-weight: 600; transition: color .15s;
  &:hover, &.active { color: ${colors.sage900}; }
  &.active::after { content: ''; position: absolute; left: 0; right: 0; bottom: -1px; height: 2px; background: ${colors.sage600}; }
`;
const UserArea = styled.div`
  display: flex; align-items: center; gap: 10px; margin-left: auto;
  .nickname { color: ${colors.sage700}; font-size: 13px; font-weight: 700; }
  ${media.mobile} { .nickname { display: none; } }
`;
const ActionButton = styled(Link)`
  display: inline-flex; align-items: center; gap: 6px; height: 34px; padding: 0 14px; border-radius: 8px; background: ${colors.sage700}; color: ${colors.ivory}; font-size: 13px; font-weight: 700;
  &:hover { background: ${colors.sage900}; }
  ${media.mobile} { width: 34px; padding: 0; justify-content: center; span { display: none; } }
`;
const LogoutButton = styled.button`
  display: inline-flex; align-items: center; gap: 5px; height: 34px; padding: 0 10px; border: 1px solid ${colors.beige300}; border-radius: 8px; background: transparent; color: ${colors.textSub}; font-size: 12px; font-weight: 600;
  &:hover { background: ${colors.ivory}; color: ${colors.sage900}; }
  ${media.mobile} { width: 34px; padding: 0; justify-content: center; span { display: none; } }
`;

function Header() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <HeaderWrapper>
      <HeaderInner>
        <Logo to="/" aria-label="PageLog 홈"><span className="mark">P</span>PageLog</Logo>
        {!loading && user && (
          <Navigation aria-label="주요 메뉴">
            <MenuLink to="/" end>투데이</MenuLink>
            <MenuLink to="/library">내서재</MenuLink>
            <MenuLink to="/mypage">마이페이지</MenuLink>
          </Navigation>
        )}
        <UserArea>
          {!loading && user ? (
            <>
              <span className="nickname">{user.nickname}님</span>
              <ActionButton to="/records/new" aria-label="독서 기록 쓰기"><FiEdit3 size={15} /><span>기록하기</span></ActionButton>
              <LogoutButton type="button" onClick={handleLogout}><FiLogOut size={14} /><span>로그아웃</span></LogoutButton>
            </>
          ) : !loading ? (
            <ActionButton to="/login"><FiLogIn size={15} /><span>로그인</span></ActionButton>
          ) : null}
        </UserArea>
      </HeaderInner>
    </HeaderWrapper>
  );
}

export default Header;
