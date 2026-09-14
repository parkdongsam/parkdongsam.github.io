#!/usr/bin/env python3
"""
OSM 원본 데이터로 이 사이트의 팔레트(흰 종이 · 검은 잉크)에 맞는 지도를 직접 그린다.
타일을 회색으로 바꾸는 게 아니라 선을 직접 긋는다 — 굵기와 농도를 페이지의 다른
요소와 같은 기준으로 맞출 수 있고, 색이 섞이지 않는다. API 키 없음.

핵심: 모든 치수를 '휴대폰에서 보이는 크기(CSS px)'로 정하고 마지막에 환산한다.
이미지 픽셀로 정하면 390px 폭에 넣었을 때 글자가 6px 로 줄어 읽히지 않는다.
"""
import json, math, os
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'osm-data.json')
DST = os.path.join(HERE, '..', 'images', 'map-area.png')
D = json.load(open(SRC))['elements']

# ── 구역 ────────────────────────────────────────────────────────────────
S, N = 37.5540, 37.5672
W, E = 126.9635, 126.9835

# ── 크기 ────────────────────────────────────────────────────────────────
# 본문 칸의 실제 폭이다. 390px 화면에서 좌우 여백(--gutter 1.5rem)을 뺀 값.
# 390 으로 잡으면 글자가 설계한 크기보다 12% 작게 나온다.
DISPLAY_W = 342
OUT_W = 1400             # 저장 폭 (고해상도 화면용)
K = OUT_W / DISPLAY_W    # 표시 px → 이미지 px
SS = 3                   # 3배로 그린 뒤 줄여 계단 제거

def merc_y(lat):
    return math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))

MY_S, MY_N = merc_y(S), merc_y(N)
OUT_H = int(round(OUT_W * (MY_N - MY_S) / math.radians(E - W)))
PW, PH = OUT_W * SS, OUT_H * SS

def px(lat, lon, s=SS):
    return ((lon - W) / (E - W) * OUT_W * s,
            (MY_N - merc_y(lat)) / (MY_N - MY_S) * OUT_H * s)

# ── 팔레트 (css/base.css 와 같은 값) ─────────────────────────────────────
PAPER, INK, INK2, INK3 = (255, 255, 255), (17, 17, 17), (68, 68, 68), (140, 140, 140)
RULE, FILL = (230, 230, 230), (246, 246, 246)

img = Image.new('RGB', (PW, PH), PAPER)
dr = ImageDraw.Draw(img)

def lines(way, disp_w, colour, dash=None):
    pts = [px(p['lat'], p['lon']) for p in way.get('geometry', []) if p]
    if len(pts) < 2:
        return
    w = max(1, int(round(disp_w * K * SS)))
    if not dash:
        dr.line(pts, fill=colour, width=w, joint='curve')
        return
    on, off = dash[0] * K * SS, dash[1] * K * SS
    for a, b in zip(pts, pts[1:]):
        seg = math.hypot(b[0] - a[0], b[1] - a[1])
        t = 0.0
        while t < seg:
            hi = min(t + on, seg)
            dr.line([(a[0] + (b[0] - a[0]) * t / seg, a[1] + (b[1] - a[1]) * t / seg),
                     (a[0] + (b[0] - a[0]) * hi / seg, a[1] + (b[1] - a[1]) * hi / seg)],
                    fill=colour, width=w)
            t = hi + off

# 공원 — 아주 옅은 면
for e in D:
    if e.get('tags', {}).get('leisure') == 'park':
        pts = [px(p['lat'], p['lon']) for p in e.get('geometry', []) if p]
        if len(pts) > 2:
            dr.polygon(pts, fill=FILL)

