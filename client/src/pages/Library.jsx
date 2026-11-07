import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { FiSearch, FiX, FiGrid, FiList } from 'react-icons/fi';
import BookCover from '../components/BookCover';
import RecordModal from '../components/RecordModal';
import { colors, layout, media } from '../styles/theme';
import {
  fetchRecords,
  sortByCompleted,
  toLocalDate,
  toLocalMonth,
  formatKoreanDate,
  deleteRecord,
} from '../utils/records';

const Page = styled.div`
  max-width: ${layout.maxWidth};
  margin: 0 auto;
  padding: 40px ${layout.gutter} 0;

  ${media.mobile} {
    padding: 24px ${layout.gutterMobile} 0;
  }
`;

const Title = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;

  h1 {
    color: ${colors.text};
    font-size: 26px;
    font-weight: 700;
    letter-spacing: -0.04em;
  }

  .stats {
    display: flex;
    gap: 20px;
    color: ${colors.textMuted};
    font-size: 13px;
  }

  .stats b {
    margin-left: 4px;
    color: ${colors.sage700};
    font-weight: 700;
  }

  ${media.mobile} {
    h1 {
      font-size: 22px;
    }

    .stats {
      gap: 14px;
    }
  }
`;

const SearchBox = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  height: 46px;
  margin-top: 24px;
  padding: 0 16px;
  border-radius: 8px;
  background: ${colors.fill};
  color: ${colors.textMuted};

  &:focus-within {
    box-shadow: inset 0 0 0 1.5px ${colors.sage500};
  }

  input {
    flex: 1;
    min-width: 0;
    border: 0;
    outline: none;
    background: transparent;
    color: ${colors.text};
    font-size: 15px;
  }

  input::placeholder {
    color: ${colors.textMuted};
  }

  input::-webkit-search-cancel-button {
    display: none;
  }

  button {
    display: grid;
    place-items: center;
    width: 22px;
    height: 22px;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: ${colors.lineStrong};
    color: ${colors.white};
  }
`;

const Chips = styled.div`
  display: flex;
  gap: 6px;
  overflow-x: auto;
  margin-top: 16px;
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

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 28px;
  padding-bottom: 14px;
  border-bottom: 1px solid ${colors.line};
  color: ${colors.textSub};
  font-size: 13px;

  b {
    color: ${colors.text};
  }

  .right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  select {
    border: 0;
    outline: none;
    background: transparent;
    color: ${colors.textSub};
    font-size: 13px;
    cursor: pointer;
  }

  .views {
    display: flex;
    gap: 2px;
  }

  .views button {
    display: grid;
    place-items: center;
    width: 30px;
    height: 30px;
    padding: 0;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: ${colors.textMuted};
  }

  .views button[aria-pressed='true'] {
    background: ${colors.sage50};
    color: ${colors.sage700};
  }
`;

const Grid = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 36px 20px;
  margin: 28px 0 0;
  padding: 0;
  list-style: none;

  ${media.mobile} {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 24px 10px;
  }
`;

const GridItem = styled.button`
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  text-align: left;

  .cover {
    transition: transform 0.2s;
  }

  &:hover .cover {
    transform: translateY(-3px);
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
    .title {
      font-size: 13px;
    }

    .meta {
      font-size: 11px;
    }
  }
