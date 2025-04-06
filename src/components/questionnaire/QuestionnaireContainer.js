import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import QuestionDisplay from './QuestionDisplay';
import ProgressBar from '../common/ProgressBar';
import { questionnaireService } from '../../services/api';

const QuestionnaireContainer = () => {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentAnswer, setCurrentAnswer] = useState(null);
  const [isLastQuestion, setIsLastQuestion] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [questionHistory, setQuestionHistory] = useState([]);
  const [progress, setProgress] = useState({
    totalQuestions: 10,
    completedQuestions: 0,
    percentage: 0,
    questionPath: [],
    answeredQuestions: {}
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { state: { from: location } });
      return;
    }

    if (location.state?.startNew) {
      startNewQuestionnaire();
    } else {
      loadInitialQuestion();
    }
  }, [location.state]);

  const startNewQuestionnaire = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Reset all state
      setCurrentQuestion(null);
      setCurrentAnswer(null);
      setIsLastQuestion(false);
      setHasPrevious(false);
      setQuestionHistory([]);
      setProgress({
        totalQuestions: 10,
        completedQuestions: 0,
        percentage: 0,
        questionPath: [],
        answeredQuestions: {}
      });

      // Start new questionnaire
      const response = await questionnaireService.getInitialQuestion();
      if (response) {
        setCurrentQuestion(response);
        setQuestionHistory([response.id]);
        await updateProgress();
      }
    } catch (error) {
      console.error('Error starting new questionnaire:', error);
      if (error.response?.status === 401) {
        navigate('/login', { state: { from: location } });
      } else {
        setError('Failed to start questionnaire. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadInitialQuestion = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // First try to get initial question for new users
      try {
        const initialQuestion = await questionnaireService.getInitialQuestion();
        if (initialQuestion) {
          setCurrentQuestion(initialQuestion);
          setQuestionHistory([initialQuestion.id]);
          await updateProgress();
          return;
        }
      } catch (error) {
        console.error('Error getting initial question:', error);
        // Continue to check progress if initial question fails
      }

      // If initial question fails, check progress
      const progressData = await questionnaireService.getProgress();
      
      if (progressData.is_completed) {
        await startNewQuestionnaire();
        return;
      }

      // If there's a current question, load it
      if (progressData.current_question_id) {
        const response = await questionnaireService.getQuestion(progressData.current_question_id);
        if (response) {
          setCurrentQuestion(response);
          setQuestionHistory(progressData.question_path);
          await updateProgress();
        }
      } else {
        // If no current question, start new questionnaire
        await startNewQuestionnaire();
      }
    } catch (error) {
      console.error('Error loading initial question:', error);
      if (error.response?.status === 401) {
        navigate('/login', { state: { from: location } });
      } else {
        setError('Failed to load question. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateProgress = async () => {
    try {
      const progressData = await questionnaireService.getProgress();
      
      // Calculate progress based on completed questions
      const completedCount = progressData.completed_questions.length;
      const totalQuestions = progressData.total_questions || 10;
      const percentage = (completedCount / totalQuestions) * 100;

      setProgress({
        totalQuestions: totalQuestions,
        completedQuestions: completedCount,
        percentage: percentage,
        questionPath: progressData.question_path,
        answeredQuestions: progressData.answers || {}
      });

      setHasPrevious(questionHistory.length > 1);
      setIsLastQuestion(completedCount >= totalQuestions - 1); // Last question is the 10th
    } catch (error) {
      console.error('Error updating progress:', error);
      if (error.response?.status === 401) {
        navigate('/login', { state: { from: location } });
      }
    }
  };

  const handleSubmit = async (questionId, answer) => {
    try {
      setIsLoading(true);
      const response = await questionnaireService.submitAnswer(questionId, answer);
      
      if (response.is_last) {
        setIsLastQuestion(true);
        await updateProgress();
        navigate('/summary');
      } else {
        setCurrentQuestion(response.question);
        setCurrentAnswer(null);
        setQuestionHistory(prev => [...prev, response.question.id]);
        await updateProgress();
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      setError('Failed to submit answer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = async () => {
    if (!currentQuestion || questionHistory.length <= 1) return;
    
    try {
      setIsLoading(true);
      const newHistory = questionHistory.slice(0, -1);
      const previousQuestionId = newHistory[newHistory.length - 1];
      
      const response = await questionnaireService.getPreviousQuestion(previousQuestionId);
      
      if (response) {
        setCurrentQuestion(response);
        const previousAnswer = progress.answeredQuestions[previousQuestionId];
        setCurrentAnswer(previousAnswer);
        setQuestionHistory(newHistory);
        setIsLastQuestion(false);
        await updateProgress();
      }
    } catch (error) {
      console.error('Error getting previous question:', error);
      setError('Failed to go back. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = async (questionId, answer) => {
    try {
      setIsLoading(true);
      await questionnaireService.submitAnswer(questionId, answer);
      await updateProgress();
      navigate('/summary');
    } catch (error) {
      console.error('Error finishing questionnaire:', error);
      setError('Failed to finish questionnaire. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="questionnaire-container">
      {error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : (
        <>
          <ProgressBar 
            progress={progress.percentage}
            totalQuestions={progress.totalQuestions}
            completedQuestions={progress.completedQuestions}
          />
          {isLoading ? (
            <div className="text-center mt-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <QuestionDisplay
              question={currentQuestion}
              onSubmit={handleSubmit}
              onPrevious={handlePrevious}
              onFinish={handleFinish}
              currentValue={currentAnswer}
              isLastQuestion={isLastQuestion}
              hasPrevious={questionHistory.length > 1}
              isLoading={isLoading}
            />
          )}
        </>
      )}
    </div>
  );
};

export default QuestionnaireContainer;
