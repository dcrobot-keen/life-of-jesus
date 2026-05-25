#!/usr/bin/env node
// content/data/life-of-jesus.json 을 소스로 아래 세 종류 마크다운을 자동 생성한다.
//   1) content/life-of-jesus.md            — 타임라인 메인 페이지 (마커 블록 사이만 교체)
//   2) content/KoreanRevisedVersion/<책>/<장>.md  — 해당 구절 위에 타임라인 콜아웃 삽입
//   3) content/places/<id>.md              — "예수의 생애 관련 사건" 목록 갱신
//
// 사용:  node scripts/build-timeline.mjs

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "..")

const DATA_PATH = path.join(ROOT, "content", "data", "life-of-jesus.json")
const TIMELINE_MD = path.join(ROOT, "content", "life-of-jesus.md")
const SCRIPTURE_DIR = path.join(ROOT, "content", "KoreanRevisedVersion")
const PLACES_DIR = path.join(ROOT, "content", "places")

const GOSPEL_FOLDER = {
  matthew: "40마태복음",
  mark: "41마가복음",
  luke: "42누가복음",
  john: "43요한복음",
}
const BOOK_AUTHOR = {
  matthew: "마태",
  mark: "마가",
  luke: "누가",
  john: "요한",
}

const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"))
const SHORT_TO_GOSPEL = Object.fromEntries(
  Object.entries(data.books).map(([g, b]) => [b.short, g]),
)

// ── 참조 문자열·링크 helpers ────────────────────────────────────────────────

function refString(s) {
  const short = data.books[s.gospel].short
  const { chapter, verseStart, verseEnd, chapterEnd } = s.ref
  if (chapterEnd && chapterEnd !== chapter) {
    return `${short} ${chapter}:${verseStart}-${chapterEnd}:${verseEnd}`
  }
  if (verseStart === verseEnd) return `${short} ${chapter}:${verseStart}`
  return `${short} ${chapter}:${verseStart}-${verseEnd}`
}

function chapterFile(s) {
  return `${data.books[s.gospel].short}${s.ref.chapter}`
}

function verseAnchor(s) {
  return `${chapterFile(s)}#${s.ref.verseStart}`
}

function scriptureLink(s) {
  return `[[${verseAnchor(s)}|${refString(s)}]]`
}

function eventAnchor(e) {
  return `life-of-jesus#${e.id} ${e.title}`
}

function eventLink(e, label) {
  return `[[${eventAnchor(e)}|${label ?? `${e.id} ${e.title}`}]]`
}

function calloutTitle(s) {
  const author = BOOK_AUTHOR[s.gospel]
  const short = data.books[s.gospel].short
  if (!s.title) return author
  // 제목이 이미 책 이름을 포함하면 그대로 사용 (예: "마태의 족보", "악한 농부 (막)")
  if (s.title.includes(author) || s.title.includes(`(${short})`)) return s.title
  return `${author} — ${s.title}`
}

// ── 장소 helpers ──────────────────────────────────────────────────────────

const placeLocationCache = new Map()
function readPlaceLocation(placeId) {
  if (placeLocationCache.has(placeId)) return placeLocationCache.get(placeId)
  const filePath = path.join(PLACES_DIR, `${placeId}.md`)
  let coords = null
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf-8")
    const fm = content.match(/^---\n([\s\S]*?)\n---/)
    if (fm) {
      const loc = fm[1].match(
        /^location:\s*\[\s*([+-]?\d+(?:\.\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?)\s*\]/m,
      )
      if (loc) coords = [parseFloat(loc[1]), parseFloat(loc[2])]
    }
  }
  placeLocationCache.set(placeId, coords)
  return coords
}

function placeRef(place) {
  if (typeof place === "string") return { id: place, detail: null }
  return { id: place.id, detail: place.detail ?? null }
}

function placeWiki(place) {
  const { id, detail } = placeRef(place)
  return detail ? `[[${id}]] ${detail}` : `[[${id}]]`
}

// ── 타임라인 본문 생성 ─────────────────────────────────────────────────────

function partCenter(part) {
  const coords = []
  for (const e of part.events) {
    for (const p of e.places ?? []) {
      const { id } = placeRef(p)
      const c = readPlaceLocation(id)
      if (c) coords.push(c)
    }
  }
  if (coords.length === 0) return { lat: 31.5, lng: 35 }
  const lat = coords.reduce((a, c) => a + c[0], 0) / coords.length
  const lng = coords.reduce((a, c) => a + c[1], 0) / coords.length
  return { lat: +lat.toFixed(4), lng: +lng.toFixed(4) }
}

