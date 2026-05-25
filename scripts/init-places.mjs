#!/usr/bin/env node
// content/data/life-of-jesus.json 이 참조하는 장소 중 places/<id>.md 가 없는 것을
// 사전 정의된 좌표·요약으로 stub 생성. 기존 파일은 건드리지 않음 (idempotent).
//
// 사용:  node scripts/init-places.mjs
// 이후 `node scripts/build-timeline.mjs` 를 돌리면 사건 목록이 자동으로 채워짐.

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "..")
const PLACES_DIR = path.join(ROOT, "content", "places")
const DATA_PATH = path.join(ROOT, "content", "data", "life-of-jesus.json")

// ── 장소 시드 데이터 ──────────────────────────────────────────────────────
//   location:   [lat, lng] — 지도 핀 좌표 (전통적 비정지 또는 학문적 다수설)
//   englishName: 영어 제목(괄호로 표기)
//   nameNow:     frontmatter `name_now` — 현재 지명/맥락
//   namePast:    frontmatter `name_past` — 성경 시대의 다른 이름·표기
//   zoom:        단일 핀 mapview의 zoom (지역=9, 도시=12, 유적=14)
//   placeLines:  "## 지명" 섹션의 항목들

const SEED = {
  "광야": {
    location: [31.79, 35.41],
    englishName: "Judean Wilderness",
    nameNow: "Judean Desert (이스라엘·팔레스타인 — 사해 서편)",
    namePast: ["광야 (마4:1, 막1:12, 눅4:1)"],
    zoom: 10,
    placeLines: [
      "**현재**: 사해 서편의 황무지. 전승상의 \"시험산(Mount of Temptation)\"이 [[여리고]] 서편에 있음.",
      "**고대**: 출애굽의 광야 방랑, 엘리야의 도피, 세례 요한의 사역, 예수의 시험까지 — 영적 형성과 시험의 무대.",
      "**뜻**: 히브리어 מִדְבָּר (*midbar*) — 황무지·광야.",
    ],
  },
  "요단강": {
    location: [31.838, 35.526],
    englishName: "Jordan River",
    nameNow: "Jordan River (이스라엘·요르단 경계). 세례터는 Qasr el-Yahud / Al-Maghtas.",
    namePast: ["요단 강 건너편 베다니 (요1:28)", "벧바라 (요1:28 일부 사본)"],
    zoom: 10,
    placeLines: [
      "**현재**: 헤르몬산 → [[갈릴리 호수]] → 사해. 세례 요한의 사역지 \"베다니 강 건너편\"이 현재의 Qasr el-Yahud(서안)와 Al-Maghtas(요르단) 일대로 비정.",
      "**고대**: 이스라엘의 출애굽 도하(수3), 엘리야의 승천, 나아만의 정결, 세례 요한, 예수의 세례 — 새 출애굽의 상징.",
      "**뜻**: 히브리어 יַרְדֵּן (*Yarden*) — \"내려가는 강\".",
    ],
  },
  "가나": {
    location: [32.745, 35.341],
    englishName: "Cana of Galilee",
    nameNow: "Kafr Kanna (전통적 동일시) — Khirbet Qana도 후보",
    namePast: ["갈릴리 가나 (요2:1, 4:46)"],
    zoom: 12,
    placeLines: [
      "**현재**: [[나사렛]] 북동쪽 약 7km. 비정 후보는 Kafr Kanna(전통)와 Khirbet Qana(고고학).",
      "**고대**: 나다나엘의 고향(요21:2). 예수의 첫 표적(혼인 잔치)과 두 번째 표적(왕의 신하의 아들 치유)의 무대.",
      "**뜻**: 히브리어 קָנָה (*Qanah*) — \"갈대의 장소\".",
    ],
  },
  "가버나움": {
    location: [32.881, 35.575],
    englishName: "Capernaum",
    nameNow: "Kfar Nahum (회당·베드로의 집 유적, [[갈릴리 호수]] 북서편)",
    namePast: ["가버나움 (마4:13)", "자기 동네 (마9:1)"],
    zoom: 12,
    placeLines: [
      "**현재**: [[갈릴리 호수]] 북서쪽 호숫가. 4세기 회당 유적과 베드로의 집 위에 세워진 팔각형 교회 터.",
      "**고대**: 예수의 갈릴리 사역 거점(마4:13). 회당·세관·어업의 마을. 마지막에 \"화 있을진저 가버나움아\"의 책망(마11:23).",
      "**뜻**: 히브리어 כְּפַר נַחוּם (*Kfar Nahum*) — \"나훔의 마을\".",
    ],
  },
  "마케루스": {
    location: [31.568, 35.625],
    englishName: "Machaerus",
    nameNow: "Machaerus / Mukawir (요르단, 사해 동편 산정)",
    namePast: [],
    zoom: 11,
    placeLines: [
      "**현재**: 요르단의 산정 요새 유적. 사해 동편 약 25km.",
      "**고대**: 헤롯 대왕이 짓고 헤롯 안디바가 사용한 요새. 요세푸스는 이곳을 세례 요한의 투옥·처형 장소로 기록(『유대 고대사』 18.5.2).",
    ],
  },
  "사마리아": {
    location: [32.211, 35.286],
    englishName: "Samaria (region) / Sychar",
    nameNow: "Samaria (이스라엘 중부 산지). 수가·야곱의 우물 = Tell Balata, Nablus.",
    namePast: ["수가 (요4:5)", "세겜 (창12:6, 33:18)"],
    zoom: 10,
    placeLines: [
      "**현재**: [[유대]] 북쪽 산지. 수가는 현 나블루스 동편 Tell Balata. 야곱의 우물 위에 비잔틴–십자군–그리스 정교회 성당이 차례로 세워짐.",
      "**고대**: 북왕국의 옛 수도 사마리아 성에서 유래한 지역명. 유대인과 사마리아인의 갈등(요4:9). \"네가 산에서도 말고 예루살렘에서도 말고 ... 영과 진리로 ... \"의 무대.",
      "**뜻**: 히브리어 שֹׁמְרוֹן (*Shomron*) — \"파수꾼의 망대\".",
    ],
  },
  "갈릴리": {
    location: [32.85, 35.45],
    englishName: "Galilee (region)",
    nameNow: "Galilee (이스라엘 북부, [[갈릴리 호수]] 주변·산지)",
    namePast: ["이방의 갈릴리 (마4:15, 사9:1 인용)"],
    zoom: 9,
    placeLines: [
      "**현재**: [[나사렛]]·[[가버나움]]·[[가나]]·[[팔복산]]·[[나인]] 등을 포함한 이스라엘 북부 지역.",
      "**고대**: 헤롯 안디바의 영토(BC 4 ~ AD 39). 이방인이 다수 거주하던 변방으로 멸시되었으나 사9:1-2 \"이방의 갈릴리에 큰 빛\" 예언의 성취 무대.",
      "**뜻**: 히브리어 גָּלִיל (*Galil*) — \"고리\"·\"권역\".",
    ],
  },
  "갈릴리 호수": {
    location: [32.80, 35.59],
    englishName: "Sea of Galilee",
    nameNow: "Sea of Galilee / Lake Kinneret (이스라엘 북부)",
    namePast: ["디베랴 호수 (요6:1, 21:1)", "게네사렛 호수 (눅5:1)", "긴네렛 (수11:2)"],
    zoom: 10,
    placeLines: [
      "**현재**: 해수면 약 -210m, 둘레 53km, 폭 13km. 이스라엘의 주 식수원.",
      "**고대**: 예수의 갈릴리 사역의 무대. 풍랑 잔잔케 함·물 위 걸으심·오천 명 급식·디베랴의 나타나심 등 다수의 표적이 이 호숫가에서.",
      "**뜻**: 모양이 하프(긴네렛)와 닮아 그렇게 불렸다는 설.",
    ],
  },
  "팔복산": {
    location: [32.881, 35.552],
    englishName: "Mount of Beatitudes",
    nameNow: "Mount Eremos / Har HaOsher ([[가버나움]] 서쪽 1km, [[갈릴리 호수]] 북서편)",
    namePast: ["산 (마5:1)"],
    zoom: 13,
    placeLines: [
      "**현재**: [[가버나움]]과 [[갈릴리 호수]]가 한눈에 보이는 북서편 산비탈. 4세기 비잔틴 채플 유적과 1937년 프란치스코회의 팔각형 교회.",
      "**고대**: 산상수훈(마5–7)의 전승 장소. \"무리를 보시고 산에 올라가 앉으시니\"(마5:1).",
    ],
  },
  "나인": {
    location: [32.63, 35.35],
    englishName: "Nain",
    nameNow: "Nein (이스라엘 북부, [[나사렛]] 동남쪽 약 10km)",
    namePast: ["나인 (눅7:11)"],
    zoom: 12,
    placeLines: [
      "**현재**: Mount Moreh 북쪽 기슭의 작은 마을.",
      "**고대**: 누가만 기록한 \"과부의 외아들을 살리신\" 사건의 장소(눅7:11-17). \"내가 네게 말하노니 청년아 일어나라\".",
    ],
  },
  "거라사": {
    location: [32.83, 35.65],
    englishName: "Gerasa / Kursi",
    nameNow: "Kursi (현 거라사 전승지, [[갈릴리 호수]] 동편)",
    namePast: ["가다라 (마8:28 일부 사본)", "거라사 (막5:1, 눅8:26)", "게르게사 (사본 변이)"],
    zoom: 12,
    placeLines: [
      "**현재**: 갈릴리 호수 동편 절벽 가까이의 비잔틴 수도원 유적이 발견된 Kursi가 전승상의 위치.",
      "**고대**: 사본에 따라 가다라·거라사·게르게사로 표기가 갈리는데, 호숫가의 비탈과 돼지 떼의 절벽이 있는 곳이라야 본문과 부합. [[데가볼리]] 권역.",
    ],
  },
  "벳새다": {
    location: [32.910, 35.631],
    englishName: "Bethsaida",
    nameNow: "et-Tell (가장 유력한 비정지, [[갈릴리 호수]] 북쪽 평지)",
    namePast: ["벳새다 (요1:44, 12:21)", "벳새다 줄리아스 (분봉왕 빌립이 황제의 딸 율리아를 기념해 명명)"],
    zoom: 12,
    placeLines: [
      "**현재**: 요단강이 갈릴리 호수로 흘러드는 북쪽 평지(Beteiha 평원). et-Tell이 가장 유력한 비정지.",
      "**고대**: 베드로·안드레·빌립의 고향(요1:44). \"화 있을진저 벳새다야\"의 책망(마11:21).",
      "**뜻**: 아람어 בֵּית צַיְדָא (*Beit Tzayda*) — \"어부의 집\".",
    ],
  },
  "두로": {
    location: [33.273, 35.196],
    englishName: "Tyre",
    nameNow: "Sur, Lebanon (남부 해안 도시)",
    namePast: ["두로 (마15:21)"],
    zoom: 11,
    placeLines: [
      "**현재**: 레바논 남부 해안. 고대에는 본토와 떨어진 섬 + 본토 두 부분이었으나 알렉산더의 토목공사로 연결됨.",
      "**고대**: 페니키아의 상업 중심. 솔로몬의 성전 건축에 백향목과 장인을 보낸 히람의 왕국(왕상5). 구약 예언자들의 심판 예언 대상(겔26–28). 신약에선 수로보니게 여인이 예수께 나아온 곳.",
    ],
  },
  "시돈": {
    location: [33.562, 35.371],
    englishName: "Sidon",
    nameNow: "Saida, Lebanon ([[두로]] 북쪽 약 40km)",
    namePast: ["시돈 (마15:21)"],
    zoom: 11,
    placeLines: [
      "**현재**: 레바논 해안 도시.",
      "**고대**: 페니키아의 또 다른 상업 중심. 두로와 짝지어 자주 언급(\"두로와 시돈\"). 엘리야가 사르밧 과부에게 보냄을 받은 곳(왕상17, 눅4:26).",
    ],
  },
  "데가볼리": {
    location: [32.50, 35.85],
    englishName: "Decapolis",
    nameNow: "Decapolis 권역 ([[갈릴리 호수]] 동남편 — 요르단·시리아 일대)",
    namePast: ["데가볼리 (마4:25, 막5:20, 7:31)"],
    zoom: 9,
    placeLines: [
      "**현재**: 갈릴리 호수 동남·남동편의 광역. 거라사(Jerash)·가다라·다마스쿠스 등 10개 도시.",
      "**고대**: 폼페이우스(BC 64) 이후 형성된 헬레니즘 도시 동맹. 헬라화된 이방 지역. 예수의 명성이 여기까지 퍼졌고(마4:25), 거라사 광인이 회복 후 자신의 이야기를 데가볼리에서 전파(막5:20).",
      "**뜻**: 헬라어 Δεκάπολις — \"열 도시\".",
    ],
  },
  "가이사랴 빌립보": {
    location: [33.249, 35.694],
    englishName: "Caesarea Philippi",
    nameNow: "Banias (헤르몬산 남쪽 기슭, 골란 고원 북단)",
    namePast: ["바니아 — 이방 신 판(Pan)의 신전이 있던 곳", "가이사랴 빌립보 (마16:13, 막8:27) — 분봉왕 빌립이 가이사 황제와 자신의 이름을 따 명명"],
    zoom: 12,
    placeLines: [
      "**현재**: 요단강 수원 중 하나. 헤르몬산 남쪽 기슭.",
      "**고대**: 이방의 자연·다신 숭배 중심지. 바로 그 곳에서 베드로가 \"주는 그리스도시요 살아 계신 하나님의 아들이시니이다\"(마16:16)라 고백.",
    ],
  },
  "변화산": {
    location: [32.687, 35.391],
    englishName: "Mount of Transfiguration (Mt. Tabor — traditional)",
    nameNow: "Mt. Tabor (전통) / Mt. Hermon (학문적 다수설)",
    namePast: ["높은 산 (마17:1, 막9:2)"],
    zoom: 11,
    placeLines: [
      "**현재**: 다볼산은 [[갈릴리]] 평야에 솟은 둥근 봉우리(해발 575m). 헤르몬산은 [[가이사랴 빌립보]] 위쪽 2,814m.",
      "**고대**: 본문은 산 이름을 명시하지 않음. 4세기 이래 다볼산이 전승상 위치. 그러나 \"[[가이사랴 빌립보]] ... 엿새 후\"(마17:1)의 문맥상 헤르몬산이라는 견해가 학문적 다수설.",
    ],
  },
  "유대": {
    location: [31.70, 35.15],
    englishName: "Judea (region)",
    nameNow: "Judea (이스라엘 중남부 산지)",
    namePast: ["유다 (구약 시대의 남왕국)"],
    zoom: 9,
    placeLines: [
      "**현재**: [[예루살렘]]·[[베들레헴]]·[[베다니]]·[[여리고]] 등을 포함한 중남부 지역.",
      "**고대**: 남왕국 유다의 영토. 신약 시대에는 로마 직할 또는 분봉왕의 통치 아래(AD 6 이후 빌라도 등 총독 통치).",
    ],
  },
  "베다니": {
    location: [31.770, 35.255],
    englishName: "Bethany",
    nameNow: "al-Eizariya ([[감람산]] 동편 기슭, [[예루살렘]]에서 약 3km)",
    namePast: ["베다니 (마21:17, 요11:1)"],
    zoom: 13,
    placeLines: [
      "**현재**: 감람산 동편의 마을. 예수께서 [[예루살렘]] 사역 동안 자주 머무신 곳.",
      "**고대**: 마르다·마리아·나사로의 동네. 나사로 부활의 무대(요11). 마리아의 향유 부음(요12). 수난주간 동안 예수의 거처. 승천 직전 \"베다니 앞까지 인도\"하심(눅24:50).",
      "**뜻**: \"가난한 자의 집\" 또는 \"무화과의 집\"으로 추정.",
    ],
  },
  "베레아": {
    location: [31.90, 35.65],
    englishName: "Perea",
    nameNow: "Perea (현 요르단 서부, 요단강 동편 — 사해와 [[갈릴리 호수]] 사이)",
    namePast: ["요단 강 건너편 (마19:1, 막10:1)"],
    zoom: 9,
    placeLines: [
      "**현재**: 요르단 서부. 정확한 경계는 시대에 따라 변동.",
      "**고대**: 헤롯 안디바의 영토 — [[갈릴리]]와 함께 통치. [[사마리아]] 통과를 피해 [[예루살렘]]으로 가던 유대인들의 우회로. 예수의 7부 후반 사역(이혼 논쟁·부자 청년·포도원 품꾼) 무대.",
      "**뜻**: 헬라어 ἡ πέραν — \"건너편\".",
    ],
  },
  "에브라임": {
    location: [31.946, 35.305],
    englishName: "Ephraim",
    nameNow: "et-Taiyiba (라말라 북동쪽 약 25km의 산지 마을)",
    namePast: ["에브라임 (요11:54)"],
    zoom: 12,
    placeLines: [
      "**현재**: 라말라 북동쪽의 산지 마을 et-Taiyiba. (이슬람 시대에 \"좋은 곳\"이라는 명칭으로 개명됨.)",
      "**고대**: \"광야에 가까운 동네\"(요11:54). 나사로 부활 이후 산헤드린의 음모를 피해 잠시 은거하신 곳.",
    ],
  },
  "여리고": {
    location: [31.871, 35.444],
    englishName: "Jericho",
    nameNow: "Ariha (사해 북서편 오아시스)",
    namePast: ["여리고 (수6, 막10:46)"],
    zoom: 12,
    placeLines: [
      "**현재**: 사해 북서편, 해수면 약 -250m. 세계에서 가장 낮은 도시 중 하나. 구 여리고(Tell es-Sultan)와 신 여리고(헤롯의 겨울 궁전 자리)가 인접.",
      "**고대**: 여호수아 시대의 성벽 무너진 도시(수6). 예수께서 [[예루살렘]]으로 올라가시는 길의 마지막 큰 도시 — 바디매오·삭개오 사건.",
      "**뜻**: \"향기로운 곳\" 또는 \"달의 도시\".",
    ],
  },
  "감람산": {
    location: [31.778, 35.244],
    englishName: "Mount of Olives",
    nameNow: "Mount of Olives ([[예루살렘]] 동편 능선)",
    namePast: ["감람 산 (마24:3, 눅22:39)", "감람나무의 비탈 (즉14:4)"],
    zoom: 13,
    placeLines: [
      "**현재**: [[예루살렘]] 동편의 남북 능선(해발 800m). 키드론 골짜기를 사이에 두고 성전과 마주봄.",
      "**고대**: 감람나무가 우거진 곳. 다윗이 압살롬을 피해 울며 오른 곳(삼하15:30). 즉14:4의 종말 도래 예언지. 예수의 감람산 강화·[[겟세마네]]·승천이 모두 여기서.",
    ],
  },
  "겟세마네": {
    location: [31.780, 35.240],
    englishName: "Gethsemane",
    nameNow: "Garden of Gethsemane ([[감람산]] 서편 기슭, 키드론 골짜기 건너편)",
    namePast: ["겟세마네라 하는 곳 (마26:36)", "동산 (요18:1)"],
    zoom: 14,
    placeLines: [
      "**현재**: [[감람산]] 기슭의 올리브 동산. 4세기 이래 비잔틴–십자군–현 프란치스코회의 \"열방의 교회\". 천년 이상 된 올리브 나무들이 남아 있음.",
      "**고대**: 마지막 만찬 후 예수께서 기도하시고 체포되신 동산.",
      "**뜻**: 아람어 גַּת שְׁמָנֵי (*Gat Shmanei*) — \"기름틀\".",
    ],
  },
  "골고다": {
    location: [31.778, 35.230],
    englishName: "Golgotha / Calvary",
    nameNow: "Church of the Holy Sepulchre (전통) — Garden Tomb (19세기 이후의 대안 후보)",
    namePast: ["골고다 (마27:33, 막15:22, 요19:17)", "갈보리 (눅23:33, Vulg.)", "해골 (해골이 있는 곳)"],
    zoom: 14,
    placeLines: [
      "**현재**: 구도시 그리스도교 구역의 성묘교회. 십자가·매장·부활을 한 지붕 아래 기념. 대안인 \"동산 무덤\"은 다마스쿠스 문 북편.",
      "**고대**: 도시 성벽 밖의 처형장. 후대의 도시 확장으로 현재는 도시 내부에 위치.",
      "**뜻**: 아람어 גֻּלְגֻּלְתָּא (*Gulgolta*) — \"해골\"(눅23:33 \"해골이라 하는 곳\").",
    ],
  },
  "엠마오": {
    location: [31.840, 34.989],
    englishName: "Emmaus",
    nameNow: "여러 후보 — Imwas/Latrun (전통), Abu Ghosh, Motza, Qubeibeh",
    namePast: ["엠마오 (눅24:13) — [[예루살렘]]에서 60스다디온(약 11km)"],
    zoom: 11,
    placeLines: [
      "**현재**: 본문은 \"[[예루살렘]]에서 60스다디온\"이라 했으나 어느 마을인지 정확히 비정되지 않음. 가장 오래된 전통은 Imwas/Latrun.",
      "**고대**: 부활일 오후 두 제자가 예수와 함께 걸으며 성경을 풀어 받은 길. 떡을 떼시매 눈이 밝아진 식탁.",
    ],
  },
}

