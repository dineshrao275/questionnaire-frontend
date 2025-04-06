import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { questionnaireService } from '../../services/api';

const Summary = () => {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      setIsLoading(true);
      const response = await questionnaireService.getSummary();
      setSummary(response);
    } catch (error) {
      console.error('Error loading summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'medium'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatAnswer = (answer) => {
    if (answer === null || answer === undefined) return 'Not answered';
    if (Array.isArray(answer)) return answer.join(', ');
    return answer.toString();
  };

  const handleStartNew = () => {
    navigate('/questionnaire', { state: { startNew: true } });
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

  if (!summary) {
    return (
      <div className="text-center mt-4">
        <div className="alert alert-warning">
          No summary data available. Please complete the questionnaire first.
        </div>
        <button 
          className="btn btn-primary mt-3"
          onClick={() => navigate('/questionnaire')}
        >
          Start Questionnaire
        </button>
      </div>
    );
  }

  return (
    <div className="summary-container">
      <div className="card">
        <div className="card-header">
          <h2>Questionnaire Summary</h2>
        </div>
        <div className="card-body">
          <div className="summary-info mb-4">
            <div className="row">
              <div className="col-md-4">
                <p className="mb-2">
                  <strong>Started:</strong><br />
                  {formatDate(summary.start_time)}
                </p>
              </div>
              <div className="col-md-4">
                <p className="mb-2">
                  <strong>Last Activity:</strong><br />
                  {formatDate(summary.last_activity)}
                </p>
              </div>
              <div className="col-md-4">
                <p className="mb-2">
                  <strong>Completed:</strong><br />
                  {summary.completion_time ? formatDate(summary.completion_time) : 'In Progress'}
                </p>
              </div>
            </div>
            <div className="progress mt-3" style={{ height: '25px' }}>
              <div
                className="progress-bar"
                role="progressbar"
                style={{ width: `${summary.completion_percentage}%` }}
                aria-valuenow={summary.completion_percentage}
                aria-valuemin="0"
                aria-valuemax="100"
              >
                {summary.completion_percentage}% Complete
              </div>
            </div>
          </div>

          <div className="answers-section">
            <h3 className="mb-4">Your Answers</h3>
            {summary.user_answers.map((answer, index) => (
              <div key={index} className="answer-item card mb-3">
                <div className="card-body">
                  <h5 className="card-title">Question {index + 1}</h5>
                  <p className="card-text">
                    <strong>Question:</strong> {answer.question_text}
                  </p>
                  <p className="card-text">
                    <strong>Your Answer:</strong> {formatAnswer(answer.answer_value)}
                  </p>
                  <p className="card-text text-muted">
                    <small>
                      Answered on: {formatDate(answer.timestamp)}
                    </small>
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-4">
            <button 
              className="btn btn-primary me-2"
              onClick={handleStartNew}
            >
              Start New Questionnaire
            </button>
            <button 
              className="btn btn-outline-secondary"
              onClick={() => window.print()}
            >
              Print Summary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Summary; 