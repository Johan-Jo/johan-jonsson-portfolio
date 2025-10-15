# EP-Whisper – Voice-to-Estimate Project Plan

## Milestones (från PRD §18)

### Milestone A: Data Foundation & Core Logic

Excel import + geometry calculations + CLI draft output

**Target:** Functional calculation engine with validated Excel data

### Milestone B: Voice & Intelligence Layer  

Voice in/out + intent→MEPS mapping + UI table display

**Target:** End-to-end voice flow with accurate task mapping

### Milestone C: PDF & Telemetry (no external API)

PDF export + telemetry + audit trail

**Target:** Production-ready system with complete reporting and monitoring

---

## Epics & Issues

### Epic 1: Project Setup & Infrastructure

Foundation för Next.js app med TypeScript, testing, CI/CD

- [ ] Initialize Next.js project with TypeScript strict mode
- [ ] Configure ESLint, Prettier, vitest for unit testing
- [ ] Set up project structure: `/lib`, `/app`, `/tests`, `/docs`, `/excel`
- [ ] Create base TypeScript types per PRD §13 (MepsRow, RoomGeometry, LineItem)
- [ ] Configure environment variables template (.env.example)
- [ ] Set up Git repository and .gitignore for secrets
- [ ] Create basic README with setup instructions

### Epic 2: Excel Data Management (Milestone A)

Import, validate och cache MEPS painting catalog

- [ ] Create Excel schema validator with required columns (PRD §4)
- [ ] Build Excel parser supporting XLSX/CSV with Swedish locale (comma decimals)
- [ ] Implement data validation: reject missing meps_id, task_name_sv, unit, labor_norm
- [ ] Create in-memory catalog store with synonym indexing
- [ ] Build Excel import CLI tool with validation reporting
- [ ] Create sample MEPS Excel file with 20+ realistic painting tasks
- [ ] Add unit tests for Excel parser edge cases (empty rows, wrong units)
- [ ] Implement catalog refresh mechanism without app restart

### Epic 3: Geometry & Calculation Engine (Milestone A)

Beräkna netto-ytor för väggar, tak och golv med avdrag för öppningar och garderober

- [x] Implement room area calculations: walls_gross = 2*(W+L)*H (2h)
- [x] Implement ceiling area: ceiling_gross = W*L (1h)
- [x] Implement floor area: floor_gross = W*L (1h)
- [x] Create opening deduction logic (doors: default 0.9×2.1m, windows: custom) (2h)
- [x] Implement wardrobe coverage deduction (length × H × coverage%) (1h)
- [x] Build net area calculator: walls_net, ceiling_net, floor_net with max(0) guard (2h)
- [x] Create perimeter calculator for trim/list items (2*(W+L)) (1h)
- [x] Implement rounding rules (areas 0.1m², lengths 0.1lpm, pieces as int) (1h)
- [x] Add unit tests with golden file from PRD §12 example (30 tests) (3h)
- [x] Create CLI tool to test geometry calculations manually (2h)
- **Acceptance:** Floor painting included with floor_gross and floor_net calculations

### Epic 4: Task Mapping & Pricing (Milestone A)

Kartlägg talad avsikt till MEPS-rader och beräkna priser med Swedish section labels

- [ ] Build synonym matcher using Excel `synonyms` column (2h)
- [ ] Create surface type resolver (vägg/tak/dörr/fönster/list) (1h)
- [ ] Implement quantity selector based on surface_type (use walls_net, ceiling_net, etc.) (2h)
- [ ] Build layers multiplier for paint tasks (default_layers from Excel) (1h)
- [ ] Implement unit price calculator: labor_norm × labor_price + material_price (2h)
- [ ] Apply markup logic (row markup_pct or global 10%) (1h)
- [ ] Create line item generator with subtotal calculation (2h)
- [ ] Add guard-rail: never emit meps_id not found in Excel catalog (1h)
- [ ] Build totals aggregator (labor, material, markup, tax, grand_total) (2h)
- [ ] Add Swedish section labels (Prep, Paint, Finish) and ROT note (1h)
- [ ] Create unit tests for task mapping with Swedish examples from PRD §22 (2h)
- [ ] **Acceptance:** Pricing with Swedish section labels and ROT note

