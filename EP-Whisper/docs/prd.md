# Whisper‑EP – Painting PRD for Cursor (MEPS‑driven, Voice‑to‑Estimate)

**Version:** 1.0
**Date:** 2025‑10‑14
**Owners:** Johan Jonsson (PM)
**Target markets:** SE (primary)
**Repo:** `estimatepro/whisper‑ep`

---

## 1) Purpose & Outcome

Build a **voice‑driven companion** to EstimatePro that turns a spoken room walkthrough into a **cost proposal** for painting jobs.

* **Single source of truth:** an **Excel file** with MEPS painting parts (tasks, units, norms, prices).
* **Strict scope:** the app **may only suggest tasks present in the Excel** (no free‑form hallucinations).
* **Flow:** User speaks → app parses dimensions & openings → computes gross/net paint areas → maps to MEPS tasks from Excel → outputs **line‑itemed estimate** + **voice & text confirmation** → (optional) **creates project** in EstimatePro.

### Success Criteria (MVP)

* TTR (time‑to‑result) ≤ **60 seconds** from “Start room” to proposal preview.
* Task suggestions **100% derived from Excel row IDs**; zero out‑of‑catalog items.
* Quantity error ≤ **±3%** vs manual calculation on 10 sample rooms.
* Usable in **Swedish only** (input and output).
* **Hands‑free loop:** user can correct via short voice commands (e.g., “subtract one window”).

---

## 2) Out of Scope (MVP)

* Non‑painting trades (flooring installation, carpentry, electrical). Note: **floor painting** (concrete/wooden floors) IS included.
* Complex surface condition modeling (mold, moisture diagnostics).
* Automatic supplier price scraping.
* Multi‑room routing with floorplans; we handle rooms **one at a time**.

---

## 3) Personas & Jobs‑to‑be‑Done

* **Small painting contractor (SE/BR):** Wants to walk a site, speak measurements & tasks, and leave with a tidy, professional proposal.
* **Estimator inside a larger firm:** Wants catalog‑true tasks (MEPS), consistent units (m²/lpm/st), and auditability (transcript).

---

## 4) Source of Truth: MEPS Painting Excel

**Requirement:** All tasks used by the app are read from an **Excel** file (XLSX/CSV). The file must include at least these columns:

| Column                     | Type                                       | Required | Description                                   |
| -------------------------- | ------------------------------------------ | -------: | --------------------------------------------- |
| `meps_id`                  | string                                     |        ✓ | Stable code (e.g., `MÅL‑VÄGG‑SPACK‑BRED‑M2`). |
| `task_name_sv`             | string                                     |        ✓ | Swedish task name used in UI/output.          |
| `task_name_en`             | string                                     |        ✓ | English name (fallback).                      |
| `unit`                     | enum{`m2`,`lpm`,`st`}                      |        ✓ | Billing unit.                                 |
| `labor_norm_per_unit`      | number                                     |        ✓ | Hours per unit (e.g., `0.25 h/m²`).           |
| `material_factor_per_unit` | number                                     |        ✓ | Liters/kg per unit or coefficient.            |
| `default_layers`           | int                                        |          | Paint coats default (e.g., 2).                |
| `surface_type`             | enum{`vägg`,`tak`,`golv`,`dörr`,`fönster`,`list`} |          | For matching.                                 |
| `prep_required`            | bool                                       |          | If surface requires prep line item.           |
| `synonyms`                 | string                                     |          | Semicolon list for NLP mapping (sv/en).       |
| `price_material_per_unit`  | number                                     |          | Optional fixed material price.                |
| `price_labor_per_hour`     | number                                     |          | If present, overrides global default.         |
| `markup_pct`               | number                                     |          | Optional line‑level markup %.                 |

**Validation at import:**

* Reject rows without `meps_id`, `task_name_sv`, `unit`, `labor_norm_per_unit`.
* Units constrained to {`m2`,`lpm`,`st`}; numeric fields must parse with locale (`,` or `.` decimal).

**Behavior:** The system **must not** emit any task not present in this file.

---

## 5) Voice‑First Flow (Happy Path)

1. **Wake:** “Start ett nytt projekt” / “New project for client X, job ‘Repaint Apartment 3B’.”
   → App **creates EstimatePro project** draft with `client_name` and `project_name` (see §8).
