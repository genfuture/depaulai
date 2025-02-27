/**
 * Utility functions for handling greetings and common responses
 */

// List of common greetings that should be handled locally
export const greetings = [
  'hi',
  'hello',
  'hey',
  'greetings',
  'good morning',
  'good afternoon',
  'good evening',
  'howdy',
  'what\'s up',
  'sup',
  'yo',
  'hiya'
];

// List of common questions about DePaul that should be handled locally
export const commonQuestions = [
  'how can you help',
  'what can you do',
  'help me',
  'what is this',
  'who are you'
];

/**
 * Check if a message is a simple greeting
 * @param message The user's message
 * @returns True if the message is a greeting
 */
export const isGreeting = (message: string): boolean => {
  const lowerMessage = message.toLowerCase().trim();
  return greetings.some(greeting => 
    lowerMessage === greeting || 
    lowerMessage.startsWith(`${greeting} `) ||
    lowerMessage.endsWith(` ${greeting}`)
  );
};

/**
 * Check if a message is a common question about capabilities
 * @param message The user's message
 * @returns True if the message is a common question
 */
export const isCommonQuestion = (message: string): boolean => {
  const lowerMessage = message.toLowerCase().trim();
  return commonQuestions.some(question => lowerMessage.includes(question));
};

/**
 * Get a response for a greeting
 * @returns A greeting response
 */
export const getGreetingResponse = (): string => {
  const responses = [
    "Hello! I'm here to help with DePaul University resources. How can I assist you today?",
    "Hi there! I can provide information about DePaul's academic programs, campus resources, and student services. What would you like to know?",
    "Greetings! I'm your DePaul assistant. I can help with questions about admissions, financial aid, academic programs, and campus resources. What can I help you with?",
    "Welcome! I'm here to assist with information about DePaul University. How may I help you today?"
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
};

/**
 * Get a response for a common question about capabilities
 * @returns A response about capabilities
 */
export const getCapabilitiesResponse = (): string => {
  return `I can help you with various DePaul University resources and information, including:

- Academic programs and course information
- Admission requirements and application processes
- Financial aid and scholarship opportunities
- Campus facilities and resources
- Student services and support
- Events and activities
- Housing information
- Career services
- Library resources
- Technology services

Feel free to ask me any questions about these topics, and I'll do my best to assist you!`;
};