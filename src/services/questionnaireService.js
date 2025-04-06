import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const questionnaireService = {
  // Get the initial question to start the questionnaire
  getInitialQuestion: async () => {
    try {
      const response = await axios.get(`${API_URL}/questions/start`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting initial question:', error);
      throw error;
    }
  },

  // Get a specific question by ID
  getQuestion: async (questionId) => {
    try {
      const response = await axios.get(`${API_URL}/questions/${questionId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting question:', error);
      throw error;
    }
  },

  // Submit an answer and get the next question
  submitAnswer: async (questionId, answer) => {
    try {
      const response = await axios.post(
        `${API_URL}/answers`,
        {
          question_id: questionId,
          answer_value: answer
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error submitting answer:', error);
      throw error;
    }
  },

  // Update an existing answer
  updateAnswer: async (questionId, answerValue) => {
    const response = await axios.put(`${API_URL}/answers/${questionId}`, {
      question_id: questionId,
      answer_value: answerValue
    });
    return response.data;
  },

  // Get the previous question
  getPreviousQuestion: async (questionId) => {
    try {
      const response = await axios.get(`${API_URL}/questions/previous/${questionId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting previous question:', error);
      throw error;
    }
  },

  // Get the user's current progress
  getProgress: async () => {
    try {
      const response = await axios.get(`${API_URL}/progress`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting progress:', error);
      throw error;
    }
  },

  // Get the summary of all answers
  getSummary: async () => {
    const response = await axios.get(`${API_URL}/summary`);
    return response.data;
  },

  // Get the user's question history
  getQuestionHistory: async () => {
    const response = await axios.get(`${API_URL}/question-history`);
    return response.data;
  }
};

export default questionnaireService;