2. **Room start:** “Let’s start with the bedroom — call it main bedroom.”
3. **Dimensions:** “2 by 5 meters, height 2.5. One 2‑meter wall is covered by wardrobes. One standard door. One window 1.2 by 1.2.”
   → App confirms parsed geometry and openings.
4. **Tasks (in Swedish):** “Vi ska spackla väggar, fönster och dörr en sida samt bredspackla taket. Båda ytorna ska täckmålas två gånger.”
   → App maps these to **MEPS tasks** (only from Excel).
5. **Compute:** App calculates **gross & net areas**, subtracts openings, applies wardrobes rule, computes labor & materials from norms.
6. **Confirm (voice + text):** Quantities, tasks, and **price**.
7. **Output:** A **complete cost proposal** with line items (task, qty, unit, unit price, subtotal), taxes/ROT note (SE), and a summary total.
8. **Iterate:** User can say “lägg till listmålning lpm 12” or “remove window deduction” etc.
9. **Save/Export:** Save to EstimatePro; export PDF.

---

## 6) Geometry & Quantity Rules

**Room model** (rectangular for MVP): width `W`, length `L`, height `H`.

**Wall area – gross:**
`A_walls_gross = 2*(W+L)*H`

**Ceiling area – gross:**
`A_ceiling_gross = W*L`

**Openings deductions:**

* **Door (standard):** default `0.9 m × 2.1 m = 1.89 m²` per leaf unless explicit size given.
* **Window:** use provided size (e.g., `1.2 × 1.2 = 1.44 m²`).
* Deduct from the **relevant surface** (walls for doors/windows; never from ceiling).

**Wardrobe‑covered wall:**

* If a wall face is **fully covered** by built‑ins, exclude its area from paintable wall area, unless user explicitly says to paint built‑ins.
* For “one 2 m wall is covered”: deduct `2 * H` from walls; if partial, allow a % deduction (default 100%).

**Net areas:**
`A_walls_net = A_walls_gross − sum(openings) − wardrobes_deduction`
`A_ceiling_net = A_ceiling_gross` (no deduction unless skylights in future)

**Linear units:**

* Perimeter for trims/lists: `Perimeter = 2*(W+L)`; user can override.

**Rounding:**

* Areas to **0.1 m²**, lengths to **0.1 lpm**, pieces as integers.

---

## 7) Task Mapping (Excel‑only)

**Principle:** Every spoken intent must resolve to **one or more `meps_id` rows** in the Excel.

**Examples (Swedish → MEPS):**

* “spackla väggar” → `MÅL‑VÄGG‑SPACK‑BRED‑M2` (unit m², apply to `A_walls_net`).
* “bredspackla taket” → `MÅL‑TAK‑SPACK‑BRED‑M2` (unit m², apply to `A_ceiling_net`).
* “täckmålas två gånger” → two coats: map to `MÅL‑VÄGG‑MÅLA‑TÄCK‑M2 (layers=2)` and `MÅL‑TAK‑MÅLA‑TÄCK‑M2 (layers=2)` as needed.
* “dörr en sida” → `MÅL‑DÖRR‑MÅLA‑1SIDA‑ST` with qty = number of door leaves * 1 side.
* “fönster” (paint frames) → `MÅL‑FÖNSTER‑MÅLA‑ST` (qty = count); if only glazing/opening deduction → no paint item.

**Synonym handling:** Use `synonyms` column and a small rule set:

* `spackla`, `spackling`, `bredspackla` → spackle;
* `täckmåla`, `slutstrykning`, `två lager` → cover paint 2 coats; etc.

**Guard‑rails:** If an intent cannot be mapped to a `meps_id`, **ask for clarification** or ignore it (never invent a task).

---

## 8) Integrations

### 8.1 EstimatePro (placeholder API)

* `POST /projects`: `{ client_name, project_name, market:"SE"|"BR" }` → returns `project_id`.
* `POST /projects/{id}/rooms`: `{ name, W, L, H, doors:[{w,h,sides}], windows:[{w,h}], wardrobes:[{length,coverage_pct}] }`.
* `POST /projects/{id}/estimate`: `{ lines:[{meps_id, qty, unit, unit_price, subtotal}], totals:{ labor, material, markup, tax, grand_total } }`.

### 8.2 Speech (Whisper)

