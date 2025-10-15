# EP-Whisper Tasks (Generated from PRD)

**Generated:** 2025-10-14  
**Total Tasks:** 10  
**Status:** All pending  

---

## Task 1: Excel MEPS Data Import and Validation System
**Priority:** High  
**Dependencies:** None  
**Status:** Pending

**Description:**  
Build a robust system to import and validate MEPS painting tasks from Excel files with strict schema validation

**Details:**  
Implement Excel parser using libraries like 'xlsx' or 'exceljs' to read XLSX/CSV files. Create validation schema using Zod or similar to enforce required columns: meps_id, task_name_sv, task_name_en, unit (enum: m2/lpm/st), labor_norm_per_unit, material_factor_per_unit. Handle locale-specific decimal parsing (comma vs dot). Reject rows missing required fields. Store validated data in memory/database for fast lookup. Include error reporting for malformed rows.

**Test Strategy:**  
Unit tests with sample Excel files containing valid/invalid data. Test decimal parsing with both comma and dot formats. Verify rejection of incomplete rows. Integration test with 200+ row Excel file as specified in PRD.

---

## Task 2: Room Geometry Calculator with Area Computation
**Priority:** High  
**Dependencies:** None  
**Status:** Pending

**Description:**  
Implement precise geometric calculations for room dimensions, openings, and net paintable areas

**Details:**  
Create RoomGeometry class with properties W, L, H, doors[], windows[], wardrobes[]. Implement area calculations: walls_gross = 2*(W+L)*H, ceiling_gross = W*L. Handle opening deductions: standard door 0.9×2.1m, custom window sizes. Implement wardrobe deduction logic for covered walls. Calculate net areas: walls_net = walls_gross - openings - wardrobes_deduction. Round areas to 0.1 m², lengths to 0.1 lpm. Include validation for negative areas.

**Test Strategy:**  
Unit tests with the PRD example (W=2, L=5, H=2.5) expecting walls_net=26.7m², ceiling_net=10.0m². Test edge cases like full wall coverage, multiple openings, zero dimensions. Golden file tests with 10 hand-calculated room scenarios.

---

## Task 3: Swedish Voice Recognition with Whisper Integration
**Priority:** High  
**Dependencies:** None  
**Status:** Pending

**Description:**  
Integrate OpenAI Whisper for Swedish speech recognition with voice activity detection

**Details:**  
Implement Whisper ASR with language locked to sv-SE. Add voice activity detection (VAD) for hands-free operation. Create audio recording interface with push-to-talk and auto-VAD modes. Handle audio streaming and chunking for real-time processing. Implement confidence scoring and request repeats for low-confidence transcriptions. Store transcripts for audit trail. Add error handling for network issues and API limits.

**Test Strategy:**  
Test with Swedish audio samples covering room dimensions, task descriptions, and corrections. Verify language detection rejects non-Swedish input. Test VAD sensitivity and push-to-talk reliability. Integration test with sample phrases from PRD appendix.

---

## Task 4: Swedish NLP Intent Parser and MEPS Task Mapper
**Priority:** High  
**Dependencies:** 1, 3  
**Status:** Pending

**Description:**  
Build NLP system to parse Swedish voice commands and map them to MEPS tasks from Excel data

**Details:**  
Create intent classification system for Swedish commands: project creation, room setup, dimensions, openings, tasks. Implement synonym matching using Excel 'synonyms' column. Build task mapper that strictly maps spoken intents to meps_id entries only. Handle Swedish-specific phrases: 'spackla väggar' → MÅL-VÄGG-SPACK-BRED-M2, 'bredspackla taket' → MÅL-TAK-SPACK-BRED-M2, 'täckmåla två gånger' → paint tasks with layers=2. Include guard-rails to never invent tasks not in Excel. Add clarification requests for unmappable intents.

**Test Strategy:**  
Test with Swedish phrases from PRD appendix. Verify 100% mapping to Excel meps_id entries. Test synonym recognition and multi-layer task handling. Negative tests ensuring no hallucinated tasks. Integration test with full voice flow.

---

## Task 5: Dynamic Template Context System
**Priority:** Medium  
**Dependencies:** 1, 4  
**Status:** Pending

**Description:**  
Implement dynamic template system for contextual task suggestions based on surface types and components

**Details:**  
Create template context manager supporting multiple simultaneous contexts: Room-based (m²), Doors/Windows (st), Trim/Profiles (lpm). Implement context switching based on user commands and surface types from Excel. Build whitelist filtering to show only relevant meps_id entries per active context. Create UI chips showing active template instances. Allow adding/removing contexts via voice or clicks. Implement context-aware LLM prompting to constrain suggestions to active templates.

**Test Strategy:**  
Test context switching between room painting and door/window tasks. Verify whitelist filtering shows only relevant MEPS entries. Test multiple simultaneous contexts. UI test for template chips and context management.

---

## Task 6: Cost Calculation Engine with MEPS Pricing
**Priority:** Medium  
**Dependencies:** 1, 2  
**Status:** Pending

**Description:**  
Build pricing calculator using MEPS labor norms, material factors, and markup rules

