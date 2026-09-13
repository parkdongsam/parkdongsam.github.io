/*
 * 청첩장 내용 — 바꿀 것은 전부 이 파일에만 있다.
 * 출처: 인쇄 청첩장 원고 (2026-09-13 확인). TODO 만 미확정.
 */
window.WEDDING = {
  groom: {
    name: '박동삼',
    short: '동삼',
    parents: ['박종만', '신용선'],
    relation: '아들',
  },
  bride: {
    name: '김연의',
    short: '연의',
    parents: ['김성식', '조미선'],
    relation: '딸',
  },

  date: {
    // KST. 요일 검증 완료 (2026-10-25 = 일요일). 인쇄본과 일치.
    iso: '2026-10-25T13:40:00+09:00',
    year: 2026,
    month: 10,
    day: 25,
    weekdayKo: '일요일',
    timeKo: '오후 1시 40분',
  },

  headline: '저희 결혼합니다',

  // 인용문. 비워두면(lines: []) 블록이 숨겨진다.
  quote: { lines: [], source: '' },

  invitation: [
    '서로 다른 길을 걸어온 두 사람이',
    '이제 두 손을 꼭 잡고 함께 걸어가려 합니다.',
    '저희의 새로운 시작을',
    '따뜻한 마음으로 축복해 주세요.',
  ],

  venue: {
    name: '오펠리스 웨딩컨벤션',
    floor: '20층 라비제홀',
    address: '서울시 중구 세종대로9길 41 퍼시픽타워 20층',
    tel: '02-2130-2300',
    query: '오펠리스웨딩컨벤션',
    links: {
      naver: 'https://map.naver.com/p/search/오펠리스웨딩컨벤션',
      kakao: 'https://map.kakao.com/link/search/오펠리스웨딩컨벤션',
      tmap: 'tmap://search?name=오펠리스웨딩컨벤션',
    },
    // 인쇄 청첩장의 약도. w/h 를 함께 두어 로딩 중 레이아웃이 밀리지 않게 한다.
    sketch: { src: 'images/map-sketch.png', w: 1180, h: 840 },
  },

  transit: {
    subway: [
      { line: '1, 2호선', text: '시청역 9번 출구 (도보 4분)' },
      { line: '1, 4호선', text: '서울역 3번 출구 (도보 10분)' },
    ],
    subwayNote: '',
    bus: [
      { kind: '신한은행본점', text: '[02233] 하차 · 703, 790, 799, 1000, 1200' },
      { kind: '삼성본관앞', text: '[02131] 하차 · 406, 500, 504, 603, 7011, 종로09' },
    ],
    shuttle: [],
    // 버스와 같은 태그+본문 구조. 문장으로 두면 390px 에서 어색하게 접힌다.
    car: [
      { kind: '내비 검색', text: '오펠리스웨딩컨벤션 · 퍼시픽타워 · 세종대로9길 41' },
      { kind: '주차', text: '3시간 무료' },
    ],
  },

  // 안내사항. 비워두면 섹션이 숨겨진다. TODO: 확정 후 채움.
  info: [],

  // TODO: 실제 사진. 세로 3:4 권장. 경로만 교체.
  gallery: [
    'images/ph-1.svg',
    'images/ph-2.svg',
    'images/ph-3.svg',
  ],

  accountNote: [
    '참석이 어려우신 분들을 위해',
    '계좌번호를 기재하였습니다.',
    '너그러운 마음으로 양해 부탁드립니다.',
  ],
  // TODO: 실제 계좌
  accounts: {
    groom: [
      { holder: '박동삼', bank: '은행', number: '000-000-000000', kakaopay: null },
    ],
    bride: [
      { holder: '김연의', bank: '은행', number: '000-000-000000', kakaopay: null },
    ],
  },
};