* **ASR:** OpenAI Whisper with language locked to **sv-SE**; VAD on.
* **TTS:** Swedish voice via `tts-1` (sv-SE) for confirmations.

---

## 9) Pricing & Totals

* **Labor price/h:** default **500 SEK** (override per Excel row if `price_labor_per_hour` present).
* **Material:** either from `price_material_per_unit` or `material_factor_per_unit * catalog_price` (MVP: use fixed price field).
* **Markup:** apply row `markup_pct` if present; else global **10%**.
* **Taxes/ROT:** show **ROT note** (SE) but do not compute ROT deduction in MVP.
* **Output fields:** unit price, qty, subtotal, section totals (Prep, Paint, Finish), grand total.

---

## 10) UX/UI (Cursor preview)

* **Controls:** Push‑to‑talk button (plus auto‑VAD), transcript live view, correction chips (e.g., “−1 window”, “+2 coats”).
* **Room card:** shows W×L×H, openings, deductions, net areas.
* **Estimate table:** MEPS code, task name (sv), qty, unit, unit price, line total.
* **Voice confirm:** After each step, short TTS: “Väggar netto 31.3 m², tak 10.0 m². Fortsätta?”

---

## 11) NLP & Command Grammar (MVP)

**Language scope V1: Swedish only.** Commands are expected in Swedish; if other languages are detected, prompt user in Swedish to repeat.

* **Project:** “nytt projekt för [kund] med namn [projekt]”.
* **Rum:** “starta rum [namn]”, valfria mått W×L×H.
* **Mått:** “2 gånger 5, höjd 2 komma 5”.
* **Öppningar:** “en standarddörr”, “ett fönster 1 komma 2 gånger 1 komma 2”.
* **Garderober:** “en 2‑meters vägg täcks av garderober”.
* **Uppgifter:** “spackla väggar”, “bredspackla taket”, “täckmåla två gånger”, “måla dörr en sida”, “måla fönster”.
* **Korrigeringar:** “ta bort fönstret”, “lägg till en dörr”, “höjden är 2 komma 6”.

---

## 12) Calculation Example (from the prompt)

Input: `W=2 m, L=5 m, H=2.5 m`, **one 2 m wall covered**, **1 door std**, **1 window 1.2×1.2**.

* Walls gross: `2*(2+5)*2.5 = 35.0 m²`
* Openings: door `1.89`, window `1.44` → `3.33 m²`
* Wardrobe deduction: `2 * 2.5 = 5.0 m²`
* **Walls net:** `35.0 − 3.33 − 5.0 = 26.67 m²` → **26.7 m²**
* **Ceiling net:** `2*5 = 10.0 m²`

Map spoken tasks to Excel MEPS rows and compute line items (examples):

* `MÅL‑VÄGG‑SPACK‑BRED‑M2` × 26.7 m²
* `MÅL‑TAK‑SPACK‑BRED‑M2` × 10.0 m²
* `MÅL‑VÄGG‑MÅLA‑TÄCK‑M2 (layers=2)` × 26.7 m²
* `MÅL‑TAK‑MÅLA‑TÄCK‑M2 (layers=2)` × 10.0 m²
* `MÅL‑DÖRR‑MÅLA‑1SIDA‑ST` × 1 st
* `MÅL‑FÖNSTER‑MÅLA‑ST` × 1 st (if requested)

Totals computed via norms and prices (see §9).

---

## 13) Data Model (App)

```ts
// Typescript sketch
export type Unit = 'm2'|'lpm'|'st';
export interface MepsRow {
  meps_id: string;
  task_name_sv: string;
  task_name_en?: string;
  unit: Unit;
  labor_norm_per_unit: number; // h per unit
  material_factor_per_unit?: number;
  default_layers?: number;
  surface_type?: 'vägg'|'tak'|'golv'|'dörr'|'fönster'|'list';
  prep_required?: boolean;
  synonyms?: string; // semicolon‑separated
  price_material_per_unit?: number;
  price_labor_per_hour?: number;
  markup_pct?: number;
}

export interface RoomGeometry {
  W: number; L: number; H: number;
  doors: { w?: number; h?: number; sides?: 1|2 }[];
  windows: { w: number; h: number }[];
  wardrobes: { length: number; coverage_pct?: number }[]; // along wall length
}

export interface LineItem { meps_id: string; name: string; unit: Unit; qty: number; unit_price: number; subtotal: number; }
```