### Epic 5: CLI Draft Output (Milestone A)

Grundläggande textbaserad output för verifiering

- [ ] Create formatted text output for room geometry summary
- [ ] Build estimate table formatter (MEPS code, task, qty, unit, price, subtotal)
- [ ] Implement section totals (Prep, Paint, Finish) with Swedish labels
- [ ] Add ROT note placeholder for Swedish tax display
- [ ] Create CLI command: `whisper-ep estimate --room <json>` for testing
- [ ] Add example JSON input files for 3 common room scenarios
- [ ] Validate ±3% accuracy requirement on 5 manual test cases

### Epic 6: Voice Processing Integration (Milestone B)

OpenAI Whisper ASR + TTS för svenska (sv-SE only)

- [ ] Set up OpenAI API client with Whisper endpoint (2h)
- [ ] Configure Whisper with language=sv-SE, VAD enabled (1h)
- [ ] Implement audio capture from browser/device microphone (2h)
- [ ] Build transcription service with error handling and retry (2h)
- [ ] Configure TTS-1 with sv-SE voice for confirmations (1h)
- [ ] Create voice confirmation templates (Swedish phrases per PRD §10) (1h)
- [ ] Implement push-to-talk button + auto-VAD toggle (2h)
- [ ] Add confidence threshold checking: request repeat if < 0.7 (1h)
- [ ] Build live transcript viewer component (2h)
- [ ] Add unit tests mocking OpenAI responses (2h)
- [ ] **Acceptance:** Swedish-only voice processing with proper decimal comma formatting

### Epic 7: NLP Intent Parser (Milestone B)

Tolka svenska kommandon och kartlägg till MEPS-uppgifter med Excel-whitelist guard-rails

- [ ] Define command grammar for Swedish per PRD §11 (projekt, rum, mått, etc.) (2h)
- [ ] Build regex/parser for dimensions: "2 gånger 5, höjd 2 komma 5" (2h)
- [ ] Implement opening parser: "en standarddörr", "ett fönster 1.2×1.2" (1h)
- [ ] Create wardrobe phrase parser: "en 2-meters vägg täcks av garderober" (1h)
- [ ] Build task intent matcher with Excel synonym lookup (2h)
- [ ] Implement correction parser: "ta bort fönstret", "lägg till en dörr" (2h)
- [ ] Add fallback for unrecognized intents: never hallucinate, ask clarification (1h)
- [ ] Create intent→MEPS resolver using active context/template instance (2h)
- [ ] Build state machine for multi-step conversation flow (2h)
- [ ] Add integration tests with 10 Swedish voice scenarios from PRD §20 (2h)
- [ ] **Acceptance:** Excel-whitelist guard-rails prevent any non-Excel task emission

### Epic 8: UI/UX Implementation (Milestone B)

Next.js frontend med live tabell, röststyrning och dynamic template instances

- [ ] Create main layout with push-to-talk button and transcript area (2h)
- [ ] Build RoomCard component showing W×L×H, openings, net areas (2h)
- [ ] Implement EstimateTable with columns: MEPS, task (sv), qty, unit, price, total (2h)
- [ ] Add correction chips UI: "−1 window", "+2 coats" quick actions (1h)
- [ ] Build voice confirmation dialog with TTS playback (2h)
- [ ] Create loading states and progress indicators (target <60s TTR) (1h)
- [ ] Implement responsive design for tablet use on-site (2h)
- [ ] Add Swedish locale for all labels and messages (1h)
- [ ] Build project/room navigation with breadcrumbs (1h)
- [ ] Style with black+lime SE branding per PRD §21 (2h)
- [ ] Implement dynamic template instance UI chips (kontext/mallinstans) (2h)
- [ ] Add corrections + undo functionality via event log (2h)
- [ ] **Acceptance:** Dynamic template instances with UI chips and undo via event log

### Epic 9: LLM Training Data Generation (Milestone B)

Generera svenska träningsdata per mallinstans med Zod validation

