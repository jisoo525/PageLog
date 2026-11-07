import { useEffect, useState } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import styled from 'styled-components';
import BookCover from '../components/BookCover';
import { colors, layout, media } from '../styles/theme';
import {
  createRecord,
  fetchRecords,
  formatKoreanDate,
  toLocalDate,
  updateRecord,
} from '../utils/records';

const TEXT_LIMIT = 10000;

const Page = styled.div`
  display: grid;
  grid-template-columns: 240px minmax(0, 640px);
  justify-content: center;
  gap: 64px;
  max-width: ${layout.maxWidth};
  margin: 0 auto;
  padding: 48px ${layout.gutter} 0;

  ${media.tablet} {
    grid-template-columns: minmax(0, 640px);
    gap: 0;
  }

  ${media.mobile} {
    padding: 24px ${layout.gutterMobile} 0;
  }
`;

const Preview = styled.aside`
  position: sticky;
  top: 112px;
  align-self: start;

  .label {
    margin-bottom: 14px;
    color: ${colors.textMuted};
    font-size: 13px;
  }

  .title {
    margin-top: 16px;
    color: ${colors.text};
    font-size: 16px;
    font-weight: 600;
    line-height: 1.4;
    word-break: keep-all;
    overflow-wrap: anywhere;
  }

  .meta {
    margin-top: 4px;
    color: ${colors.textMuted};
    font-size: 13px;
  }

  ${media.tablet} {
    display: none;
  }
`;

const Heading = styled.div`
  margin-bottom: 32px;

  h1 {
    color: ${colors.text};
    font-size: 26px;
    font-weight: 700;
    letter-spacing: -0.04em;
  }

  p {
    margin-top: 8px;
    color: ${colors.textMuted};
    font-size: 14px;
  }

  ${media.mobile} {
    margin-bottom: 24px;

    h1 {
      font-size: 22px;
    }
  }
`;

const Group = styled.fieldset`
  margin: 0 0 36px;
  padding: 0;
  border: 0;

  legend {
    width: 100%;
    margin-bottom: 18px;
    padding-bottom: 12px;
    border-bottom: 1px solid ${colors.line};
    color: ${colors.text};
    font-size: 17px;
    font-weight: 700;
  }
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 16px;

  ${media.mobile} {
    grid-template-columns: minmax(0, 1fr);
    gap: 0;
  }
`;

const Field = styled.div`
  margin-bottom: 20px;

  label {
    display: block;
    margin-bottom: 8px;
    color: ${colors.textSub};
    font-size: 13px;
    font-weight: 600;
  }

  label em {
    margin-left: 3px;
    color: ${colors.sage600};
    font-style: normal;
  }

  input,
  textarea {
    display: block;
    width: 100%;
    padding: 0 14px;
    border: 1px solid ${colors.lineStrong};
    border-radius: 8px;
    outline: none;
    background: ${colors.white};
    color: ${colors.text};
    font-size: 15px;
    transition: border-color 0.15s;
  }

  input {
    height: 48px;
  }

  textarea {
    min-height: ${({ $tall }) => ($tall ? '200px' : '140px')};
    padding: 14px;
    line-height: 1.7;
    resize: vertical;
  }

  input:focus,
  textarea:focus {
    border-color: ${colors.sage600};
  }

  input::placeholder,
  textarea::placeholder {
    color: #b5b5b5;
  }

  .count {
    margin-top: 6px;
    color: ${colors.textMuted};
    font-size: 12px;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
`;

const LoadingText = styled.p`
  color: ${colors.textMuted};
  font-size: 14px;
  line-height: 1.7;
`;

const ErrorText = styled.p`
  margin-bottom: 16px;
  padding: 12px 14px;
  border-radius: 8px;
  background: #fbefed;
  color: ${colors.danger};
  font-size: 14px;
`;

const Buttons = styled.div`
  display: flex;
  gap: 10px;

  a,
  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 52px;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 600;
  }

  a {
    width: 120px;
    border: 1px solid ${colors.lineStrong};
    color: ${colors.textSub};
  }

  button {
    flex: 1;
    border: 0;
    background: ${colors.sage600};
    color: ${colors.white};
    transition: background 0.15s;
  }

  button:hover:not(:disabled) {
    background: ${colors.sage700};
  }

  button:disabled {
    background: ${colors.sage300};
    cursor: default;
  }
`;