---

## 14) Algorithms & Pseudocode

**Area computation**

```pseudo
walls_gross = 2*(W+L)*H
openings = sum(door.w*door.h) + sum(window.w*window.h)
wardrobes_deduction = sum(w.length * H * (coverage_pct||1.0))
walls_net = max(0, walls_gross - openings - wardrobes_deduction)
ceiling_net = W*L
```

**Task expansion**

```pseudo
for each spoken_intent in intents:
  rows = find_rows_matching_intent(spoken_intent, excel_rows)
  if rows.empty: continue // never invent
  for row in rows:
    qty = choose_quantity_by_surface(row.surface_type)
    if is_paint_with_layers(row): qty *= layers
    price_h = row.price_labor_per_hour || global_labor_price
    unit_price = price_h * row.labor_norm_per_unit + (row.price_material_per_unit||0)
    subtotal = qty * unit_price * (1 + (row.markup_pct||global_markup))
    add_line(row.meps_id, row.task_name_sv, row.unit, qty, unit_price, subtotal)
```

---

## 15) Error Handling & Guard‑Rails

* If units ambiguous (“1,2×1,2”), accept both comma and dot decimals.
* If wardrobe phrase unclear, default to **full coverage** of stated length.
* If door size missing, use **standard** 0.9×2.1 m.
* If audio confidence low, request repeat: “Ursäkta, repeterar du måtten?”
* **Never** output tasks not found in Excel.
* On price gaps, show “pris saknas” and allow user to set per hour or per unit.

---

## 16) Telemetry & Audit

* Store: audio transcript, parsed commands, chosen `meps_id`s, geometry inputs, calculation snapshots, final lines & totals.
* Metrics: completion rate, correction rate, avg latency, pct Excel‑unmatched intents.

---

## 17) Testing & Acceptance

**Unit tests:** geometry parser, area math (doors/windows/wardrobes), Excel import validator, intent→MEPS mapper.
**Integration tests:** full happy path per §12 in sv/en, plus corrections.
**Golden files:** 10 rooms with hand‑checked quantities (±3%).
**Manual checklist:**

* Imports example Excel (200+ rows) without errors.
* Blocks any non‑Excel task.
* Produces proposal PDF with totals.

---

## 18) Rollout Plan

* **Milestone A:** Import Excel + geometry math + CLI draft output.
* **Milestone B:** Voice in/out, intent→MEPS mapping, UI table.
* **Milestone C:** EstimatePro API hookup + PDF export + telemetry.
* Pilot with **5 painters** (SE), iterate, then general beta.

---

## 19) Open Questions

* Should wardrobes deduction also remove trims/lists on that wall automatically? (MVP: **no**)
* ROT calculation in‑app or at PDF stage?
* BR market taxes (ISS/ICMS) — include now or later?

---

## 20) Sample Prompts (use in demos)

* **Project start:** “Nytt projekt för kund Andersson Fastigheter, namn Lägenhet 3B.”
* **Room + dims:** “Starta rum master bedroom, 2 gånger 5, höjd 2 komma 5. En 2‑meters vägg täcks av garderober. En standarddörr. Ett fönster 1 komma 2 gånger 1 komma 2.”
* **Tasks:** “Spackla väggar och fönster, måla dörr en sida, bredspackla taket. Täckmåla väggar och tak två gånger.”
* **Correction:** “Ta bort fönstermålningen. Lägg till listmålning 12 löpmeter.”

---

## 21) Deliverables (MVP)

* `docs/` this PRD.
* `excel/painting_meps.xlsx` with columns per §4.
* `app/` Next.js frontend + API routes.
* `lib/` geometry, parser, mapper, calculator modules.
* `tests/` unit + integration golden cases.
* `export/` PDF template (SE branding black+lime).

---

## 22) Appendix A – Swedish Task Lexicon (examples)

* **Spackla väggar** → bredspackling vägg (m²)
* **Bredspackla tak** → bredspackling tak (m²)
* **Täckmåla (2 gg)** → slutstrykning täck 2 lager (m²)
* **Måla dörr en sida** → dörrmålning 1 sida (st)
* **Måla fönster** → fönstermålning (st)
* **Listmålning** → målning lister (lpm)

---

## 23) Appendix B – Voice & Locale Notes

