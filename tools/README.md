# 지도 만들기

> **지금은 쓰지 않는다.** 오시는 길에는 인쇄 청첩장 약도 한 장만 둔다.
> 아래 스크립트를 돌리면 `images/map-area.png` 가 다시 만들어지고,
> `js/data.js` 의 `venue.maps` 에 한 줄 넣으면 되살아난다.

`images/map-area.png` 는 OpenStreetMap 원본 데이터로 직접 그린다.
지도 타일을 가져다 회색으로 바꾸는 게 아니라 선을 직접 긋는다 — 그래야
선 굵기와 농도를 페이지의 다른 요소와 같은 기준으로 맞출 수 있다.

**API 키가 필요 없다.**

```
pip install pillow
python3 tools/fetch-osm.py     # Overpass 에서 도로·철도·랜드마크를 받는다
python3 tools/build-map.py     # images/map-area.png 를 다시 만든다
```

`fetch-osm.py` 가 만드는 `tools/osm-data.json` 은 중간 산출물이라
저장소에 넣지 않는다. 다시 받으면 된다.

## 고칠 때

- 보이는 범위 → `build-map.py` 의 `S, N, W, E`
- 글자·선 크기 → 전부 **표시 크기(CSS px)** 로 적혀 있다. `DISPLAY_W` 가
  본문 칸의 실제 폭(390px 화면에서 좌우 여백을 뺀 342px)이고, `K` 가
  이미지 픽셀로 환산한다. 이미지 픽셀로 직접 적으면 휴대폰에서 글자가
  읽을 수 없을 만큼 작아진다.
- 예식장·역 좌표 → `STATIONS` / `MARKS` / `VENUE`. 전부 OSM 실측값이다.

## 출처 표기

OpenStreetMap 데이터는 ODbL 이라 출처를 밝혀야 한다. 그래서 이미지
오른쪽 아래에 `© OpenStreetMap` 을 넣는다. 지우지 말 것.