- [ ] Create Swedish phrase generator per Excel row (10-20 variations per meps_id) (3h)
- [ ] Build context-aware phrase generation (Room-based m², Doors/Windows st, Trim/Profiles lpm) (2h)
- [ ] Implement inflection handling: singular/plural, decimal comma/punkt (2h)
- [ ] Create annotation schema with Zod validation (mall, intents, meps_id) (2h)
- [ ] Generate synthetic phrases: "bredspackla väggar", "måla dörr en sida", "listmålning 12 meter" (2h)
- [ ] Build whitelist filtering for LLM inference (Excel meps_id ∩ active context) (2h)
- [ ] Add guard-rail prompting: "Jag hittade inte uppgiften i katalogen" (1h)
- [ ] Create training dataset export for QA (50 utterances per mall) (1h)
- [ ] **Acceptance:** LLM training data generation (svenska) per mallinstans with Zod validation

### Epic 10: EstimatePro API Integration (Post-MVP)

**Note: This epic is marked as Post-MVP and excluded from current implementation scope.**

Anslut till backend för projekt- och offerthantering (Post-MVP only)

- [ ] Define API client interface for EstimatePro endpoints (PRD §8.1)
- [ ] Implement POST /projects: create project with client_name, project_name
- [ ] Implement POST /projects/{id}/rooms: save room geometry
- [ ] Implement POST /projects/{id}/estimate: save line items and totals
- [ ] Add API authentication and error handling
- [ ] Build retry logic for network failures
- [ ] Create mock API server for local development
- [ ] Add integration tests against mock API
- [ ] Implement "Save to EstimatePro" button flow in UI

### Epic 11: PDF Export & Reporting (Milestone C)

Generera professionell offert-PDF med svensk formatering och correct units

- [ ] Set up PDF generation library (e.g., jsPDF or Puppeteer) (2h)
- [ ] Create PDF template with SE branding (black+lime) (2h)
- [ ] Build estimate PDF layout: header, room details, line items table (2h)
- [ ] Format Swedish decimals with comma (e.g., "26,7 m²") (1h)
- [ ] Add ROT-avdrag note section (not calculated in MVP) (1h)
- [ ] Implement section totals and grand total in PDF (2h)
- [ ] Add export button in UI with download trigger (1h)
- [ ] Create sample PDF for QA validation (1h)
- [ ] **Acceptance:** PDF export with SE branding and correct Swedish unit formatting

### Epic 12: Telemetry & Audit Trail (Milestone C)

Logga transkript, val och beräkningar med GDPR compliance (no raw audio by default)

- [ ] Design audit log schema: transcript, parsed commands, meps_ids, geometry (2h)
- [ ] Implement audit logger service with timestamps (2h)
- [ ] Store calculation snapshots (inputs, intermediate, final totals) (2h)
- [ ] Track metrics: completion rate, correction rate, p95 latency (2h)
- [ ] Log percentage of Excel-unmatched intents for monitoring (1h)
- [ ] Build admin dashboard to view audit logs (2h)
- [ ] Add privacy controls: GDPR-compliant audio/transcript storage (no raw audio by default) (2h)
- [ ] Create metrics export for analysis (CSV/JSON) (1h)
- [ ] **Acceptance:** Telemetry with p95/correction rate/unmatched-intent % metrics, GDPR compliant

### Epic 13: Testing & Quality Assurance

Säkerställ ±3% precision och 100% Excel-täckning enligt PRD §17/§20

- [ ] Create 10 golden test files with hand-checked quantities (±3% accuracy) (3h)
- [ ] Build unit test suite for all lib/ modules (geometry, parser, mapper) (3h)
- [ ] Add integration tests for full happy path from PRD §12 (2h)
- [ ] Test correction flow: add/remove openings, change dimensions (2h)
- [ ] Validate Excel import rejects invalid rows (missing required fields) (1h)
- [ ] Test guard-rail: confirm app never outputs non-Excel tasks (2h)
- [ ] Manual QA checklist: import 200-row Excel, produce PDF, check totals (2h)
- [ ] Performance test: validate TTR ≤ 60 seconds on realistic scenarios (2h)
- [ ] Accessibility audit: keyboard navigation, screen reader support (1h)
- [ ] **Acceptance:** Golden rooms ±3% accuracy, unit/integration tests per PRD §17/§20

---

## Risker & Mitigations

### Risk 1: Voice Recognition Accuracy (Swedish)

