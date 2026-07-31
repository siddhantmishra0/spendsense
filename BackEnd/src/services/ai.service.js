import { Groq } from 'groq-sdk';

// Initialize Groq client
// IMPORTANT: You must add GROQ_API_KEY to your .env file
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

export const generateInsights = async (expenseData) => {
    try {
        if (!process.env.GROQ_API_KEY) {
            throw new Error("GROQ_API_KEY is not configured");
        }

        const prompt = `
You are an expert AI financial advisor. 
Analyze the following expense data and provide 3 actionable recommendations to save money.
Expense Data:
${JSON.stringify(expenseData)}

Output JSON format strictly:
{
  "recommendations": [
    {
      "title": "Short title",
      "impact": "High Impact|Medium Impact|Low Impact",
      "subtitle": "Detailed explanation",
      "potential": "Estimated savings amount in numbers"
    }
  ],
  "totalSavingsPotential": Total estimated savings number
}
`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "openai/gpt-oss-120b",
            response_format: { type: "json_object" },
            temperature: 1,
        });

        const responseContent = chatCompletion.choices[0]?.message?.content;
        if (!responseContent) throw new Error("No response from Groq");
        
        return JSON.parse(responseContent);
    } catch (error) {
        console.error("Error generating insights from Groq:", error);
        throw error;
    }
};

export const chatWithAssistant = async (messages, userContext) => {
    try {
        if (!process.env.GROQ_API_KEY) {
            throw new Error("GROQ_API_KEY is not configured");
        }

        const systemPrompt = {
            role: "system",
            content: `
#ROLE:
You are SpendSense AI, a specialized financial assistant for the SpendSense app.

#TASK:
You must provide helpful financial advice, answer questions about the user's finances, budgets, and savings based on their provided context.

#CONTEXT:
User's financial context: ${JSON.stringify(userContext)}

#CONSTRAINT:
You must strictly answer ONLY questions related to personal finance, budgeting, and the user's data, OR simple conversational greetings (e.g., "hi", "hello", "how are you"). You must NEVER answer questions outside this scope, such as writing code (e.g., Python, JavaScript) or answering general knowledge questions.

#OUTPUT FORMAT:
Your answer should be concise, helpful, and formatted in Markdown.

#Example:
If a user asks "How much did I spend on food?", you analyze their context and provide the total spent on food.
If a user says "Hello!", you reply politely as SpendSense AI, offering your financial assistance.

#FALLBACK:
If the issue or question is completely unrelated to personal finance, budgeting, the SpendSense app, or simple greetings (like asking for code or general trivia), then the answer MUST exactly be: "I'm sorry, but I am SpendSense AI, a specialized financial assistant. I can only answer questions related to your personal finances and budgeting."
`
        };

        const chatCompletion = await groq.chat.completions.create({
            messages: [systemPrompt, ...messages],
            model: "openai/gpt-oss-120b", 
            temperature: 0.5,
        });

        return chatCompletion.choices[0]?.message?.content;
    } catch (error) {
        console.error("Error chatting with Groq:", error);
        throw error;
    }
};

export const categorizeExpense = async (description) => {
    try {
        if (!process.env.GROQ_API_KEY) {
            return "Other"; // Fallback if no key
        }

        const prompt = `
Categorize the following expense description into one of these categories:
"Food", "Transport", "Bills", "Shopping", "Entertainment", "Health", "Education", "Other".
Return ONLY the category name as plain text without quotes.

Description: "${description}"
`;
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "openai/gpt-oss-120b",
            temperature: 0.1,
        });
        
        const category = chatCompletion.choices[0]?.message?.content?.trim();
        const validCategories = ["Food", "Transport", "Bills", "Shopping", "Entertainment", "Health", "Education", "Other"];
        if (validCategories.includes(category)) {
            return category;
        }
        return "Other";
    } catch (error) {
        console.error("Error categorizing expense with Groq:", error);
        return "Other";
    }
};

export const parseReceiptText = async (text) => {
    try {
        if (!process.env.GROQ_API_KEY) {
            throw new Error("GROQ_API_KEY is not configured");
        }

        const prompt = `
You are an AI assistant designed to parse receipt data.
Extract the merchant name, total amount, and date from the following raw OCR text. 
Return the result strictly as a JSON object with keys: "merchantName" (string), "amount" (number), "date" (string, format YYYY-MM-DD). If a field cannot be found, set it to null. Do not include any markdown, just pure JSON.

Raw OCR Text:
"${text}"
`;
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "openai/gpt-oss-120b",
            response_format: { type: "json_object" },
            temperature: 0.1,
        });

        const responseContent = chatCompletion.choices[0]?.message?.content;
        if (!responseContent) throw new Error("No response from Groq");
        
        return JSON.parse(responseContent);
    } catch (error) {
        console.error("Error parsing receipt text with Groq:", error);
        throw error;
    }
};