function RecordCreate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [form, setForm] = useState({
    title: '',
    author: '',
    summary: '',
    impression: '',
    completed_at: new Date().toLocaleDateString('sv-SE'),
  });

  const [saving, setSaving] = useState(false);
  const [loadingRecord, setLoadingRecord] = useState(isEditMode);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEditMode) return;

    let ignore = false;

    fetchRecords()
      .then((records) => {
        const record = records.find((item) => String(item.id) === String(id));
        if (!record) {
          setError('수정할 독서 기록을 찾을 수 없어요.');
          return;
        }

        if (!ignore) {
          setForm({
            title: record.title || '',
            author: record.author || '',
            summary: record.summary || '',
            impression: record.impression || '',
            completed_at: toLocalDate(record.completed_at),
          });
        }
      })
      .catch((err) => {
        if (!ignore) setError(err.message || '기록을 불러오지 못했어요.');
      })
      .finally(() => {
        if (!ignore) setLoadingRecord(false);
      });

    return () => {
      ignore = true;
    };
  }, [id, isEditMode]);

  const isFilled = ['title', 'author', 'summary', 'impression', 'completed_at'].every(
    (key) => form[key].trim()
  );

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!isFilled) {
      setError('모든 항목을 입력해 주세요.');
      return;
    }

    setError('');
    setSaving(true);

    try {
      if (isEditMode) {
        await updateRecord(id, form);
        navigate(`/library?id=${id}`);
      } else {
        await createRecord(form);
        navigate('/', { state: { savedMessage: '독서 기록이 저장되었어요!' } });
      }
    } catch (err) {
      setError(
        err instanceof TypeError
          ? '서버에 연결할 수 없어요. 서버 실행 상태를 확인해 주세요.'
          : err.message
      );
      setSaving(false);
    }
  }

  if (loadingRecord) {
    return (
      <Page>
        <form>
          <Heading>
            <h1>독서 기록 수정</h1>
            <LoadingText>기존 기록을 불러오는 중이에요...</LoadingText>
          </Heading>
        </form>
      </Page>
    );
  }

  return (
    <Page>
      <Preview aria-label="표지 미리보기">
        <div className="label">미리보기</div>
        <BookCover
          title={form.title.trim() || '책 제목'}
          author={form.author.trim() || '지은이'}
          width={240}
          font={22}
        />
        <div className="title">{form.title.trim() || '책 제목'}</div>
        <div className="meta">
          {form.author.trim() || '지은이'}
          {form.completed_at && ` · ${formatKoreanDate(form.completed_at)} 완독`}
        </div>
      </Preview>

      <form onSubmit={handleSubmit} noValidate>
        <Heading>
          <h1>{isEditMode ? '독서 기록 수정' : '독서 기록 쓰기'}</h1>
          <p>{isEditMode ? '기록을 다시 읽고 필요한 내용을 다듬어 보세요.' : '완벽한 글보다 나만의 솔직한 기록이 더 소중해요.'}</p>
        </Heading>

        <Group>
          <legend>책 정보</legend>

          <Field>
            <label htmlFor="title">
              책 제목<em>*</em>
            </label>
            <input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="책 제목을 입력해 주세요"
              maxLength={200}
              required
            />
          </Field>

          <Row>
            <Field>
              <label htmlFor="author">
                지은이<em>*</em>
              </label>
              <input
                id="author"
                name="author"
                value={form.author}
                onChange={handleChange}
                placeholder="지은이를 입력해 주세요"
                maxLength={100}
                required
              />
            </Field>

            <Field>
              <label htmlFor="completed_at">
                완독 날짜<em>*</em>
              </label>
              <input
                id="completed_at"
                name="completed_at"
                type="date"
                value={form.completed_at}
                onChange={handleChange}
                required
              />
            </Field>
          </Row>
        </Group>

        <Group>
          <legend>나의 기록</legend>

          <Field>
            <label htmlFor="summary">
              내용 요약<em>*</em>
            </label>
            <textarea
              id="summary"
              name="summary"
              value={form.summary}
              onChange={handleChange}
              placeholder="책의 주요 내용이나 인상 깊은 장면을 정리해 보세요."
              maxLength={TEXT_LIMIT}
              required
            />
            <div className="count">
              {form.summary.length.toLocaleString()} / {TEXT_LIMIT.toLocaleString()}
            </div>
          </Field>

          <Field $tall>
            <label htmlFor="impression">
              느낀 점<em>*</em>
            </label>
            <textarea
              id="impression"
              name="impression"
              value={form.impression}
              onChange={handleChange}
              placeholder="새롭게 알게 된 점이나 마음에 남은 생각을 적어 보세요."
              maxLength={TEXT_LIMIT}
              required
            />
            <div className="count">
              {form.impression.length.toLocaleString()} / {TEXT_LIMIT.toLocaleString()}
            </div>
          </Field>
        </Group>

        {error && <ErrorText role="alert">{error}</ErrorText>}

        <Buttons>
          <Link to="/">취소</Link>
          <button type="submit" disabled={saving || !isFilled}>
            {saving ? (isEditMode ? '수정 중...' : '저장 중...') : (isEditMode ? '수정 완료하기' : '기록 저장하기')}
          </button>
        </Buttons>
      </form>
    </Page>
  );
}

export default RecordCreate;