**Beskrivning:** Whisper kan missuppfatta svenska mått eller facktermer  
**Sannolikhet:** Medium  
**Impact:** High – fel dimensioner = fel pris  
**Mitigation:**

- Implementera låg confidence threshold (0.7) med automatisk repeat-förfrågan
- Visa alltid parsed values visuellt för användarbekräftelse
- Tillåt manuell redigering av transcript innan beräkning
- Samla telemetri på misslyckade tolkningar för tuning

### Risk 2: Excel Schema Drift

**Beskrivning:** Användare laddar upp Excel med saknade/felaktiga kolumner  
**Sannolikhet:** High  
**Impact:** Critical – app kan ej fungera utan giltig katalog  
**Mitigation:**

- Strikt validering vid import med tydliga felmeddelanden per kolumn
- Exempel-Excel tillgänglig i appen för nedladdning
- Versionshantering av Excel-schema i config
- Fallback till senast fungerande Excel vid importfel

### Risk 3: Intent Mapping Gaps (NLP)

**Beskrivning:** Användare säger uppgift som finns i Excel men ej känns igen  
**Sannolikhet:** Medium  
**Impact:** Medium – frustrerande UX, kräver omformulering  
**Mitigation:**

- Rik synonym-databas per MEPS-rad (PRD §4)
- Fuzzy matching på task_name_sv
- Logger alla unmapped intents för kontinuerlig förbättring
- UI-guide med typiska fraser ("Försök säga 'bredspackla väggar'")

### Risk 4: Calculation Precision

**Beskrivning:** Avrundningsfel eller logikbuggar ger >±3% avvikelse  
**Sannolikhet:** Low  
**Impact:** High – förlorad trovärdighet  
**Mitigation:**

- 10 golden test files med hand-verifierade resultat (PRD §17)
- Unit tests för alla edge cases (small rooms, many openings, etc.)
- Snapshot testing för regression prevention
- Manual QA på pilot med 5 målar-företag

### Risk 5: EstimatePro API Downtime

**Beskrivning:** Backend ej tillgänglig vid save/export  
**Sannolikhet:** Medium  
**Impact:** Medium – användare kan ej slutföra workflow  
**Mitigation:**

- Lokal draft save i browser localStorage
- Retry logic med exponential backoff
- Offline-mode: generera PDF utan backend, synka senare
- Tydlig felmeddelande + support-kontakt i UI

### Risk 6: Performance (TTR > 60s)

**Beskrivning:** Voice processing + LLM inference tar för lång tid  
**Sannolikhet:** Medium  
**Impact:** High – brytar against success criteria  
**Mitigation:**

- Parallellisera Whisper ASR och geometry calculation där möjligt
- Cache Excel catalog i minnet (ingen disk I/O per request)
- Använd streaming TTS för snabbare feedback
- Progressindikatorer för att hantera perceived latency
- Benchmark och profilera kritiska paths

### Risk 7: Multi-Room State Management

**Beskrivning:** Buggar när användare växlar mellan rum eller korrigerar tidigare rum  
**Sannolikhet:** Medium  
**Impact:** Medium – fel data i fel rum  
**Mitigation:**

- Tydlig state isolation per rum i frontend state management
- Breadcrumb navigation visar alltid aktivt rum
- Confirmation step vid rumbyten ("Spara ändringar i master bedroom?")
- Audit log per rum för debugging

### Risk 8: ROT Tax Calculation Scope Creep

**Beskrivning:** Kunder vill ha ROT-avdrag uträknat trots out-of-scope  
**Sannolikhet:** High  
**Impact:** Low – kan hanteras med note i MVP  
**Mitigation:**

- Tydlig ROT note i PDF: "ROT-avdrag beräknas av er revisor"
- Dokumentera i release notes att ROT är post-MVP feature
- Samla feedback för prioritering i v2

### Risk 9: GDPR & Audio Storage

**Beskrivning:** Compliance risk vid lagring av röstinspelningar  
**Sannolikhet:** Medium  
**Impact:** Critical – legal liability  
**Mitigation:**

- Endast lagra transcript, ej raw audio (default)
- User opt-in för audio storage med tydlig consent
- Automatic deletion efter 30 dagar (configurable)
- Dokumentera data handling i privacy policy

