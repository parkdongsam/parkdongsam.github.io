/*
 * 청첩장 내용 — 바꿀 것은 전부 이 파일에만 있다.
 * 이름·날짜·장소·계좌·사진 경로. 마크업과 스타일은 건드리지 않아도 된다.
 */
window.WEDDING = {
  groom: {
    name: '김진호',
    short: '진호',
    parents: ['김건호', '이미자'],
    relation: '아들',
  },
  bride: {
    name: '이나은',
    short: '나은',
    parents: ['이주명', '유수지'],
    relation: '딸',
  },

  date: {
    // KST. 요일은 검증 완료 (2026-10-24 = 토요일).
    iso: '2026-10-24T12:30:00+09:00',
    year: 2026,
    month: 10,
    day: 24,
    weekdayKo: '토요일',
    timeKo: '낮 12시 30분',
  },

  quote: {
    lines: [
      '저절로 웃음이 났다.',
      '웃는 남자를 보고 여자도 웃었다.',
      '마음에 꽃이 피는 것 같았다.',
      '정말로 봄이었다.',
    ],
    source: '정현주 〈다시, 사랑〉 중에서',
  },

  invitation: [
    '둘이 함께 맞이하는 3번째 봄,',
    '저희 두 사람 결혼합니다.',
    '앞으로 맞이할 저희의 봄날을 축복해주세요.',
  ],

  venue: {
    name: '더채플앳청담 커티지홀',
    floor: '3층',
    address: '서울 강남구 선릉로 757',
    tel: '02-000-0000',
    // 지도 앱 검색어. 좌표가 확정되면 아래 links 를 좌표 링크로 바꾸면 된다.
    query: '더채플앳청담',
    links: {
      naver: 'https://map.naver.com/p/search/더채플앳청담',
      kakao: 'https://map.kakao.com/link/search/더채플앳청담',
      tmap: 'tmap://search?name=더채플앳청담',
    },
    // 약도 이미지가 준비되면 경로를 넣는다. null 이면 버튼이 숨겨진다.
    sketchImage: null,
  },

  transit: {
    subway: [
      { line: '7호선', text: '강남구청역 3-1번 출구' },
      { line: '분당선', text: '강남구청역 3-1번 출구' },
    ],
    subwayNote: '좌측 방향 570M 도보 후 좌측 건물',
    bus: [
      { kind: '간선버스', text: '301, 342, 472' },
      { kind: '지선버스', text: '3011, 4312' },
    ],
    shuttle: ['셔틀버스 수시 운행', '강남구청역(7호선, 분당선) 3번 출구 앞'],
  },

  info: [
    {
      title: '포토부스 이용안내',
      body: [
        '포토부스가 설치될 예정입니다.',
        '귀한 발걸음 해주신 여러분의',
        '환한 미소와 따뜻한 말씀 남겨주시면',
        '소중히 간직하도록 하겠습니다.',
      ],
    },
  ],

  // 사진이 준비되면 경로만 교체. 세로 3:4 권장.
  gallery: [
    'images/ph-1.svg',
    'images/ph-2.svg',
    'images/ph-3.svg',
    'images/ph-4.svg',
    'images/ph-5.svg',
  ],

  accountNote: [
    '참석이 어려우신 분들을 위해',
    '계좌번호를 기재하였습니다.',
    '너그러운 마음으로 양해 부탁드립니다.',
  ],
  accounts: {
    groom: [
      { holder: '김진호', bank: '신한은행', number: '110-000-000000', kakaopay: null },
    ],
    bride: [
      { holder: '이나은', bank: '국민은행', number: '000000-00-000000', kakaopay: null },
    ],
  },
};
