import { GoogleGenerativeAI } from '@google/generative-ai';
// Version: FINAL_FIX_V2 (Delete old file on GitHub before uploading this!)

// Initialize Gemini AI lazily
const getGenAI = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('Gemini API Key is missing');
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

export const breakDownTask = async (taskDescription) => {
  try {
    const genAI = getGenAI();
    if (!genAI) return []; // Return empty if no key or initialization failed

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Break down the following task into smaller, actionable subtasks. Return only a JSON array of subtasks, each with a "title" and "description" field. Task: ${taskDescription}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to extract JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback: create a simple breakdown
    return [
      { title: 'Research', description: 'Research and gather information' },
      { title: 'Plan', description: 'Create a detailed plan' },
      { title: 'Execute', description: 'Execute the main task' },
      { title: 'Review', description: 'Review and refine' }
    ];
  } catch (error) {
    console.error('Error breaking down task:', error);
    return [];
  }
};

export const getProductivityInsights = async (tasks) => {
  try {
    const genAI = getGenAI();
    if (!genAI) return 'AI insights are currently unavailable (Missing API Key).';

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const taskSummary = tasks.map(t => ({
      title: t.title,
      status: t.status,
      dueDate: t.dueDate,
      priority: t.priority
    }));

    const prompt = `Analyze the following tasks and provide productivity insights. Be concise and actionable. Tasks: ${JSON.stringify(taskSummary)}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error getting insights:', error);
    return 'Unable to generate insights at this time.';
  }
};
