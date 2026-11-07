// PageLog 디자인 토큰 — 따뜻한 크림 베이지 + 세이지 그린 + 딥 그린
export const colors = {
  sage900: '#3f5943',
  sage800: '#536b55',
  sage700: '#6f8668',
  sage600: '#82997a',
  sage500: '#9cad94',
  sage300: '#c5d0bd',
  sage100: '#e4eadf',
  sage50: '#f1f4ed',

  beige700: '#85755f',
  beige500: '#b9a486',
  beige300: '#ded2bd',
  beige200: '#ebe2d3',
  beige100: '#f4eee4',
  ivory: '#fbf8f0',

  white: '#ffffff',
  text: '#2d302a',
  textSub: '#615e55',
  textMuted: '#918c80',
  line: '#e8e1d6',
  lineStrong: '#d9d0c2',
  fill: '#f5f0e7',
  danger: '#b84f43',
};

export const layout = {
  maxWidth: '1240px',
  gutter: '24px',
  gutterMobile: '16px',
  headerHeight: '64px',
};

export const media = {
  tablet: '@media (max-width: 960px)',
  mobile: '@media (max-width: 600px)',
};

// 실제 표지 이미지를 찾지 않아도 제목만으로 통일감 있는 PageLog 표지를 만듭니다.
const coverPalettes = [
  ['#82997a', '#fbf8f0', '#d9e1d2'],
  ['#ebe2d3', '#3f5943', '#c9b99f'],
  ['#536b55', '#f4eee4', '#9cad94'],
  ['#c5d0bd', '#3f5943', '#e8eee3'],
  ['#b9a486', '#fbf8f0', '#d6c7ad'],
  ['#f1eadf', '#6f8668', '#d8cfbf'],
  ['#6f8668', '#fbf8f0', '#aebda6'],
  ['#ded2bd', '#3f5943', '#b7a88f'],
];

export function paletteFor(text = '') {
  let hash = 0;
  for (const char of String(text)) hash = (hash * 31 + char.codePointAt(0)) >>> 0;
  return coverPalettes[hash % coverPalettes.length];
}