**Details:**  
Implement cost calculation using Excel data: labor_norm_per_unit, material_factor_per_unit, price_labor_per_hour (default 500 SEK), price_material_per_unit. Calculate line items: qty × (labor_hours × hourly_rate + material_cost) × (1 + markup_pct). Handle layer multiplication for paint tasks. Apply row-level or global markup (default 10%). Generate line items with meps_id, task_name_sv, unit, qty, unit_price, subtotal. Calculate section totals and grand total. Include ROT notation for Swedish market.

**Test Strategy:**  
Unit tests with sample MEPS rows and quantities. Verify labor and material cost calculations. Test markup application at row and global levels. Integration test with full room calculation matching expected totals. Test edge cases like missing prices.

---

## Task 7: Swedish Text-to-Speech Confirmation System
**Priority:** Medium  
**Dependencies:** 2, 6  
**Status:** Pending

**Description:**  
Implement Swedish TTS for voice confirmations and user feedback

**Details:**  
Integrate OpenAI TTS with sv-SE voice for confirmations. Create confirmation templates in Swedish: 'Väggar netto 31.3 m², tak 10.0 m². Fortsätta?'. Implement voice feedback for parsed dimensions, detected tasks, and calculated quantities. Add error messages and clarification requests in Swedish. Handle TTS queuing and interruption. Store audio confirmations for audit trail. Include fallback to text display if TTS fails.

**Test Strategy:**  
Test Swedish pronunciation and clarity with native speakers. Verify confirmation templates with room calculation examples. Test TTS reliability and fallback mechanisms. Integration test with full voice interaction flow.

---

## Task 8: Voice Command Correction and Iteration System
**Priority:** Medium  
**Dependencies:** 4, 6  
**Status:** Pending

**Description:**  
Build system for voice-based corrections and estimate modifications

**Details:**  
Implement correction command parser for Swedish: 'ta bort fönstret', 'lägg till en dörr', 'höjden är 2 komma 6'. Create modification engine to update room geometry, add/remove openings, adjust quantities. Implement undo/redo functionality for corrections. Update calculations in real-time after corrections. Add correction chips in UI for common modifications. Store correction history for audit. Handle complex corrections like 'subtract one window' or 'add 2 coats'.

**Test Strategy:**  
Test correction commands from PRD examples. Verify real-time calculation updates. Test undo/redo functionality. Integration test with full correction workflow. Test edge cases like removing non-existent items.

---

## Task 9: EstimatePro API Integration
**Priority:** Medium  
**Dependencies:** 6  
**Status:** Pending

**Description:**  
Integrate with EstimatePro API for project creation and estimate export

**Details:**  
Implement EstimatePro API client with endpoints: POST /projects for project creation, POST /projects/{id}/rooms for room data, POST /projects/{id}/estimate for estimate submission. Handle authentication and error responses. Create project with client_name, project_name, market (SE/BR). Submit room geometry and calculated line items. Include retry logic and offline mode. Add project status tracking and sync indicators.

**Test Strategy:**  
Mock API tests for all endpoints. Test project creation and estimate submission flow. Verify error handling and retry logic. Integration test with full project workflow. Test offline mode and sync recovery.

---

## Task 10: PDF Export and UI Dashboard
**Priority:** Medium  
**Dependencies:** 5, 7, 8, 9  
**Status:** Pending

**Description:**  
Create comprehensive UI with estimate table, PDF export, and project management

**Details:**  
Build Next.js frontend with room card showing W×L×H, openings, net areas. Create estimate table displaying MEPS code, task_name_sv, qty, unit, unit_price, line total. Implement PDF export with Swedish branding (black+lime), ROT notation, section totals. Add push-to-talk button, live transcript view, correction chips. Include project list, room navigation, and estimate history. Add telemetry dashboard showing completion rates, correction rates, latency metrics.

**Test Strategy:**  
UI tests for all components and interactions. PDF generation tests with sample estimates. Test responsive design and accessibility. Integration test with full user workflow. Performance testing for large estimates.

---

## Dependency Graph

```
High Priority (Must complete first):
- Task 1: Excel Import (no deps) → feeds into 4, 5, 6
- Task 2: Geometry Calculator (no deps) → feeds into 6, 7
- Task 3: Voice Recognition (no deps) → feeds into 4

Medium Priority (Build on high priority):
- Task 4: NLP Parser (deps: 1, 3) → feeds into 5, 8
- Task 5: Template System (deps: 1, 4) → feeds into 10
- Task 6: Cost Calculator (deps: 1, 2) → feeds into 7, 8, 9
- Task 7: TTS System (deps: 2, 6) → feeds into 10
- Task 8: Corrections (deps: 4, 6) → feeds into 10
- Task 9: API Integration (deps: 6) → feeds into 10

Final Integration:
- Task 10: UI Dashboard (deps: 5, 7, 8, 9)
```

## Recommended Implementation Order

1. **Phase 1 - Foundation (Tasks 1, 2, 3):**
   - Start with Excel import validation
   - Implement geometry calculations
   - Set up Whisper voice integration
   - Can be done in parallel by different developers

2. **Phase 2 - Intelligence Layer (Tasks 4, 6):**
   - Build NLP intent parser
   - Implement cost calculation engine
   - These unlock most other features

3. **Phase 3 - User Experience (Tasks 5, 7, 8):**
   - Add template context system
   - Implement TTS confirmations
   - Build correction system

4. **Phase 4 - Integration (Tasks 9, 10):**
   - Connect EstimatePro API
   - Build complete UI dashboard
   - Final integration and polish