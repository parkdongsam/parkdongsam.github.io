#!/usr/bin/env python3
"""Overpass 에서 이 구역의 도로 / 철도 / 랜드마크를 받아 둔다. 키 없음."""
import json, os, sys, urllib.request, urllib.parse

S, N = 37.5548, 37.5668
W, E = 126.9639, 126.9821
BBOX = f'{S},{W},{N},{E}'

Q = f"""
[out:json][timeout:60];
(
  way["highway"~"^(motorway|trunk|primary|secondary|tertiary|residential|unclassified|living_street|pedestrian)$"]({BBOX});
  way["highway"~"^(motorway_link|trunk_link|primary_link|secondary_link)$"]({BBOX});
  way["railway"="subway"]({BBOX});
  way["railway"="rail"]({BBOX});
  node["railway"="station"]({BBOX});
  way["building"="train_station"]({BBOX});
  way["leisure"="park"]({BBOX});
  way["historic"="city_gate"]({BBOX});
  way["tourism"="attraction"]["name"~"덕수궁|숭례문"]({BBOX});
  node["name"~"^(시청역|서울역|숭례문|덕수궁|서소문|서울시청)"]({BBOX});
);
out geom;
"""

for host in ['https://overpass-api.de/api/interpreter',
             'https://overpass.kumi.systems/api/interpreter']:
    try:
        req = urllib.request.Request(
            host, data=urllib.parse.urlencode({'data': Q}).encode(),
            headers={'User-Agent': 'parkdongsam.github.io static map builder (d3@elicer.com)'})
        with urllib.request.urlopen(req, timeout=90) as r:
            data = json.load(r)
        break
    except Exception as e:
        print('fail', host, str(e)[:100], file=sys.stderr)
else:
    sys.exit('all overpass hosts failed')

out = os.path.join(os.path.dirname(__file__), 'osm-data.json')
json.dump(data, open(out, 'w'), ensure_ascii=False)

els = data['elements']
from collections import Counter
kinds = Counter()
for e in els:
    if 'highway' in e.get('tags', {}): kinds['highway:' + e['tags']['highway']] += 1
    elif 'railway' in e.get('tags', {}): kinds['railway:' + e['tags']['railway']] += 1
    elif 'leisure' in e.get('tags', {}): kinds['park'] += 1
    else: kinds['other'] += 1
print('elements:', len(els))
for k, v in kinds.most_common(20):
    print(f'  {k:28s} {v}')
names = [e['tags']['name'] for e in els if e.get('tags', {}).get('name', '') in
         ('시청역', '서울역', '숭례문', '덕수궁')]
print('landmark names found:', sorted(set(names)))
