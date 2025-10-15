# Whisper‑EP × Cursor — Referensguide (LLM, RAG, Kompositflöden)

> **Syfte:** Denna guide är den *officiella referensen* för hur Cursor ska köra tal→text→intent/komposit→validering→prissättning→export för Whisper‑EP. Den kan läggas in via `@Docs → Add New Doc` eller checkas in i repo under `docs/`.

---

## 1. Arkitektur (översikt)
1. **Whisper** → text.
2. **Normalisering** (språk, decimal, synonymer).
3. **Slot‑regex** (area, lpm, strykningar, sida) med LLM‑fallback.
4. **RAG**: top‑k kandidater (atomiska intents + recipes).
5. **Composer‑LLM**: välj recipe eller komponera pipeline; annars single‑intent.
6. **Validator**: ordning/byggdelar (tvätt→spackel→målning; tapet ≠ målning; mjukfogning ≠ målning).
7. **Pricer**: MEPS→tid/material→radlista.
8. **Exporter**: PDF/CSV/EP‑API + telemetri.

---

## 2. Datakällor & filer (ingår i paketet)
- `whisper_ep_intents.jsonl` — liten, ren intents‑lista (atomiska).
- `whisper_ep_recipes.yaml` — recipes för sammansatta moment (vägg/tak/dörr/mjukfogning).
- `whisper_ep_cursor_prompt.txt` — systemprompt + `add_task` schema (single‑intent).
- `whisper_ep_composite_schema.json` — `compose_job` schema (komposit).
- `whisper_ep_parser_prompt.txt` — komposit‑prompt.
- `whisper_ep_slots_regex.md` — regex/heuristik för slots.
- `whisper_ep_eval.csv` — eval för single‑intent.
- `whisper_ep_eval_composite.csv` — eval för komposit.

Lägg dessa i repo (t.ex. `assets/whisper-ep/`) och/eller ladda in i Cursor via @Docs.

---

## 3. Structured outputs / Function calling

### 3.1 Single‑intent (atomiskt moment)
**Systemprompt (kort):**
```
Du är 'Whisper-EP Intent Mapper'. Klassificera frasen till EN (1) atomisk MEPS-intent och extrahera slots. Returnera strikt JSON enligt schema. Målning är inte spackling; mjukfogning är inte målning; tapet inte målning.
```

**Schema (`add_task`):**
```json
{
  "name": "add_task",
  "description": "Mappar fras till MEPS-intent och slots",
  "parameters": {
    "type": "object",
    "properties": {
      "intent_id": {"type": "string"},
      "intent_label": {"type": "string"},
      "area": {"type": "object", "properties": {"value": {"type": "number"}, "unit": {"type": "string", "enum": ["kvm","m2"]}}},
      "length": {"type": "object", "properties": {"value": {"type": "number"}, "unit": {"type": "string", "enum": ["lpm","meter"]}}},
      "coats": {"type": "integer"},
      "side": {"type": "string", "enum": ["en_sida","båda_sidor"]}
    },
    "required": ["intent_id","intent_label"]
  }
}
```

### 3.2 Komposit (sammansatt jobb)
**Systemprompt (komposit):**
```
Du är 'Whisper-EP Composer'. Tolka frasen och bygg ett SAMMANSATT jobb när flera moment nämns (t.ex. i- och påspackling + målning 2 lager). Använd recipes när matchar; annars komponera pipeline i ordning tvätt → skarvspackling/slip → bredspackling×N → (grundning?) → målning×M → fogning/mask. Returnera strikt JSON enligt schema.
```

**Schema (`compose_job`)**: se `whisper_ep_composite_schema.json` i repo.

---

## 4. Slot‑extraktion (regex → fallback LLM)
- **Area:** `(\d+(?:[.,]\d+)?)\s*(?:kvm|m2|m²)` → normalisera `,`→`.` och `m²`→`kvm`.
- **Längd:** `(\d+(?:[.,]\d+)?)\s*(?:lpm|löp(?:meter)?|meter)` → enhet `lpm`.
- **Strykningar:** `(\d+)\s*(?:stryk|strykningar|lager)` + talord `en/ett=1`, `två=2`, `tre=3`.
- **Sida (dörr):** `en sida|ena sidan|båda sidor|två sidor` → `en_sida`/`båda_sidor`.

Implementera regex först; endast vid miss → fråga LLM som fyller fälten i samma schema.

---

## 5. RAG (Retriever)
- Indexera **atomiska intents** + **recipes labels** med embeddings.
- Skicka top‑k kandidater in i LLM‑samtalet (minimerad text).
- Låt LLM *välja* intent eller recipe; komposit kan fyllas ut med atomiska steg.

**Indexfält (förslag):** `{ id, type=intent|recipe, label, description, locale, embedding }`

---

## 6. Ordnings‑ & byggdelsregler (validator)
1. Tvätt före spackel; skarvspackling/slip före bredspackling; bredspackling före målning.
2. Mjukfogning ersätter inte målning.
3. Tapet (Non‑Woven) är separat byggdel (ej målning/spackel).
4. Dörr: `en_sida`/`båda_sidor` måste harmonisera med frasen eller defaultpolicy.
5. Enhetsdisciplin: yta (kvm) respektive längd (lpm) får **inte** blandas på samma steg.

**Auto‑fixar:** saknas tvätt → föreslå CLEAN; saknas kvantitet → ärv total area till ytsteg.

---

## 7. Evaluering
- **Single‑intent:** intent‑accuracy, slot‑precision/recall.
- **Komposit:** korrekt *stegordning*, kompletthet (saknade steg), slot‑exakthet.
- Kör eval‑CSV i CI på varje PR.

---

## 8. Determinism & drift
- `temperature: 0.0–0.2`, sätt `seed` där det stöds.
- Använd *structured outputs* så svaren alltid är giltig JSON.
- Logga structured outputs + prisrader för regression/telemetri.

---

## 9. Snabbstart (Node/TS, skiss)
```ts
import OpenAI from "openai";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 1) Regex → slots, 2) RAG → candidates
const system = "...(komposit-systemprompt enl. ovan)...";
const tool = { type: "function", function: /* compose_job schema från fil */ };

const messages = [
  { role: "system", content: system },
  { role: "user", content: "måla vägg, i- och påspackling samt 2 strykningar 45 kvm" },
  { role: "assistant", content: "Kandidater: [...]" }
];

const r = await client.chat.completions.create({
  model: "gpt-5.1",
  temperature: 0.1,
  messages,
  tools: [tool],
  tool_choice: { type: "function", function: "compose_job" }
});

const argsJson = r.choices[0].message.tool_calls?.[0]?.function?.arguments;
// 3) Validera ordning, sprid kvantitet, prissätt, exportera
```

---

## 10. Bilagor
- Se `whisper_ep_*` filer i repo för färdiga prompts, schema, recipes och eval.