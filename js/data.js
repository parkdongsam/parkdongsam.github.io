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
    // OSM 실측 좌표. 지도 이미지와 링크가 같은 값을 쓴다.
    lat: 37.5613467,
    lon: 126.9729642,
    links: {
      // 네이버는 검색 결과에 예식장이 등록돼 있어 이름 검색이 가장 잘 맞는다.
      naver: 'https://map.naver.com/p/search/오펠리스웨딩컨벤션',
      // 카카오는 link/search 로 보내면 앱 설치 안내 화면에서 끝난다.
      // link/map 은 좌표로 바로 지도를 띄우므로 앱이 없어도 볼 수 있다.
      kakao: 'https://map.kakao.com/link/map/오펠리스웨딩컨벤션,37.5613467,126.9729642',
      // 티맵은 앱 전용 스킴이고, iOS 와 안드로이드가 형식이 서로 다르다.
      // 하나만 쓰면 반대쪽 기기에서는 눌러도 아무 일이 없다.
      // 이름보다 주소로 검색하는 편이 정확히 걸린다.
      tmap: {
        ios: 'tmap://?search=',
        android: 'tmap://search?name=',
        query: '서울 중구 세종대로9길 41',
      },
      // 앱이 없을 때 보낼 곳. 실재 확인함 (iOS 앱 id 431589174,
      // 안드로이드 패키지 com.skt.tmap.ku).
      tmapStore: {
        ios: 'https://apps.apple.com/kr/app/id431589174',
        android: 'https://play.google.com/store/apps/details?id=com.skt.tmap.ku',
      },
    },
    // 인쇄 청첩장의 약도. w/h 를 함께 둬야 로딩 중 레이아웃이 밀리지 않는다.
    maps: [
      { src: 'images/map-sketch.png', w: 1180, h: 840,
        alt: '오펠리스 웨딩컨벤션 약도 — 시청역 9번 출구 도보 4분, 서울역 3번 출구 도보 10분' },
    ],
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

  // 스튜디오 원본을 2:3 으로 맞춰 넣었다 (좌우만 잘랐다 — 전신 사진이라
  // 위아래를 자르면 머리나 발이 날아간다). 메타데이터는 전부 제거했다.
  // 비율을 바꾸려면 css 의 .gal__item 도 같이 바꿔야 한다.
  gallery: [
    'images/photo-1.jpg',
    'images/photo-2.jpg',
    'images/photo-3.jpg',
    'images/photo-4.jpg',
    'images/photo-5.jpg',
    'images/photo-6.jpg',
    'images/photo-7.jpg',
    'images/photo-8.jpg',
  ],

  accounts: {
    groom: [
      { rel: '신랑',   holder: '박동삼', bank: '토스뱅크', number: '1001-5256-3999' },
      { rel: '아버지', holder: '박종만', bank: '국민은행', number: '044202-04-284578' },
      { rel: '어머니', holder: '신용선', bank: '우리은행', number: '1002-634-057530' },
    ],
    bride: [
      { rel: '신부',   holder: '김연의', bank: '토스뱅크', number: '1000-1419-2405' },
      { rel: '아버지', holder: '김성식', bank: '국민은행', number: '235601-04-283538' },
      { rel: '어머니', holder: '조미선', bank: '국민은행', number: '235601-04-024964' },
    ],
  },
};
