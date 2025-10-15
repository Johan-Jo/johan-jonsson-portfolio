# Epic 11: PDF Export & Reporting - Implementation Plan

## Overview
Generate professional estimate PDF with Swedish formatting and correct units.

**Status**: 🚧 In Progress  
**Milestone**: C - PDF & Telemetry  
**Estimated Time**: 12 hours

---

## Requirements from PRD

### Core Features (PRD §9)
- ✅ Professional PDF export with SE branding
- ✅ Swedish decimal formatting (comma separator)
- ✅ Correct unit display (m², lpm, st)
- ✅ ROT-avdrag note section
- ✅ Section totals (Prep, Paint, Finish)
- ✅ Grand total with markup and tax

### Acceptance Criteria
- PDF export with SE branding (black + lime)
- Swedish unit formatting (26,7 m² not 26.7 m²)
- All line items with MEPS codes and descriptions
- Section-based organization
- ROT note placeholder
- Download button in UI

---

## Technical Approach

### Library Selection
**Option 1: jsPDF + autoTable** ⭐ RECOMMENDED
- Pros: Lightweight, client-side, no server needed
- Cons: Limited styling control
- Best for: MVP fast implementation

**Option 2: Puppeteer**
- Pros: Perfect HTML/CSS rendering
- Cons: Requires server, heavier
- Best for: Complex layouts, future iterations

**Decision: Use jsPDF for MVP**

### Implementation Steps

#### Step 1: Setup & Dependencies (30 min)
```bash
npm install jspdf jspdf-autotable
npm install -D @types/jspdf
```

#### Step 2: Create PDF Generator Module (2h)
**File**: `src/lib/pdf/generator.ts`

Features:
- PDF template with SE branding
- Header with logo/company info
- Room details section
- Line items table with sections
- Totals breakdown
- ROT note footer

#### Step 3: Swedish Formatting Utilities (1h)
**File**: `src/lib/pdf/formatters.ts`

Functions:
- `formatSwedishDecimal(num: number): string` → "26,7"
- `formatSwedishCurrency(amount: number): string` → "25 877,07 SEK"
- `formatUnit(value: number, unit: string): string` → "26,7 m²"
- `formatDate(date: Date): string` → "2025-10-15"

#### Step 4: PDF Template Design (2h)
**Layout Structure:**

```
┌─────────────────────────────────────┐
│  LOGO    EP-WHISPER                 │
│          Målningsoffert              │
├─────────────────────────────────────┤
│  Rum: Sovrum                        │
│  Datum: 2025-10-15                  │
│  Dimensioner: 4,5×3,2×2,4m          │
├─────────────────────────────────────┤
│  FÖRBEREDELSE                       │
│  ┌──────┬─────────┬─────┬─────────┐│
│  │Kod   │Uppgift  │Antal│Pris (kr)││
│  ├──────┼─────────┼─────┼─────────┤│
│  │14939 │Täck golv│20 m²│  1 234  ││
│  └──────┴─────────┴─────┴─────────┘│
│  Delsumma: 1 234 kr                 │
├─────────────────────────────────────┤
│  MÅLNING                            │
│  [Line items table]                 │
│  Delsumma: 23 456 kr                │
├─────────────────────────────────────┤
│  TOTALT                             │
│  Arbete:         18 500 kr          │
│  Material:        5 600 kr          │
│  Delsumma:       24 100 kr          │
│  Pålägg (15%):    3 615 kr          │
│  ───────────────────────             │
│  TOTALT:         27 715 kr          │
├─────────────────────────────────────┤
│  ROT-AVDRAG                         │
│  Med ROT-avdrag kan du få tillbaka  │
│  30% av arbetskostnaden (max).      │
│  Kontakta Skatteverket för detaljer.│
└─────────────────────────────────────┘
```

#### Step 5: UI Integration (1h)
**Component**: `src/components/estimate/PDFExportButton.tsx`

Features:
- Export button with icon
- Loading state during generation
- Automatic download trigger
- Success/error feedback

#### Step 6: Styling & Branding (2h)