* **Språk:** Endast svenska (sv-SE) i V1. Upptäcks annat språk → appen ber användaren att upprepa på svenska.
* **Tal:** decimal **komma** föredras; **punkt** accepteras men normaliseras till komma i UI och PDF.
* **Diakritik:** ÅÄÖ stöds i hela UI och export.

---

## 25) LLM‑träning: dataset baserat på mallar (svenska)

**Mål:** LLM (eller liten intent‑modell) ska **enbart** föreslå uppgifter som finns i Excel och **inom vald malltyp** (§7.1).

### 25.1 Datakällor

* **Excel‑delar** (per §4) → generera svenska fraser & tokenlexikon per rad/mall.
* **Systemprompt (sv‑SE)** som beskriver kontext/mallinstans‑scope och strikt whitelistning.
* **Historiska transkript** (när de finns) för finjustering.
* **Skärmdumpar av mallar** används endast för QA, inte som träning.

### 25.2 Syntetiska fraser (auto‑generering i build)

För varje Excel‑rad inom aktiv kontext/mallinstans skapas 10–20 variationer: böjningar, ordningsskiften, decimal komma/punkt, singular/plural.
**Exempel:**

* *Rumsbaserad:* “bredspackla väggar”, “spackla vägg slät”, “täckmåla vägg 2 gånger”, “slutstrykning vägg två lager”.
* *Dörrar (st):* “måla dörr en sida”, “dörrmålning 1 sida”, “måla dörr 2 sidor”.
* *Lister (m/lpm):* “listmålning 12 meter”, “måla sockel 8 löpmeter”, “tejpa taklist 6 m”.

### 25.3 Annotering & schema

Varje yttrande märks med `{ mall:'rum'|'dörr'|'profil', intents:[…], meps_id:[…] }`.
Inferensoutput valideras med Zod innan kalkyl.

### 25.4 Guard‑rails i inferens

* Whitelist = Excel `meps_id` **∩** mallens tillåtna kategorier.
* Vid låg säkerhet: “Jag hittade inte uppgiften i katalogen för denna mall – kan du formulera om?”.

### 25.5 Mätetal

* Precision/recall per kontext/mallinstans (mål ≥ **0,95 precision**).
* Andel avsikter utanför mall (mål < **2%**).
* Manuell QA: 50 yttranden/mall vid varje Excel‑uppdatering.

---

## 26) Koppling i runtime för kontext/mallinstans

* När användaren startar ett rum eller anger komponenttyp väljs **aktiv kontext/mallinstans**:
  **(1) Rumsbaserad m²**, **(2) Dörr/Fönster st**, **(3) Lister/Profiler m/lpm**.
* Parser/LLM får endast föreslå `meps_id` som hör till aktiv kontext/mallinstans.
* Byte av mall sker bara när användaren explicit anger ny komponenttyp (t.ex. “Lägg till dörrmålning…”).
* UI visar aktuell kontext/mallinstans i topp (“Mall: Rumsbaserad”).

---

## Amendment A – Mallar är dynamiska (korrigering)

**Detta avsnitt ersätter alla tidigare formuleringar som kan tolkas som att appen är låst till tre mallar.**

* **Mallar = dynamiska paket** av MEPS‑rader som skapas utifrån kontext (yta/komponent/enhetstyp) och användarens kommandon.
* Systemet kan **ha flera samtidiga mallinstanser** i ett rum (t.ex. Rumsbaserad m² + Dörrar st + Lister m/lpm).
* De tre mallarna *Rum (m²)*, *Dörr/Fönster (st)*, *Lister/Profiler (m/lpm)* i PRD:n är **exempelmallar** som används för **LLM‑träning, QA och dokumentation** – inte en begränsning av funktionalitet.
* Parser/LLM **begränsar förslag** till `meps_id` som är relevanta för **nuvarande kontext** och för valda/aktiva mallinstanser, men appen är **inte** begränsad till ett fast antal malltyper.
* UI ska visa **aktiva mallinstanser** (chips) och låta användaren lägga till/ta bort dem via röst eller klick.

## Amendment B – LLM‑träning kopplat till mallar

* Träningsdata genereras per **mallinstans** (dynamisk) där Excel‑raderna definierar tillåtna `meps_id` och synonymer.
* De tre exempelmallarna fungerar som **seed‑dataset**; när nya mallinstanser uppstår i verklig användning adderas deras fraser till korpusen.
