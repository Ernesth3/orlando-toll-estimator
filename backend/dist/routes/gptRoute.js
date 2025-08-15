"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const openai_1 = __importDefault(require("openai"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
const router = express_1.default.Router();
// Initialize OpenAI client
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
// POST /api/gpt
router.post('/gpt', async (req, res) => {
    try {
        const { prompt } = req.body;
        // Validate request body
        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({ error: 'Prompt is required and must be a string' });
        }
        // Check if API key is configured
        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({ error: 'OpenAI API key not configured' });
        }
        // Call OpenAI ChatCompletion
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: 'You are an e-Toll estimator GPT. Follow the e-Toll Cost Comparison template. If Unlimited is cheaper, include the saving line; if Standard is cheaper, say so.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 1000
        });
        // Extract the response text
        const answer = completion.choices[0]?.message?.content || 'No response generated';
        // Return JSON response
        res.json({ answer });
    }
    catch (error) {
        console.error('Error in GPT route:', error);
        // Handle specific OpenAI errors
        if (error instanceof openai_1.default.APIError) {
            return res.status(500).json({
                error: `OpenAI API Error: ${error.message}`
            });
        }
        // Handle other errors
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});
exports.default = router;
//# sourceMappingURL=gptRoute.js.map