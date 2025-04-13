const { LlamaModel, LlamaContext, LlamaChatSession } = require('node-llama-cpp');
const path = require('path');

let model = null;
let context = null;
let chatSession = null;

async function initializeLlama() {
    if (!model) {
        console.log('Initializing Llama model...');
        model = new LlamaModel({
            modelPath: process.env.LLAMA_MODEL_PATH || path.join(__dirname, 'models', 'llama-2-7b-chat.gguf'),
            contextSize: 2048,
            batchSize: 512
        });
        context = new LlamaContext({ model });
        chatSession = new LlamaChatSession({ context });
        console.log('Llama model initialized');
    }
    return chatSession;
}

async function analyzePronunciation(spokenText, targetWord) {
    try {
        const session = await initializeLlama();
        
        const prompt = `As a pronunciation expert, compare the spoken word "${spokenText}" with the target word "${targetWord}".
        
        Focus on:
        1. Exact match (yes/no)
        2. Specific pronunciation differences
        3. Encouragement and tips for improvement
        
        Format your response as JSON:
        {
            "isCorrect": true/false,
            "feedback": "detailed feedback",
            "confidenceScore": 0-100
        }
        
        Be encouraging but accurate in your assessment.`;
        
        const response = await session.prompt(prompt);
        
        try {
            // Parse the JSON response
            const result = JSON.parse(response);
            return result;
        } catch (error) {
            // If JSON parsing fails, return a formatted response
            return {
                isCorrect: spokenText.toLowerCase() === targetWord.toLowerCase(),
                feedback: response,
                confidenceScore: spokenText.toLowerCase() === targetWord.toLowerCase() ? 100 : 0
            };
        }
    } catch (error) {
        console.error('Error analyzing pronunciation:', error);
        throw error;
    }
}

module.exports = {
    analyzePronunciation
}; 