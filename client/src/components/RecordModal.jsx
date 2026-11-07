import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FiX, FiEdit3, FiTrash2 } from 'react-icons/fi';
import BookCover from './BookCover';
import { colors, media } from '../styles/theme';
import { formatKoreanDate } from '../utils/records';

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.45);

  ${media.mobile} {
    align-items: flex-end;
    padding: 0;
  }
`;

const Dialog = styled.div`
  position: relative;
  width: 100%;
  max-width: 600px;
  max-height: calc(100vh - 48px);
  overflow-y: auto;
  border-radius: 16px;
  background: ${colors.white};

  ${media.mobile} {
    max-height: 90vh;
    border-radius: 16px 16px 0 0;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 14px;
  right: 14px;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: ${colors.textSub};

  &:hover {
    background: ${colors.fill};
  }
`;

const Top = styled.div`
  display: flex;
  gap: 24px;
  padding: 32px 32px 28px;
  background: ${colors.beige100};

  .info {
    min-width: 0;
    align-self: flex-end;
  }

  h2 {
    color: ${colors.text};
    font-size: 22px;
    font-weight: 700;
    line-height: 1.35;
    letter-spacing: -0.03em;
    word-break: keep-all;
    overflow-wrap: anywhere;
  }

  .author {
    margin-top: 6px;
    color: ${colors.textSub};
    font-size: 14px;
  }

  .date {
    display: inline-block;
    margin-top: 14px;
    padding: 4px 10px;
    border-radius: 12px;
    background: ${colors.white};
    color: ${colors.sage700};
    font-size: 12px;
    font-weight: 600;
  }

  ${media.mobile} {
    gap: 16px;
    padding: 28px 20px 22px;

    h2 {
      font-size: 18px;
    }
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  padding: 0 32px 32px;

  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 42px;
    padding: 0 16px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
  }

  .edit {
    border: 1px solid ${colors.lineStrong};
    background: ${colors.white};
    color: ${colors.textSub};
  }

  .delete {
    border: 0;
    background: #fbefed;
    color: ${colors.danger};
  }

  button:disabled {
    opacity: 0.5;
    cursor: default;
  }

  ${media.mobile} {
    padding: 0 20px 24px;
  }
`;

const Body = styled.div`
  padding: 8px 32px 36px;

  section {
    padding-top: 24px;
  }

  h3 {
    margin-bottom: 10px;
    color: ${colors.sage700};
    font-size: 13px;
    font-weight: 700;
  }

  p {
    color: ${colors.text};
    font-size: 15px;
    line-height: 1.8;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  ${media.mobile} {
    padding: 4px 20px 32px;
  }
`;

function RecordModal({ record, onClose, onEdit, onDelete, deleting = false }) {
  const closeRef = useRef(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    function handleKey(event) {
      if (event.key === 'Escape') onClose();
    }

    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  return (
    <Backdrop onClick={onClose}>
      <Dialog
        role="dialog"
        aria-modal="true"
        aria-labelledby="record-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <CloseButton ref={closeRef} type="button" onClick={onClose} aria-label="닫기">
          <FiX size={20} />
        </CloseButton>

        <Top>
          <BookCover title={record.title} author={record.author} width={120} font={13} />
          <div className="info">
            <h2 id="record-modal-title">{record.title}</h2>
            <div className="author">{record.author}</div>
            <span className="date">{formatKoreanDate(record.completed_at)} 완독</span>
          </div>
        </Top>

        <Body>
          <section>
            <h3>내용 요약</h3>
            <p>{record.summary}</p>
          </section>
          <section>
            <h3>느낀 점</h3>
            <p>{record.impression}</p>
          </section>
        </Body>

        <Actions>
          <button type="button" className="edit" onClick={onEdit} disabled={deleting}>
            <FiEdit3 size={15} />
            수정하기
          </button>
          <button type="button" className="delete" onClick={onDelete} disabled={deleting}>
            <FiTrash2 size={15} />
            {deleting ? '삭제 중...' : '삭제하기'}
          </button>
        </Actions>
      </Dialog>
    </Backdrop>
  );
}

export default RecordModal;
