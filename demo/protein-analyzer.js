import 'dotenv/config';

// ==================== CONFIGURATION ====================
// Edit this section with your daily food intake
const DAILY_FOODS = `
- 2 eggs
- 1 cup of oatmeal with milk
- Grilled chicken breast (200g)
- Brown rice (1 cup)
- Broccoli (1 cup)
- Greek yogurt (150g)
- Protein shake (1 scoop)
- Salmon fillet (150g)
- Mixed nuts (30g)
`;

// System prompt that defines the AI's role
const SYSTEM_PROMPT = `You are a professional nutrition analyst specializing in protein intake assessment. 
Analyze the provided food list and:
1. Estimate protein content for each item in grams
2. Calculate total daily protein intake
3. Identify protein quality (complete vs incomplete proteins)
4. Assess if the intake is adequate (consider ~0.8-1g per kg body weight as baseline)
5. Provide specific recommendations for improvement if needed
6. Format your response clearly with sections and bullet points`;

// ==================== MAIN FUNCTION ====================
async function analyzeProteinIntake() {
  console.log('🥗 Daily Protein Intake Analyzer');
  console.log('================================\n');
  console.log('Analyzing your food intake...\n');

  // Validate API key
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('❌ Error: OPENAI_API_KEY not found in environment variables.');
    console.error('Please create a .env file with your OpenAI API key.');
    process.exit(1);
  }

  // Prepare the API request using the Responses API
  const requestBody = {
    model: 'gpt-4o-mini',
    instructions: SYSTEM_PROMPT,
    input: `Please analyze my daily food intake and provide a protein consumption report:\n${DAILY_FOODS}`
  };

  try {
    // Make API request to the Responses endpoint
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    // Check if response is ok
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
    }

    // Parse and display results
    const data = await response.json();
    
    // Extract text from the output array
    let analysis = '';
    if (data.output && Array.isArray(data.output)) {
      for (const item of data.output) {
        if (item.content && Array.isArray(item.content)) {
          for (const content of item.content) {
            if (content.type === 'output_text' && content.text) {
              analysis += content.text;
            }
          }
        }
      }
    }

    if (!analysis) {
      throw new Error('No analysis received from API');
    }

    console.log('📊 PROTEIN ANALYSIS REPORT');
    console.log('================================\n');
    console.log(analysis);
    console.log('\n================================');
    console.log(`✅ Analysis completed at ${new Date().toLocaleString()}`);
    console.log(`💰 Tokens used: ${data.usage?.total_tokens || 'N/A'}`);

  } catch (error) {
    console.error('\n❌ Error occurred:');
    
    if (error.message.includes('fetch failed')) {
      console.error('Network error: Unable to reach OpenAI API. Check your internet connection.');
    } else if (error.message.includes('401')) {
      console.error('Authentication error: Invalid API key. Check your OPENAI_API_KEY in .env file.');
    } else if (error.message.includes('429')) {
      console.error('Rate limit error: Too many requests. Please wait and try again.');
    } else {
      console.error(error.message);
    }
    
    process.exit(1);
  }
}

// ==================== RUN ====================
analyzeProteinIntake();