`;

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

const ListItem = styled.button`
  display: flex;
  gap: 18px;
  width: 100%;
  padding: 20px 0;
  border: 0;
  border-bottom: 1px solid ${colors.line};
  background: transparent;
  text-align: left;

  .info {
    flex: 1;
    min-width: 0;
  }

  .title {
    overflow: hidden;
    color: ${colors.text};
    font-size: 16px;
    font-weight: 600;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .meta {
    margin-top: 4px;
    color: ${colors.textMuted};
    font-size: 13px;
  }

  .impression {
    display: -webkit-box;
    overflow: hidden;
    margin-top: 10px;
    color: ${colors.textSub};
    font-size: 14px;
    line-height: 1.6;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  &:hover .title {
    color: ${colors.sage700};
  }
`;

const Notice = styled.div`
  margin-top: 28px;
  padding: 64px 20px;
  border-radius: 12px;
  background: ${colors.fill};
  color: ${colors.textMuted};
  font-size: 14px;
  line-height: 1.7;
  text-align: center;

  &.error {
    color: ${colors.danger};
  }

  a,
  button {
    display: inline-block;
    margin-top: 12px;
    padding: 0;
    border: 0;
    background: transparent;
    color: ${colors.sage600};
    font-size: 14px;
    font-weight: 600;
  }
`;

const sorters = {
  latest: (list) => sortByCompleted(list),
  oldest: (list) => sortByCompleted(list).reverse(),
  title: (list) => [...list].sort((a, b) => a.title.localeCompare(b.title, 'ko')),
};

function monthLabel(month) {
  const [year, m] = month.split('-');
  return `${year}년 ${Number(m)}월`;
}

function Library() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('latest');
  const [view, setView] = useState('grid');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  const selectedMonth = searchParams.get('month') || 'all';
  const openId = searchParams.get('id');

  useEffect(() => {
    let ignore = false;

    fetchRecords()
      .then((data) => {
        if (!ignore) setRecords(data);
      })
      .catch((err) => {
        console.error(err);
        if (!ignore) setError('서버에 연결할 수 없어요. 서버가 실행 중인지 확인해 주세요.');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const updateParam = useCallback(
    (key, value) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value) next.set(key, value);
          else next.delete(key);
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const closeModal = useCallback(() => updateParam('id', null), [updateParam]);

  const months = useMemo(() => {
    const set = new Set(records.map((r) => toLocalMonth(r.completed_at)).filter(Boolean));
    return [...set].sort((a, b) => b.localeCompare(a));
  }, [records]);

  const thisYear = String(new Date().getFullYear());
  const yearCount = records.filter((r) => toLocalDate(r.completed_at).startsWith(thisYear)).length;

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const list = records.filter((record) => {
      const matchesSearch =
        !keyword ||
        [record.title, record.author, record.summary, record.impression].some((value) =>
          String(value || '').toLowerCase().includes(keyword)
        );
      const matchesMonth =
        selectedMonth === 'all' || toLocalMonth(record.completed_at) === selectedMonth;
      return matchesSearch && matchesMonth;
    });
    return sorters[sort](list);
  }, [records, search, selectedMonth, sort]);

  const openRecord = records.find((r) => String(r.id) === openId);

  async function handleDelete(record) {
    const confirmed = window.confirm(`"${record.title}" 기록을 삭제할까요?\n삭제하면 다시 복구할 수 없어요.`);
    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteRecord(record.id);
      setRecords((previous) => previous.filter((item) => item.id !== record.id));
      updateParam('id', null);
    } catch (err) {
      window.alert(err.message || '기록을 삭제하지 못했어요.');
    } finally {
      setDeleting(false);
    }
  }

  function handleEdit(record) {
    navigate(`/records/${record.id}/edit`);
  }

  // 목록에 없는 달이 주소로 들어와도 칩으로 선택할 수 있게 포함합니다.
  const monthChips =
    selectedMonth !== 'all' && !months.includes(selectedMonth)
      ? [selectedMonth, ...months]
      : months;

  function resetFilters() {
    setSearch('');
    updateParam('month', null);
  }

  return (
    <Page>
      <Title>
        <h1>내서재</h1>
        <div className="stats">
          <span>전체<b>{records.length}권</b></span>
          <span>올해<b>{yearCount}권</b></span>
        </div>
      </Title>

      <SearchBox>
        <FiSearch size={18} />
        <input
          type="search"
          placeholder="책 제목, 지은이, 기록 내용으로 검색"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="내서재 검색"
        />
        {search && (
          <button type="button" aria-label="검색어 지우기" onClick={() => setSearch('')}>
            <FiX size={13} />
          </button>
        )}
      </SearchBox>

      <Chips role="tablist" aria-label="완독 월">
        <Chip
          type="button"
          role="tab"
          aria-selected={selectedMonth === 'all'}
          $active={selectedMonth === 'all'}
          onClick={() => updateParam('month', null)}
        >
          전체
        </Chip>
        {monthChips.map((month) => (
          <Chip
            key={month}
            type="button"
            role="tab"
            aria-selected={selectedMonth === month}
            $active={selectedMonth === month}
            onClick={() => updateParam('month', month)}
          >
            {monthLabel(month)}
          </Chip>
        ))}
      </Chips>

      <Toolbar>
        <span>
          총 <b>{filtered.length}</b>권
        </span>
        <div className="right">
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="정렬">
            <option value="latest">최근 완독순</option>
            <option value="oldest">오래된순</option>
            <option value="title">제목순</option>
          </select>
          <div className="views">
            <button
              type="button"
              aria-label="표지로 보기"
              aria-pressed={view === 'grid'}
              onClick={() => setView('grid')}
            >
              <FiGrid size={16} />
            </button>
            <button
              type="button"
              aria-label="목록으로 보기"
              aria-pressed={view === 'list'}
              onClick={() => setView('list')}
            >
              <FiList size={16} />
            </button>
          </div>
        </div>
      </Toolbar>

      {loading ? (
        <Notice>독서 기록을 불러오는 중이에요...</Notice>
      ) : error ? (
        <Notice className="error">{error}</Notice>
      ) : filtered.length === 0 ? (
        <Notice>
          {records.length === 0 ? '아직 서재에 꽂힌 책이 없어요.' : '조건에 맞는 기록이 없어요.'}
          <br />
          {records.length === 0 ? (
            <Link to="/records/new">첫 독서 기록 남기기</Link>
          ) : (
            <button type="button" onClick={resetFilters}>
              필터 초기화
            </button>
          )}
        </Notice>
      ) : view === 'grid' ? (
        <Grid>
          {filtered.map((record) => (
            <li key={record.id}>
              <GridItem type="button" onClick={() => updateParam('id', String(record.id))}>
                <BookCover className="cover" title={record.title} author={record.author} />
                <div className="title">{record.title}</div>
                <div className="meta">{formatKoreanDate(record.completed_at)}</div>
              </GridItem>
            </li>
          ))}
        </Grid>
      ) : (
        <List>
          {filtered.map((record) => (
            <li key={record.id}>
              <ListItem type="button" onClick={() => updateParam('id', String(record.id))}>
                <BookCover title={record.title} width={72} font={9} />
                <div className="info">
                  <div className="title">{record.title}</div>
                  <div className="meta">
                    {record.author} · {formatKoreanDate(record.completed_at)} 완독
                  </div>
                  <p className="impression">{record.impression}</p>
                </div>
              </ListItem>
            </li>
          ))}
        </List>
      )}

      {openRecord && (
        <RecordModal
          record={openRecord}
          onClose={closeModal}
          onEdit={() => handleEdit(openRecord)}
          onDelete={() => handleDelete(openRecord)}
          deleting={deleting}
        />
      )}
    </Page>
  );
}

export default Library;
