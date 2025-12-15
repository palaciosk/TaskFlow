import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const breakDownTask = async (taskDescription) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
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
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

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

