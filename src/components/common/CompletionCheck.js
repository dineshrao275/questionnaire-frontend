import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { questionnaireService } from '../../services/api';

const CompletionCheck = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    checkCompletion();
  }, []);

  const checkCompletion = async () => {
    try {
      const progressData = await questionnaireService.getProgress();
      setIsCompleted(progressData.is_completed);
    } catch (error) {
      console.error('Error checking completion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center mt-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isCompleted) {
    return (
      <div className="text-center mt-4">
        <div className="alert alert-warning">
          Please complete the questionnaire before viewing the summary.
        </div>
        <button 
          className="btn btn-primary mt-3"
          onClick={() => window.location.href = '/questionnaire'}
        >
          Continue Questionnaire
        </button>
      </div>
    );
  }

  return children;
};

export default CompletionCheck; 