function generateMapviewBlock(part) {
  const c = partCenter(part)
  const json = {
    name: `${part.number}부 · ${part.title}`,
    query: `tag:#life-of-jesus/part${part.number}`,
    autoFit: true,
    mapCenter: { lat: c.lat, lng: c.lng },
    centerLat: c.lat,
    centerLng: c.lng,
    mapZoom: 8,
    embeddedHeight: 400,
    chosenMapSource: 0,
  }
  return "```mapview\n" + JSON.stringify(json, null, 2) + "\n```"
}

function generateGeoLines(places, partNumber) {
  const lines = []
  for (const p of places ?? []) {
    const { id, detail } = placeRef(p)
    const coords = readPlaceLocation(id)
    if (!coords) continue
    const label = detail ? `${id} ${detail}` : id
    lines.push(
      `[📍 ${label}](geo:${coords[0]},${coords[1]}) tag:life-of-jesus/part${partNumber}`,
    )
  }
  return lines
}

function generateEvent(event, partNumber) {
  const lines = []
  lines.push(`### ${event.id} ${event.title}`)
  lines.push("")
  lines.push(`**시기**: ${event.period ?? "—"}`)
  const placeBits =
    event.places && event.places.length > 0
      ? event.places.map(placeWiki).join(" → ")
      : "—"
  lines.push(`**지역**: ${placeBits}`)
  const geoLines = generateGeoLines(event.places, partNumber)
  for (const g of geoLines) lines.push(g)
  lines.push("")

  for (const s of event.scriptures) {
    lines.push(`> [!info] ${calloutTitle(s)}`)
    lines.push(`> ${scriptureLink(s)} — ${s.summary}`)
    lines.push("")
  }

  if (event.comparison) {
    lines.push(`> [!note] 차이점`)
    lines.push(`> ${event.comparison}`)
    lines.push("")
  }

  lines.push("---")
  return lines.join("\n")
}

function generatePart(part) {
  const lines = []
  lines.push(`## ${part.number}부 · ${part.title} (${part.period})`)
  lines.push("")
  lines.push(generateMapviewBlock(part))
  lines.push("")
  for (const e of part.events) {
    lines.push(generateEvent(e, part.number))
    lines.push("")
  }
  return lines.join("\n")
}

function generateTimelineBody() {
  return data.parts.map(generatePart).join("\n")
}

// ── life-of-jesus.md 작성 ────────────────────────────────────────────────

function buildHeader() {
  return `---
title: ${data.title}
description: ${data.description}
tags:
  - timeline
  - jesus
  - gospels
---

# ${data.title} (Life of Jesus)

${data.description}. 각 사건에는 4복음서의 시작 절 링크가 \`> [!info]\` 콜아웃으로 묶이고, 복음서 간 차이는 \`> [!note] 차이점\`으로 정리됩니다.

> [!warning] 자동 생성
> 아래 \`<!-- timeline:start -->\` 부터 \`<!-- timeline:end -->\` 사이는 [\`content/data/life-of-jesus.json\`](data/life-of-jesus.json)에서 자동 생성됩니다. **직접 편집하지 마세요** — 다음 빌드에서 덮어쓰입니다.
> 재생성: \`node scripts/build-timeline.mjs\`

## 지도 사용

[Obsidian Map View](https://github.com/esm7/obsidian-map-view) 플러그인이 설치되어 있으면 각 부(部) 시작에 있는 \`\`\`mapview\`\`\` 코드블록이 임베디드 지도로 렌더링됩니다. 본문의 인라인 좌표는 다음 형식입니다.

\`\`\`
[📍 라벨](geo:위도,경도) tag:life-of-jesus/part1
\`\`\`

\`tag:\` 는 #·공백 없이 \`tag:foo\` 형태로 붙여야 플러그인이 인식합니다. mapview 블록의 \`query\`(예: \`tag:#life-of-jesus/part1\`)가 그 부의 마커만 골라 보여줍니다. 각 지역 페이지([[places/베들레헴|베들레헴]] 등 [[places]] 폴더)에는 frontmatter 좌표 · 현재 지명 · 과거 지명이 정리되어 있어 지역 단위로도 핀이 잡힙니다.

${data.note}
`
}

const FOOTER = `← [[index|메인]]
`

function writeTimeline() {
  const body = generateTimelineBody()
  const content = [
    buildHeader(),
    "<!-- timeline:start -->",
    "",
    body,
    "<!-- timeline:end -->",
    "",
    FOOTER,
  ].join("\n")
  fs.writeFileSync(TIMELINE_MD, content, "utf-8")
  const events = data.parts.reduce((a, p) => a + p.events.length, 0)
  console.log(
    `✔ ${path.relative(ROOT, TIMELINE_MD)} (${data.parts.length} parts, ${events} events)`,
  )
}

// ── 성경 콜아웃 작성 ──────────────────────────────────────────────────────

