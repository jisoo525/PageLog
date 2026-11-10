import { useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { colors, layout, media } from '../styles/theme';

const Page = styled.div`
  max-width: 760px;
  margin: 0 auto;
  padding: 64px ${layout.gutter} 100px;

  ${media.mobile} {
    padding: 40px ${layout.gutterMobile} 80px;
  }
`;

const PageTitle = styled.h1`
  margin: 0;
  color: ${colors.sage900};
  font-size: 34px;
  font-weight: 800;
  letter-spacing: -0.04em;
`;

const Description = styled.p`
  margin: 10px 0 36px;
  color: ${colors.textMuted};
  font-size: 15px;
`;

const Card = styled.section`
  padding: 30px;
  margin-bottom: 20px;
  background: ${colors.ivory};
  border: 1px solid ${colors.beige300};
  border-radius: 18px;
  box-shadow: 0 8px 24px rgba(80, 70, 50, 0.06);

  ${media.mobile} {
    padding: 24px 20px;
  }
`;

const CardTitle = styled.h2`
  margin: 0 0 24px;
  color: ${colors.sage900};
  font-size: 18px;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  min-height: 52px;
  border-bottom: 1px solid ${colors.beige300};

  &:last-of-type {
    border-bottom: none;
  }
`;

const Label = styled.span`
  width: 100px;
  color: ${colors.textMuted};
  font-size: 14px;
  font-weight: 600;
`;

const Value = styled.span`
  color: ${colors.text};
  font-size: 15px;
  font-weight: 600;
`;

const NicknameArea = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;

  ${media.mobile} {
    flex-direction: column;
    align-items: stretch;
  }
`;

const Input = styled.input`
  flex: 1;
  min-width: 0;
  height: 40px;
  padding: 0 12px;
  border: 1px solid ${colors.beige300};
  border-radius: 8px;
  background: #fffdf8;
  color: ${colors.text};
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: ${colors.sage500};
    box-shadow: 0 0 0 3px rgba(111, 138, 108, 0.12);
  }
`;

const UpdateButton = styled.button`
  height: 40px;
  padding: 0 16px;
  border: none;
  border-radius: 8px;
  background: ${colors.sage700};
  color: ${colors.ivory};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background: ${colors.sage900};
  }
`;

const DangerCard = styled(Card)`
  background: #fffaf7;
`;

const DangerText = styled.p`
  margin: -10px 0 20px;
  color: ${colors.textMuted};
  font-size: 13px;
  line-height: 1.6;
`;

const DeleteButton = styled.button`
  height: 40px;
  padding: 0 16px;
  border: 1px solid #d9b8a9;
  border-radius: 8px;
  background: transparent;
  color: #9a604d;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background: #fff1eb;
  }
`;

function MyPage() {
  const [user, setUser] = useState(null);
  const [nickname, setNickname] = useState('');

  useEffect(() => {
    axios.get('http://localhost:3000/api/auth/me', {
      withCredentials: true
    })
      .then((res) => {
        setUser(res.data.user);
        setNickname(res.data.user.nickname);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const updateNickname = async () => {
    try {
      await axios.put(
        'http://localhost:3000/api/auth/me',
        { nickname },
        { withCredentials: true }
      );

      alert('닉네임이 수정되었습니다.');

      setUser({
        ...user,
        nickname
      });

      window.location.reload();
    } catch (error) {
      console.error(error);
      alert('수정에 실패했습니다.');
    }
  };

  const deleteAccount = async () => {
    const answer = window.confirm('정말 탈퇴하시겠습니까?');

    if (!answer) return;

    try {
      await axios.delete(
        'http://localhost:3000/api/auth/me',
        { withCredentials: true }
      );

      alert('회원 탈퇴가 완료되었습니다.');
      window.location.href = '/login';
    } catch (error) {
      console.error(error);
      alert('회원 탈퇴에 실패했습니다.');
    }
  };

  if (!user) {
    return <Page>회원 정보를 불러오는 중...</Page>;
  }

  return (
    <Page>
      <PageTitle>마이페이지</PageTitle>
      <Description>나의 회원 정보를 관리해요.</Description>

      <Card>
        <CardTitle>회원 정보</CardTitle>

        <InfoRow>
          <Label>아이디</Label>
          <Value>{user.username}</Value>
        </InfoRow>

        <InfoRow>
          <Label>닉네임</Label>

          <NicknameArea>
            <Input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />

            <UpdateButton onClick={updateNickname}>
              닉네임 수정
            </UpdateButton>
          </NicknameArea>
        </InfoRow>
      </Card>

      <DangerCard>
        <CardTitle>회원 탈퇴</CardTitle>

        <DangerText>
          회원 탈퇴 시 저장된 독서 기록도 함께 삭제됩니다.
        </DangerText>

        <DeleteButton onClick={deleteAccount}>
          회원 탈퇴
        </DeleteButton>
      </DangerCard>
    </Page>
  );
}

export default MyPage;