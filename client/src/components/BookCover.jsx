import styled from 'styled-components';
import { paletteFor } from '../styles/theme';

const Cover = styled.div`
  position: relative;
  width: ${({ $width }) => ($width ? `${$width}px` : '100%')};
  flex-shrink: 0;
  aspect-ratio: 176 / 260;
  overflow: hidden;
  border: 1px solid rgba(63, 89, 67, 0.12);
  border-radius: 8px;
  background: ${({ $bg }) => $bg};
  color: ${({ $fg }) => $fg};
  box-shadow: 0 5px 14px rgba(72, 62, 48, 0.12);
  transition: transform .2s ease, box-shadow .2s ease;

  &::before {
    content: '';
    position: absolute;
    inset: 0 auto 0 0;
    width: 9px;
    background: linear-gradient(90deg, rgba(48, 60, 45, 0.15), rgba(48, 60, 45, 0));
  }

  &::after {
    content: '';
    position: absolute;
    right: 12%;
    bottom: 18%;
    width: 18px;
    height: 18px;
    border: 1px solid ${({ $accent }) => $accent};
    border-left: 0;
    border-bottom: 0;
    border-radius: 50% 50% 0 50%;
    opacity: .55;
    transform: rotate(-18deg);
  }

  .title {
    position: absolute;
    top: 13%;
    left: 14%;
    right: 12%;
    font-size: ${({ $font }) => $font}px;
    font-weight: 750;
    line-height: 1.35;
    letter-spacing: -0.04em;
    word-break: keep-all;
    overflow-wrap: anywhere;
  }

  .rule {
    position: absolute;
    top: 27%;
    left: 14%;
    width: 38%;
    height: 1px;
    background: currentColor;
    opacity: .42;
    box-shadow: 0 5px 0 currentColor;
  }

  .leaf {
    position: absolute;
    top: 24%;
    right: 17%;
    width: 12px;
    height: 19px;
    border: 1px solid ${({ $accent }) => $accent};
    border-radius: 100% 0 100% 0;
    opacity: .55;
    transform: rotate(28deg);
  }

  .leaf::after {
    content: '';
    position: absolute;
    left: 5px;
    top: 2px;
    width: 1px;
    height: 15px;
    background: ${({ $accent }) => $accent};
    transform: rotate(-18deg);
  }

  .author {
    position: absolute;
    left: 14%;
    right: 12%;
    bottom: 10%;
    overflow: hidden;
    font-size: ${({ $font }) => Math.max(8, Math.round($font * .62))}px;
    opacity: .72;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .mini-title {
    position: absolute;
    left: 13%;
    right: 10%;
    top: 17%;
    font-size: ${({ $font }) => Math.max(7, Math.round($font * .62))}px;
    font-weight: 700;
    line-height: 1.3;
    word-break: keep-all;
  }
`;

function BookCover({ title, author, width, font = 15, className }) {
  const [bg, fg, accent] = paletteFor(title);
  const compact = width && width < 80;

  return (
    <Cover
      className={className}
      $width={width}
      $font={font}
      $bg={bg}
      $fg={fg}
      $accent={accent}
      role="img"
      aria-label={`${title} 표지`}
    >
      {compact ? (
        <>
          <span className="mini-title">{title}</span>
          <span className="rule" />
        </>
      ) : (
        <>
          <span className="title">{title}</span>
          <span className="rule" />
          <span className="leaf" />
          {author && <span className="author">{author}</span>}
        </>
      )}
    </Cover>
  );
}

export default BookCover;
