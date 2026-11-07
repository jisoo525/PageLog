import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FiChevronRight } from 'react-icons/fi';
import { colors } from '../styles/theme';

const Wrapper = styled.section`
  margin-top: 56px;
  scroll-margin-top: 88px;
`;

const Head = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;

  h2 {
    color: ${colors.text};
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.03em;
  }

  p {
    margin-top: 4px;
    color: ${colors.textMuted};
    font-size: 13px;
  }

  a {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: 2px;
    color: ${colors.textSub};
    font-size: 13px;
  }

  a:hover {
    color: ${colors.text};
  }
`;

// 밀리/리디식 섹션 머리: 굵은 제목 + 회색 부제 + 오른쪽 ‘전체보기 ›’
function Section({ id, title, description, moreTo, moreLabel = '전체보기', children }) {
  return (
    <Wrapper id={id} aria-labelledby={id ? `${id}-title` : undefined}>
      <Head>
        <div>
          <h2 id={id ? `${id}-title` : undefined}>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        {moreTo && (
          <Link to={moreTo}>
            {moreLabel}
            <FiChevronRight size={16} />
          </Link>
        )}
      </Head>
      {children}
    </Wrapper>
  );
}

export default Section;
