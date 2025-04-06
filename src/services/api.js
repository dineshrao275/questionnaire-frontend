import axios from 'axios';

const API_URL = 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const questionnaireService = {
  // Get the initial question to start the questionnaire
  getInitialQuestion: async () => {
    const response = await api.get('/api/questions/start');
    return response.data;
  },

  // Get a specific question by ID
  getQuestion: async (questionId) => {
    const response = await api.get(`/api/questions/${questionId}`);
    return response.data;
  },

  // Get answer for a specific question
  getAnswer: async (questionId) => {
    const response = await api.get(`/api/answers/${questionId}`);
    return response.data;
  },

  // Submit an answer and get the next question
  submitAnswer: async (questionId, answerValue) => {
    const response = await api.post('/api/answers', {
      question_id: questionId,
      answer_value: answerValue
    });
    return response.data;
  },

  // Update an existing answer
  updateAnswer: async (questionId, answerValue) => {
    const response = await api.put(`/api/answers/${questionId}`, {
      question_id: questionId,
      answer_value: answerValue
    });
    return response.data;
  },

  // Get the previous question
  getPreviousQuestion: async (currentQuestionId) => {
    const response = await api.get(`/api/questions/previous/${currentQuestionId}`);
    return response.data;
  },

  // Get the user's current progress
  getProgress: async () => {
    const response = await api.get('/api/progress');
    return response.data;
  },

  // Get the summary of all answers
  getSummary: async () => {
    const response = await api.get('/api/summary');
    return response.data;
  },

  // Get the user's question history
  getQuestionHistory: async () => {
    const response = await api.get('/api/question-history');
    return response.data;
  }
};

const authService = {
  // Register a new user
  register: async (email, password, name) => {
    const response = await api.post('/api/register', {
      email,
      password,
      name
    });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  // Login user
  login: async (email, password) => {
    const response = await api.post('/api/login', {
      email,
      password
    });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

export { questionnaireService, authService };