#!/usr/bin/env node
// content/timeline-plugin.md 의 data-start-date / data-end-date 를 읽어
// content/.obsidian/snippets/timeline-bc-ad.css 를 자동 생성한다.
//
// Timelines (Revamped) 플러그인은 era 를 년도 뒤에만 붙이고 (`-6 BC`), prefix
// 위치는 지원하지 않는다. 또 음수 부호도 그대로 노출한다. 이 스크립트가
// 만드는 CSS snippet 은 각 연도별로 h2 의 글자를 숨기고 ::before 로
// "BC 6" / "AD 7" 형태로 치환한다.
//
// 사용:  node scripts/build-timeline-css.mjs

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "..")
const TIMELINE_MD = path.join(ROOT, "content", "timeline-plugin.md")
const SNIPPETS_DIR = path.join(ROOT, "content", ".obsidian", "snippets")
const SNIPPET = path.join(SNIPPETS_DIR, "timeline-bc-ad.css")

const MAX_DIGITS = 5 // 플러그인 data.json 의 maxDigits 값과 일치해야 함

function normalizeYearPrefix(signedYear) {
  // 플러그인은 normalizedDateString 의 각 섹션을 maxDigits(5) 자리로 패딩.
  // 우리는 `^="-00006-"` 같은 prefix 셀렉터로 그 연도만 골라 잡기 위해
  // "-00006-" 또는 "00007-" 형식 prefix 를 생성한다.
  const padded = Math.abs(signedYear).toString().padStart(MAX_DIGITS, "0")
  return signedYear < 0 ? `-${padded}-` : `${padded}-`
}

function parseDateAttr(dateStr) {
  const m = dateStr.match(/^(-?)(\d+)/)
  if (!m) return null
  return m[1] === "-" ? -parseInt(m[2], 10) : parseInt(m[2], 10)
}

const content = fs.readFileSync(TIMELINE_MD, "utf-8")
const dateRegex = /data-(?:start|end)-date="([^"]+)"/g

const yearSet = new Set()
let m
while ((m = dateRegex.exec(content))) {
  const yr = parseDateAttr(m[1])
  if (yr !== null) yearSet.add(yr)
}

const sortedYears = [...yearSet].sort((a, b) => a - b)

const out = []
out.push("/*")
out.push(" * AUTO-GENERATED — do not edit. Source: content/timeline-plugin.md")
out.push(" * Run: node scripts/build-timeline-css.mjs")
out.push(" *")
out.push(" * Timelines (Revamped) 플러그인 기본 표시 '-6 BC' / '7 AD' → 'BC 6' / 'AD 7' 로 치환.")
out.push(" * 활성화: Obsidian Settings → Appearance → CSS snippets → 'timeline-bc-ad' 토글 ON")
out.push(" */")
out.push("")
out.push("/* 공통: 모든 타임라인 h2 의 원본 텍스트 숨기고 ::before overlay 준비 */")
out.push(".timeline-container > h2 {")
out.push("  visibility: hidden !important;")
out.push("  position: relative !important;")
out.push("  min-height: 1.5em !important;")
out.push("}")
out.push(".timeline-container > h2::before {")
out.push("  visibility: visible !important;")
out.push("  position: absolute !important;")
out.push("  left: 0 !important;")
out.push("  right: 0 !important;")
out.push("  top: 0 !important;")
out.push("  display: block !important;")
out.push("  text-align: inherit !important;")
out.push("  font-size: var(--h2-size, 1.5rem) !important;")
out.push("  font-weight: var(--h2-weight, 700) !important;")
out.push("  color: var(--h2-color, inherit) !important;")
out.push("  line-height: var(--h2-line-height, 1.4) !important;")
out.push("}")
out.push("")
out.push("/* 연도별 content 만 따로 정의 */")

for (const yr of sortedYears) {
  const padded = normalizeYearPrefix(yr)
  const display = yr < 0 ? `BC ${-yr}` : `AD ${yr}`
  out.push(`.timeline-container[timeline-date^="${padded}"] > h2::before { content: "${display}" !important; }`)
}
out.push("")

fs.mkdirSync(SNIPPETS_DIR, { recursive: true })
fs.writeFileSync(SNIPPET, out.join("\n"), "utf-8")

console.log(`✔ ${path.relative(ROOT, SNIPPET)}`)
console.log(`  ${sortedYears.length} year rules: ${sortedYears.map((y) => (y < 0 ? `BC ${-y}` : `AD ${y}`)).join(", ")}`)
console.log()
console.log("다음:")
console.log("  Obsidian → Settings → Appearance → CSS snippets 에서")
console.log("  'timeline-bc-ad' 를 토글 ON (없으면 새로고침)")