function collectChapterCallouts() {
  // chapterFile (예: "마1") → { gospel, entries: [{ verseStart, event, scriptures }] }
  const byChapter = new Map()
  for (const part of data.parts) {
    for (const event of part.events) {
      const byChapterFile = new Map() // 같은 장 안의 여러 ref 를 하나로 묶기 위함
      for (const s of event.scriptures) {
        const cf = chapterFile(s)
        if (!byChapterFile.has(cf)) {
          byChapterFile.set(cf, { gospel: s.gospel, scriptures: [] })
        }
        byChapterFile.get(cf).scriptures.push(s)
      }
      for (const [cf, { gospel, scriptures }] of byChapterFile) {
        scriptures.sort((a, b) => a.ref.verseStart - b.ref.verseStart)
        const verseStart = scriptures[0].ref.verseStart
        if (!byChapter.has(cf)) {
          byChapter.set(cf, { gospel, entries: [] })
        }
        byChapter.get(cf).entries.push({ verseStart, event, scriptures })
      }
    }
  }
  for (const v of byChapter.values()) {
    v.entries.sort((a, b) => a.verseStart - b.verseStart)
  }
  return byChapter
}

function formatChapterCallout(entry) {
  const { event, scriptures } = entry
  const refsCombined = scriptures.map(refString).join(", ")
  const lines = []
  lines.push(`<!-- timeline-callout:${event.id} -->`)
  lines.push(`> [!info] 타임라인 — ${eventLink(event)} (${refsCombined})`)
  for (const s of scriptures) {
    const lead = s.title ? `**${s.title}**: ` : ""
    lines.push(`> ${lead}${s.summary}`)
  }
  if (event.comparison) {
    lines.push(`>`)
    lines.push(`> *복음서 간 차이는 ${eventLink(event, "타임라인")}에서 확인.*`)
  }
  lines.push(`<!-- /timeline-callout -->`)
  return lines.join("\n")
}

function stripPreviousCallouts(content) {
  // 1) 마커 블록 제거 (이번 빌드의 것 + 이전 빌드의 것)
  content = content.replace(
    /<!-- timeline-callout:[^\n]*-->\n[\s\S]*?<!-- \/timeline-callout -->\n?\n?/g,
    "",
  )
  // 2) legacy 손글씨 콜아웃 제거 — `> [!info] 타임라인 ...` 블록 전체
  content = content.replace(
    /^> \[!info\] 타임라인[^\n]*\n(?:>.*\n)*\n?/gm,
    "",
  )
  return content
}

function writeGospelCallouts() {
  const byChapter = collectChapterCallouts()
  let updated = 0
  let skipped = 0
  for (const [cf, { gospel, entries }] of byChapter) {
    const folder = GOSPEL_FOLDER[gospel]
    const filePath = path.join(SCRIPTURE_DIR, folder, `${cf}.md`)
    if (!fs.existsSync(filePath)) {
      console.warn(`  ⚠ skip (missing): ${path.relative(ROOT, filePath)}`)
      skipped++
      continue
    }
    let content = fs.readFileSync(filePath, "utf-8")
    content = stripPreviousCallouts(content)

    // 가장 큰 verseStart 부터 거꾸로 삽입 → 인덱스 시프트 영향 없음
    const sortedEntries = [...entries].sort(
      (a, b) => b.verseStart - a.verseStart,
    )
    for (const entry of sortedEntries) {
      const callout = formatChapterCallout(entry)
      const headerRegex = new RegExp(
        `^###### ${entry.verseStart}(?=\\b|$)`,
        "m",
      )
      if (!headerRegex.test(content)) {
        console.warn(
          `  ⚠ ${cf}: cannot find verse heading ###### ${entry.verseStart}`,
        )
        continue
      }
      content = content.replace(
        headerRegex,
        `${callout}\n\n###### ${entry.verseStart}`,
      )
    }
    fs.writeFileSync(filePath, content, "utf-8")
    updated++
  }
  console.log(
    `✔ 성경 콜아웃: ${updated} 장 갱신, ${skipped} 장 건너뜀 (장 파일 없음)`,
  )
}

// ── places 사건 목록 작성 ─────────────────────────────────────────────────

function collectPlaceEvents() {
  const byPlace = new Map()
  for (const part of data.parts) {
    for (const event of part.events) {
      for (const p of event.places ?? []) {
        const { id } = placeRef(p)
        if (!byPlace.has(id)) byPlace.set(id, [])
        byPlace.get(id).push(event)
      }
    }
  }
  return byPlace
}