# 도로 — 색은 전부 같은 잉크, 위계는 굵기로만 말한다 (표시 px 기준)
ROADS = [
    (('residential', 'unclassified', 'living_street'), 0.5, (178, 178, 178)),
    (('tertiary',), 0.9, INK2),
    (('secondary_link',), 0.8, INK2),
    (('secondary',), 1.15, INK2),
    (('motorway_link', 'trunk_link', 'primary_link'), 0.9, INK2),
    (('primary',), 1.5, INK),
    (('motorway', 'trunk'), 1.8, INK),
]
for kinds, wdt, col in ROADS:                       # 가는 길부터, 굵은 길을 위에
    for e in D:
        if e.get('type') == 'way' and e.get('tags', {}).get('highway') in kinds:
            lines(e, wdt, col)

# 철도 — 지상은 점선, 지하철은 더 옅은 점선
for e in D:
    t = e.get('tags', {})
    if e.get('type') != 'way':
        continue
    if t.get('railway') == 'rail':
        lines(e, 0.45, (200, 200, 200), dash=(2.6, 3.2))
    elif t.get('railway') == 'subway':
        lines(e, 0.5, RULE, dash=(2.4, 3.0))

img = img.resize((OUT_W, OUT_H), Image.LANCZOS)
dr = ImageDraw.Draw(img)

# ── 표시와 글자 (좌표는 전부 OSM 실측값) ────────────────────────────────
FONT = '/System/Library/Fonts/AppleSDGothicNeo.ttc'
def font(disp_size, weight=2):
    return ImageFont.truetype(FONT, int(round(disp_size * K)), index=weight)

f_venue, f_stn, f_mark = font(12.5, 4), font(11, 2), font(10.5, 2)

def at(lat, lon):
    return px(lat, lon, 1)

def label(lat, lon, text, fnt, colour, dy=0):
    x, y = at(lat, lon)
    y += dy * K
    halo = max(2, int(round(1.5 * K)))
    for ox in range(-halo, halo + 1):               # 도로 위에 놓여도 읽히도록
        for oy in range(-halo, halo + 1):
            if ox or oy:
                dr.text((x + ox, y + oy), text, font=fnt, fill=PAPER, anchor='ms')
    dr.text((x, y), text, font=fnt, fill=colour, anchor='ms')

def dot(lat, lon, disp_r, fill, outline=None, disp_w=1.0):
    x, y = at(lat, lon)
    r = disp_r * K
    dr.ellipse([x - r, y - r, x + r, y + r], fill=fill,
               outline=outline, width=max(1, int(round(disp_w * K))))

STATIONS = {'시청역': (37.565480, 126.977114), '서울역': (37.555417, 126.972586)}
MARKS    = {'덕수궁': (37.565614, 126.974793), '숭례문': (37.558401, 126.973683)}
VENUE    = (37.5613467, 126.9729642)

for name, (la, lo) in MARKS.items():
    dot(la, lo, 1.3, INK3)
    label(la, lo, name, f_mark, INK2, dy=-6)

for name, (la, lo) in STATIONS.items():
    dot(la, lo, 3.4, PAPER, INK, 1.5)
    label(la, lo, name, f_stn, INK, dy=-7)

# 예식장 — 이 지도에서 유일하게 꽉 찬 검은 점
dot(*VENUE, 7.5, PAPER, PAPER, 1)      # 도로를 지우는 흰 여백
dot(*VENUE, 5.2, INK)
label(*VENUE, '오펠리스 웨딩컨벤션', f_venue, INK, dy=-10)

# OSM 라이선스가 요구하는 출처 표기
f_cred = ImageFont.truetype(FONT, int(round(6.5 * K)), index=0)
dr.text((OUT_W - int(6 * K), OUT_H - int(5 * K)),
        '© OpenStreetMap', font=f_cred, fill=INK3, anchor='rs')

# 회색 단계가 몇 개 안 되므로 줄여서 저장한다
img = img.convert('L').quantize(colors=16, method=Image.MEDIANCUT)
img.save(DST, optimize=True)
print(f'{OUT_W}x{OUT_H}  {os.path.getsize(DST)//1024}KB')
print(f'표시 {DISPLAY_W}px 기준: 예식장 글자 12.5px, 역 11px, 랜드마크 10.5px, 큰길 1.5px')