**Color Scheme (SE Branding):**
- Primary: Black (#000000)
- Accent: Lime (#BFFF00)
- Text: Dark Gray (#333333)
- Background: White (#FFFFFF)

**Typography:**
- Headers: Bold, 16pt
- Body: Regular, 10pt
- Tables: 9pt
- Units: Italic, 9pt

#### Step 7: Testing & Validation (2h)

**Test Cases:**
1. Simple room (3 tasks) → verify formatting
2. Complex room (15+ tasks) → verify pagination
3. Swedish decimals → verify comma separator
4. Large numbers → verify thousand separator
5. ROT note → verify presence and text

#### Step 8: Sample PDF Generation (1h)

Create golden file:
- `examples/sample-estimate.pdf`
- Based on bedroom example from PRD
- Used for QA validation

---

## File Structure

```
EP-Whisper/app/src/
├── lib/
│   └── pdf/
│       ├── generator.ts          # Main PDF generation
│       ├── formatters.ts         # Swedish formatting
│       ├── template.ts           # PDF layout/styling
│       └── types.ts              # PDF-specific types
├── components/
│   └── estimate/
│       ├── PDFExportButton.tsx   # Export UI button
│       └── PDFPreview.tsx        # Optional preview
└── tests/
    └── pdf/
        ├── generator.test.ts     # PDF generation tests
        └── formatters.test.ts    # Formatting tests
```

---

## Implementation Checklist

### Phase 1: Setup (30 min)
- [ ] Install jsPDF and jspdf-autotable
- [ ] Create lib/pdf directory structure
- [ ] Set up TypeScript types

### Phase 2: Core PDF Generator (2h)
- [ ] Create PDFGenerator class
- [ ] Implement header section
- [ ] Implement room details section
- [ ] Implement line items table
- [ ] Implement totals section
- [ ] Implement ROT note footer

### Phase 3: Swedish Formatting (1h)
- [ ] formatSwedishDecimal function
- [ ] formatSwedishCurrency function
- [ ] formatUnit function
- [ ] formatDate function
- [ ] Add thousand separator (space)

### Phase 4: Template & Styling (2h)
- [ ] Apply SE branding colors
- [ ] Style header with logo
- [ ] Format table with borders
- [ ] Add section separators
- [ ] Configure fonts and sizes

### Phase 5: UI Integration (1h)
- [ ] Create PDFExportButton component
- [ ] Add to EstimatePanel
- [ ] Implement download trigger
- [ ] Add loading/success states

### Phase 6: Testing (2h)
- [ ] Unit tests for formatters
- [ ] Integration test for PDF generation
- [ ] Test Swedish decimal formatting
- [ ] Test multi-page documents
- [ ] Manual QA with sample estimate

### Phase 7: Documentation (30 min)
- [ ] Create sample PDF
- [ ] Update README with PDF features
- [ ] Add usage examples

---

## Code Examples

### PDF Generator Usage
```typescript
import { generateEstimatePDF } from '@/lib/pdf/generator';

// In component
const handleExportPDF = () => {
  const pdf = generateEstimatePDF({
    roomName: 'Sovrum',
    date: new Date(),
    geometry: roomCalculation,
    estimate: voiceEstimate,
    lineItems: mappedTasks,
  });
  
  pdf.save('offert-sovrum.pdf');
};
```

### Swedish Formatting
```typescript
formatSwedishDecimal(26.7);        // "26,7"
formatSwedishCurrency(25877.07);   // "25 877,07 SEK"
formatUnit(26.7, 'm2');            // "26,7 m²"
formatDate(new Date());            // "2025-10-15"
```

---

## Expected Output

**File**: `offert-sovrum.pdf`

**Content:**
- Professional header with branding
- Room: Sovrum, 4,5×3,2×2,4m
- Date: 2025-10-15
- 15 line items organized by section
- Swedish formatting: "26,7 m²", "25 877,07 SEK"
- Section totals for Prep, Paint, Finish
- Grand total with breakdown
- ROT note with explanation

**Size**: ~50 KB
**Pages**: 1-2 (depending on line items)

---

## Success Metrics

- ✅ PDF generates without errors
- ✅ Swedish decimals use comma (,)
- ✅ Currency has space thousand separator
- ✅ Units display correctly (m², lpm, st)
- ✅ All sections present and formatted
- ✅ ROT note visible
- ✅ Download works in browser
- ✅ File size < 100 KB

---

## Next Steps After Epic 11

**Epic 12: Telemetry & Audit Trail**
- Audit logging
- Metrics tracking
- GDPR compliance
- Admin dashboard

**Epic 13: Testing & QA**
- Golden test files
- ±3% accuracy validation
- Performance testing
- Manual QA

---

**Ready to implement!** 🚀

