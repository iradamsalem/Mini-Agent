import { ChatMessage, ToolType, ChatSource } from '@/types/chat';

// Mock responses for different tool types
const mockResponses: Record<ToolType, { content: string; sources?: ChatSource[] }> = {
  RAG: {
    content: `Based on the retrieved documents, I can provide you with comprehensive information about **machine learning fundamentals**. 

Machine learning is a subset of artificial intelligence that enables systems to automatically learn and improve from experience without being explicitly programmed. The key principles include:

- **Supervised Learning**: Training on labeled data to make predictions
- **Unsupervised Learning**: Finding patterns in unlabeled data  
- **Reinforcement Learning**: Learning through interaction and feedback

The process typically involves data preprocessing, feature engineering, model selection, training, and evaluation.`,
    sources: [
      {
        id: '1',
        title: 'Introduction to Machine Learning - Stanford CS229',
        preview: 'Machine learning is the science of getting computers to act without being explicitly programmed. In the past decade, machine learning has given us self-driving cars...',
        distance: 0.85
      },
      {
        id: '2',
        title: 'Machine Learning Fundamentals Handbook',
        preview: 'This comprehensive guide covers the essential concepts and algorithms in machine learning, including supervised and unsupervised learning techniques...',
        distance: 0.78
      }
    ]
  },
  DB: {
    content: `Based on the database query results, I found **247 active users** in the system with the following breakdown:

- **Premium users**: 89 (36%)
- **Standard users**: 158 (64%)
- **Average session time**: 24.3 minutes
- **Most active region**: North America (142 users)

The data shows a 15% increase in user engagement compared to last month.`
  },
  Direct: {
    content: `Hello! I'm your AI assistant, ready to help you with any questions or tasks. I can:

✨ **Search and analyze** documents using RAG (Retrieval-Augmented Generation)
🗄️ **Query databases** for real-time data and analytics  
🎯 **Provide direct answers** using my training knowledge

Feel free to ask me anything! Whether you need research assistance, data analysis, or general information, I'm here to help make your work more efficient.`
  }
};

export const sendMessage = async (message: string): Promise<ChatMessage> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  // Randomly select a tool type for demo
  const tools: ToolType[] = ['RAG', 'DB', 'Direct'];
  const randomTool = tools[Math.floor(Math.random() * tools.length)];
  const response = mockResponses[randomTool];
  
  return {
    id: Date.now().toString(),
    type: 'assistant',
    content: response.content,
    tool: randomTool,
    sources: response.sources,
    timestamp: new Date()
  };
};