// ── 렌더링 ────────────────────────────────────────────────────────────────

function renderStub(id, s) {
  const past =
    s.namePast && s.namePast.length
      ? "\n" + s.namePast.map((p) => `  - ${p}`).join("\n")
      : " []"
  const mapview = {
    name: id,
    mapZoom: s.zoom ?? 12,
    mapCenter: { lat: s.location[0], lng: s.location[1] },
    centerLat: s.location[0],
    centerLng: s.location[1],
    query: `path:"places/${id}.md"`,
    embeddedHeight: 280,
    chosenMapSource: 0,
  }
  return `---
location: [${s.location[0]}, ${s.location[1]}]
name_kr: ${id}
name_now: ${s.nameNow}
name_past:${past}
tags:
  - place
  - life-of-jesus
---

# ${id}${s.englishName ? ` (${s.englishName})` : ""}

\`\`\`mapview
${JSON.stringify(mapview, null, 2)}
\`\`\`

## 지명
${s.placeLines.map((l) => `- ${l}`).join("\n")}

<!-- timeline-events:start -->
## 예수의 생애 관련 사건
<!-- timeline-events:end -->

<!-- timeline-scriptures:start -->
## 관련 성경 본문
<!-- timeline-scriptures:end -->
`
}

// ── main ─────────────────────────────────────────────────────────────────

const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"))
const referenced = new Set()
for (const part of data.parts) {
  for (const event of part.events) {
    for (const p of event.places ?? []) {
      referenced.add(typeof p === "string" ? p : p.id)
    }
  }
}

if (!fs.existsSync(PLACES_DIR)) fs.mkdirSync(PLACES_DIR, { recursive: true })

let created = 0
let skipped = 0
const missingSeed = []
for (const id of [...referenced].sort()) {
  const filePath = path.join(PLACES_DIR, `${id}.md`)
  if (fs.existsSync(filePath)) {
    skipped++
    continue
  }
  const seed = SEED[id]
  if (!seed) {
    missingSeed.push(id)
    continue
  }
  fs.writeFileSync(filePath, renderStub(id, seed), "utf-8")
  console.log(`  + ${path.relative(ROOT, filePath)}`)
  created++
}

console.log(`\n생성: ${created}, 기존 유지: ${skipped}`)
if (missingSeed.length) {
  console.log(
    `시드 미정의 (스킵): ${missingSeed.length} — ${missingSeed.join(", ")}`,
  )
}
if (created > 0) {
  console.log(`\n다음: node scripts/build-timeline.mjs 를 돌리면 '예수의 생애 관련 사건' 목록이 채워집니다.`)
}
