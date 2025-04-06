import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Questionnaire Components
import QuestionnaireContainer from './components/questionnaire/QuestionnaireContainer';
import Summary from './components/questionnaire/Summary';

// Utility Components
import PrivateRoute from './components/common/PrivateRoute';
import Header from './components/common/Header';
import CompletionCheck from './components/common/CompletionCheck';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <div className="container mt-4">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/questionnaire" element={
              <PrivateRoute>
                <QuestionnaireContainer />
              </PrivateRoute>
            } />
            <Route path="/summary" element={
              <PrivateRoute>
                <CompletionCheck>
                  <Summary />
                </CompletionCheck>
              </PrivateRoute>
            } />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </div>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Router>
  );
}

export default App;