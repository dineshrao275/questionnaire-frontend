import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({ progress, totalQuestions, completedQuestions }) => {
  // Calculate percentage if not provided directly
  const percentage = progress || (totalQuestions ? Math.round((completedQuestions / totalQuestions) * 100) : 0);
  const safePercentage = Math.min(100, Math.max(0, percentage)); // Ensure percentage is between 0 and 100

  return (
    <div className="questionnaire-progress-container">
      <div className="progress-stats">
        <span className="progress-text">Progress: {safePercentage}%</span>
        <span className="questions-count">
          {completedQuestions || 0} of {totalQuestions || '?'} questions
        </span>
      </div>
      <div className="progress">
        <div
          className="progress-bar"
          role="progressbar"
          style={{
            width: `${safePercentage}%`,
            transition: 'width 0.5s ease-in-out'
          }}
          aria-valuenow={safePercentage}
          aria-valuemin="0"
          aria-valuemax="100"
        />
      </div>
    </div>
  );
};

export default ProgressBar; 