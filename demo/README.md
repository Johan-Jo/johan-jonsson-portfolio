# Daily Protein Intake Analyzer

A simple command-line tool that uses OpenAI's GPT-4o-mini model with the Responses API to analyze your daily food intake and provide protein consumption insights.

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Add your OpenAI API key**:
   - Create a `.env` file in the project root
   - Add your OpenAI API key: `OPENAI_API_KEY=your_api_key_here`

3. **Edit your food list**:
   - Open `protein-analyzer.js`
   - Edit the `DAILY_FOODS` constant (lines 5-15) with what you ate today

## Usage

Run the script:
```bash
node protein-analyzer.js
```

or

```bash
npm start
```

## Example Output

```
🥗 Daily Protein Intake Analyzer
================================

Analyzing your food intake...

📊 PROTEIN ANALYSIS REPORT
================================

[AI-generated protein breakdown and recommendations]

================================
✅ Analysis completed at 10/11/2025, 2:30:00 PM
💰 Tokens used: 450
```

## Requirements

- Node.js 18+ (for native fetch support)
- OpenAI API key

## Cost

GPT-4o-mini is very affordable, typically costing less than $0.001 per analysis.

## Customization

You can customize the analysis by editing the `SYSTEM_PROMPT` in `protein-analyzer.js` to focus on different nutritional aspects.