function generatePlaceEventsBlock(events) {
  const lines = []
  lines.push("<!-- timeline-events:start -->")
  lines.push("## 예수의 생애 관련 사건")
  for (const e of events) lines.push(`- ${eventLink(e)}`)
  lines.push("<!-- timeline-events:end -->")
  return lines.join("\n")
}

function replacePlaceEventsBlock(content, block) {
  const marker = /<!-- timeline-events:start -->[\s\S]*?<!-- timeline-events:end -->/
  if (marker.test(content)) return content.replace(marker, block)
  // legacy: 기존 "## 예수의 생애 관련 사건" 섹션을 블록 단위로 교체
  const legacy = /## 예수의 생애 관련 사건\n(?:- .*\n?)*/
  if (legacy.test(content)) return content.replace(legacy, block + "\n")
  // 없으면 마지막에 추가
  return content.trimEnd() + "\n\n" + block + "\n"
}

function writePlaceEvents() {
  const byPlace = collectPlaceEvents()
  let updated = 0
  const missing = []
  for (const [placeId, events] of byPlace) {
    const filePath = path.join(PLACES_DIR, `${placeId}.md`)
    if (!fs.existsSync(filePath)) {
      missing.push(placeId)
      continue
    }
    let content = fs.readFileSync(filePath, "utf-8")
    const block = generatePlaceEventsBlock(events)
    content = replacePlaceEventsBlock(content, block)
    fs.writeFileSync(filePath, content, "utf-8")
    updated++
  }
  console.log(
    `✔ places 사건 목록: ${updated} 파일 갱신` +
      (missing.length
        ? `, ${missing.length} 파일 없음 → ${missing.join(", ")}`
        : ""),
  )
}

// ── places 4복음서 본문 작성 (사건의 scriptures 를 장소별로 역집계) ───────

function collectPlaceScriptures() {
  // placeId → [{ event, scripture }]
  const byPlace = new Map()
  for (const part of data.parts) {
    for (const event of part.events) {
      for (const p of event.places ?? []) {
        const { id } = placeRef(p)
        if (!byPlace.has(id)) byPlace.set(id, [])
        for (const s of event.scriptures) {
          byPlace.get(id).push({ event, scripture: s })
        }
      }
    }
  }
  return byPlace
}

function placeScriptureLine({ event, scripture }) {
  const ref = scriptureLink(scripture)
  const eventBit = `${event.id} ${event.title}`
  const titleBit = scripture.title ? ` *(${scripture.title})*` : ""
  return `- ${ref} — ${eventBit}${titleBit}`
}

function generatePlaceScripturesBlock(entries) {
  const lines = []
  lines.push("<!-- timeline-scriptures:start -->")
  lines.push("## 관련 성경 본문")
  for (const entry of entries) lines.push(placeScriptureLine(entry))
  lines.push("<!-- timeline-scriptures:end -->")
  return lines.join("\n")
}

function replacePlaceScripturesBlock(content, block) {
  // 1) 마커 블록이 있으면 교체
  const marker = /<!-- timeline-scriptures:start -->[\s\S]*?<!-- timeline-scriptures:end -->/
  if (marker.test(content)) return content.replace(marker, block)
  // 2) 손으로 쓴 `## 관련 성경 본문` 섹션이 이미 있으면 건드리지 않음
  if (/^## 관련 성경 본문/m.test(content)) return null
  // 3) timeline-events:end 마커 뒤에 삽입
  const eventsEnd = /<!-- timeline-events:end -->/
  if (eventsEnd.test(content)) {
    return content.replace(
      eventsEnd,
      "<!-- timeline-events:end -->\n\n" + block,
    )
  }
  // 4) 그것도 없으면 파일 끝에 추가
  return content.trimEnd() + "\n\n" + block + "\n"
}

function writePlaceScriptures() {
  const byPlace = collectPlaceScriptures()
  let updated = 0
  let preserved = 0
  const missing = []
  for (const [placeId, entries] of byPlace) {
    const filePath = path.join(PLACES_DIR, `${placeId}.md`)
    if (!fs.existsSync(filePath)) {
      missing.push(placeId)
      continue
    }
    const content = fs.readFileSync(filePath, "utf-8")
    const block = generatePlaceScripturesBlock(entries)
    const next = replacePlaceScripturesBlock(content, block)
    if (next === null) {
      preserved++
      continue
    }
    if (next !== content) {
      fs.writeFileSync(filePath, next, "utf-8")
      updated++
    }
  }
  console.log(
    `✔ places 관련 성경 본문: ${updated} 자동 갱신, ${preserved} 손글씨 유지` +
      (missing.length ? `, ${missing.length} 파일 없음` : ""),
  )
}

// ── main ─────────────────────────────────────────────────────────────────

writeTimeline()
writeGospelCallouts()
writePlaceEvents()
writePlaceScriptures()
console.log("Done.")
