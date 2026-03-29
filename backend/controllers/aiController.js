const { OpenAI } = require('openai');
const db = require('../models');

// Initialize OpenAI client pointing to DeepSeek base URL using the requested R1 key
const openai = new OpenAI({
    apiKey: 'sk-80e23a714c714ea286ef6c21fc6f9bc9',
    baseURL: 'https://api.deepseek.com/v1'
});

exports.askAI = async (req, res) => {
    try {
        const { message, context } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        const user = await db.User.findByPk(req.userId);
        const preferredLanguage = user && user.ai_language ? user.ai_language : 'slovenščina';
        
        console.log(`[AI] Processing request for User ID: ${req.userId} | Active Language Constraint: ${preferredLanguage}`);

        const systemPrompt = `[CRITICAL INSTRUCTION] You are the MojČebelar AI assistant. You are speaking to a beekeeper.
You MUST analyze your final response and mechanically translate it EXCLUSIVELY to: ${preferredLanguage.toUpperCase()}.
If the language says ENGLISH, you MUST respond entirely in English. DO NOT USE SLOVENIAN.
Focus your advice strictly on hive management, varroa treatment, and honey extraction.
Current Application Page Context: ${JSON.stringify(context || {})}`;

        const response = await openai.chat.completions.create({
            model: "deepseek-reasoner", // The physical DeepSeek R1 model designator
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ]
        });

        res.status(200).json({ 
            reply: response.choices[0].message.content 
        });

    } catch (e) {
        console.error("AI Assistant Error:", e);
        // Fallback or explicit failure
        res.status(500).json({ 
            error: "Prišlo je do napake pri komunikaciji z AI asistentom.",
            details: e.message 
        });
    }
};
