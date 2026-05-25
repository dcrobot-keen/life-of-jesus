---
title: 예수의 생애 — Timeline Plugin
description: Obsidian Timelines (Revamped) 플러그인을 이용한 시각화
tags:
  - timeline
  - timeline-jesus/part1
  - jesus
  - gospels
---

# 예수의 생애 — Timeline Plugin (1부)

[Timelines (Revamped)](https://github.com/Seanlowe/obsidian-timelines) 플러그인이 vault 안의 모든 `&lt;div class='ob-timelines'&gt;` 사건을 스캔해서, 파일 tags 가 매칭되는 것을 모아 시각화합니다.

이 파일은 두 개의 태그를 갖고 있어야 합니다:
- **`timeline`** — 플러그인의 기본 `timelineTag` 설정. 필수.
- **`timeline-jesus/part1`** — 이 부만 추리는 추가 필터.

아래 11개의 `&lt;div class="ob-timelines"&gt;` 사건이 모두 이 두 태그를 상속받고, 코드블록의 `tags=timeline-jesus/part1` 로 1부만 필터링됩니다.

---

## 1부 · 탄생과 유년기 (BC 6 ~ AD 8)

### 시각화

```ob-timeline
tags=timeline-jesus/part1
divHeight=500
startDate=-0007-01-01-00
endDate=0010-01-01-00
dateFormat=YYYY
```

> [!tip] 가로형으로 보고 싶다면
> 위 코드블록에 `type=flat` 한 줄을 추가하면 vis-timeline 가로형으로 렌더됩니다. 기본은 세로형.

### 사건 정의

> [!warning] Reading view에서 보세요
> 아래 `<div>` 들은 Editing view에서는 HTML 코드로 보이고, Reading view + 플러그인 활성 상태에서는 위 타임라인 안에 박스로 자동 표시됩니다.
> 날짜 표기 `YYYY-MM-DD-HH`. BC 는 음수 (`-0006-...`). 플러그인이 각 섹션을 5자리로 자동 패딩해서 정렬합니다.
>
> **날짜 표시**: codeblock 의 `dateFormat=YYYY` 로 년도만 표시. 각 사건의 `data-era="BC"` / `data-era="AD"` 가 년도 뒤에 추가됨. 표시 결과: `-6 BC`, `-5 BC`, ..., `7 AD`. (플러그인이 era 를 prefix 가 아닌 suffix 로만 붙여서 `BC 6` 형태는 안 되고, `-` 음수 부호도 그대로 표시됩니다.)

<div class="ob-timelines" data-start-date="-0006-01-01-00" data-title="1.1 서문과 족보" data-type="box" data-color="orange" data-era="BC">
<b>시기</b>: 영원 ─ 사역 시작 전<br/>
<b>지역</b>: ─<br/>
[[마1#1|마 1:1-17]] · [[눅3#23|눅 3:23-38]] · [[요1#1|요 1:1-18]]<br/>
마태의 왕적 족보, 누가의 보편적 족보, 요한의 로고스 서문.
</div>

<div class="ob-timelines" data-start-date="-0006-04-01-00" data-title="1.2 세례 요한 잉태 예고" data-type="box" data-color="orange" data-era="BC">
<b>시기</b>: BC 6년경 봄<br/>
<b>지역</b>: [[예루살렘]] 성전<br/>
[[눅1#5|눅 1:5-25]] — 제사장 사가랴가 분향할 때 가브리엘이 나타남. 의심한 사가랴는 벙어리가 됨.
</div>

<div class="ob-timelines" data-start-date="-0006-10-01-00" data-title="1.3 수태고지" data-type="box" data-color="orange" data-era="BC">
<b>시기</b>: BC 6년경 가을 (요한 잉태 6개월 후)<br/>
<b>지역</b>: [[나사렛]]<br/>
[[눅1#26|눅 1:26-38]] — 가브리엘이 마리아에게. "은혜를 받은 자여 평안할지어다 ... 보라 네가 잉태하여 아들을 낳으리니 그 이름을 예수라 하라".
</div>

<div class="ob-timelines" data-start-date="-0006-10-15-00" data-title="1.4 엘리사벳 방문" data-type="box" data-color="orange" data-era="BC">
<b>시기</b>: BC 6년경 (수태고지 직후)<br/>
<b>지역</b>: [[엔케렘]] (유다 산골)<br/>
[[눅1#39|눅 1:39-56]] — 엘리사벳의 태아가 뛰놂. 마리아의 찬가(Magnificat): "내 영혼이 주를 찬양하며".
</div>

<div class="ob-timelines" data-start-date="-0005-01-01-00" data-title="1.5 세례 요한의 출생" data-type="box" data-color="orange" data-era="BC">
<b>시기</b>: BC 5년 초<br/>
<b>지역</b>: [[엔케렘]]<br/>
[[눅1#57|눅 1:57-80]] — 사가랴의 입이 열리고 베네딕투스를 찬송함: "주 이스라엘의 하나님을 찬송하리로다".
</div>

<div class="ob-timelines" data-start-date="-0005-07-01-00" data-title="1.6 예수의 탄생" data-type="box" data-color="red" data-era="BC">
<b>시기</b>: BC 6 ~ 4년 (헤롯 사망 직전)<br/>
<b>지역</b>: [[베들레헴]]<br/>
[[마1#18|마 1:18-25]] (요셉의 관점) · [[눅2#1|눅 2:1-7]] (마리아의 관점)<br/>
가이사 아구스도의 호적 명령으로 베들레헴 행. 구유에 누이심.
</div>

<div class="ob-timelines" data-start-date="-0005-07-01-01" data-title="1.7 목자들의 경배" data-type="box" data-color="orange" data-era="BC">
<b>시기</b>: 탄생 당일 밤<br/>
<b>지역</b>: [[베들레헴]] 들녘<br/>
[[눅2#8|눅 2:8-20]] — 천사들의 합창("지극히 높은 곳에서는 하나님께 영광"). 목자들이 구유의 아기를 방문.
</div>

<div class="ob-timelines" data-start-date="-0005-08-15-00" data-title="1.8 할례와 성전 봉헌" data-type="box" data-color="orange" data-era="BC">
<b>시기</b>: 출생 8일·40일째<br/>
<b>지역</b>: [[예루살렘]] 성전<br/>
[[눅2#21|눅 2:21-38]] — 시므온의 예언("이 아이는 ... 비방을 받는 표적이 되리니"). 여선지 안나의 증언.
</div>

<div class="ob-timelines" data-start-date="-0004-01-01-00" data-title="1.9 동방박사의 방문" data-type="box" data-color="orange" data-era="BC">
<b>시기</b>: BC 5 ~ 4년 (탄생 후 수개월 ~ 2년 이내)<br/>
<b>지역</b>: [[베들레헴]]<br/>
[[마2#1|마 2:1-12]] — 별을 따라온 동방 박사들. 황금·유향·몰약. 헤롯의 거짓 협조와 음모.
</div>

<div class="ob-timelines" data-start-date="-0004-04-01-00" data-end-date="-0004-12-01-00" data-title="1.10 애굽 피난과 영아 학살" data-type="range" data-color="orange" data-era="BC">
<b>시기</b>: BC 4년경 (헤롯 사망 전후)<br/>
<b>지역</b>: [[애굽]] → [[나사렛]]<br/>
[[마2#13|마 2:13-23]] — 요셉의 두 번째 꿈으로 애굽 피난. 헤롯의 영아 학살. 귀환 후 나사렛 정착.
</div>

<div class="ob-timelines" data-start-date="0007-04-01-00" data-title="1.11 12살의 예수, 성전에서" data-type="box" data-color="orange" data-era="AD">
<b>시기</b>: AD 7~8년경 (유월절)<br/>
<b>지역</b>: [[예루살렘]] 성전<br/>
[[눅2#41|눅 2:41-52]] — 유월절 후 부모와 떨어져 성전에서 학자들과 문답. "내가 내 아버지 집에 있어야 될 줄을 알지 못하셨나이까".
</div>

---

### 본문 링크 (플러그인 없이도 보이는 fallback)

- **[[life-of-jesus#1.1 서문과 족보|1.1 서문과 족보]]** — [[마1#1|마 1:1-17]] · [[눅3#23|눅 3:23-38]] · [[요1#1|요 1:1-18]]
- **[[life-of-jesus#1.2 세례 요한의 잉태 예고|1.2 세례 요한 잉태 예고]]** — [[눅1#5|눅 1:5-25]]
- **[[life-of-jesus#1.3 수태고지 (마리아에게)|1.3 수태고지]]** — [[눅1#26|눅 1:26-38]]
- **[[life-of-jesus#1.4 마리아의 엘리사벳 방문|1.4 엘리사벳 방문]]** — [[눅1#39|눅 1:39-56]]
- **[[life-of-jesus#1.5 세례 요한의 출생|1.5 세례 요한의 출생]]** — [[눅1#57|눅 1:57-80]]
- **[[life-of-jesus#1.6 예수의 탄생|1.6 예수의 탄생]]** — [[마1#18|마 1:18-25]] · [[눅2#1|눅 2:1-7]]
- **[[life-of-jesus#1.7 목자들의 경배|1.7 목자들의 경배]]** — [[눅2#8|눅 2:8-20]]
- **[[life-of-jesus#1.8 할례와 성전 봉헌|1.8 할례와 성전 봉헌]]** — [[눅2#21|눅 2:21-38]]
- **[[life-of-jesus#1.9 동방박사의 방문|1.9 동방박사의 방문]]** — [[마2#1|마 2:1-12]]
- **[[life-of-jesus#1.10 애굽 피난과 영아 학살|1.10 애굽 피난·영아 학살]]** — [[마2#13|마 2:13-23]]
- **[[life-of-jesus#1.11 12살의 예수, 성전에서|1.11 12살의 예수]]** — [[눅2#41|눅 2:41-52]]

---

> [!note] 플러그인 문법 메모 (실제 main.js 소스에서 확인)
> - 코드블록 펜스: `ob-timeline` (단수). 인자는 **`key=value`** 형식 (YAML 콜론 ✕). 한 줄에 하나씩
> - 인자 키: `tags`, `divHeight`, `startDate`, `endDate`, `minDate`, `maxDate`, `type`, `zoomInLimit`, `zoomOutLimit`. `type=flat` 이면 가로 vis-timeline, 그 외는 세로형
> - 이벤트: `&lt;div class='ob-timelines'&gt;` (또는 `&lt;span&gt;`)
> - 데이터 속성: **`data-start-date`** (필수), `data-end-date`, `data-title`, `data-type` (box/range), `data-color`, `data-img`, `data-classes`, `data-group`, `data-tags`, `data-description`
> - 날짜: `YYYY-MM-DD-HH`. 음수 = BC. 5자리 자동 패딩 (`-0006` → `-00006`)
> - 파일 frontmatter `tags:` 에 **플러그인의 `timelineTag` 설정값**(기본 `timeline`, 데이터: `content/.obsidian/plugins/timelines-revamped/data.json`)이 반드시 들어가야 그 파일의 이벤트가 인식됨. 추가로 codeblock `tags=` 의 태그도 매칭되어야 함 — 즉 codeblock 의 tagList 에 있는 **모든 태그**(설정 timelineTag + codeblock tags + nested 부모 태그까지)가 파일에 다 있어야 함

← [[index|메인]] · [[life-of-jesus|상세 타임라인]] · [[timeline-mermaid|Mermaid 버전]]
