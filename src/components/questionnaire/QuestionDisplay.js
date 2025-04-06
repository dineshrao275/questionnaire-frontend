import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import './QuestionDisplay.css';

const QuestionDisplay = ({ 
  question, 
  onSubmit, 
  onPrevious, 
  onFinish,
  currentValue, 
  isLastQuestion, 
  hasPrevious,
  isLoading 
}) => {
  const [initialValues, setInitialValues] = useState({});
  const [validationSchema, setValidationSchema] = useState({});

  // Create validation schema based on question type and validation rules
  useEffect(() => {
    if (!question) return;

    // Set initial form values
    const formValues = { answer: currentValue || getDefaultValueForType(question.type) };
    setInitialValues(formValues);

    // Create validation schema based on question type and rules
    let schema = {};
    
    switch (question.type) {
      case 'text':
        schema = Yup.object({
          answer: Yup.string()
            .required(question.required ? 'This field is required' : '')
        });
        
        // Apply text-specific validations
        if (question.validation_rules) {
          if (question.validation_rules.min_length) {
            schema = Yup.object({
              answer: Yup.string()
                .required(question.required ? 'This field is required' : '')
                .min(question.validation_rules.min_length, `Minimum ${question.validation_rules.min_length} characters required`)
            });
          }
          if (question.validation_rules.max_length) {
            schema = Yup.object({
              answer: Yup.string()
                .required(question.required ? 'This field is required' : '')
                .max(question.validation_rules.max_length, `Maximum ${question.validation_rules.max_length} characters allowed`)
            });
          }
          if (question.validation_rules.pattern) {
            schema = Yup.object({
              answer: Yup.string()
                .required(question.required ? 'This field is required' : '')
                .matches(new RegExp(question.validation_rules.pattern), 'Invalid format')
            });
          }
        }
        break;
        
      case 'number':
        schema = Yup.object({
          answer: Yup.number()
            .required(question.required ? 'This field is required' : '')
            .typeError('Must be a number')
        });
        
        // Apply number-specific validations
        if (question.validation_rules) {
          if (question.validation_rules.min !== undefined) {
            schema = Yup.object({
              answer: Yup.number()
                .required(question.required ? 'This field is required' : '')
                .min(question.validation_rules.min, `Must be at least ${question.validation_rules.min}`)
                .typeError('Must be a number')
            });
          }
          if (question.validation_rules.max !== undefined) {
            schema = Yup.object({
              answer: Yup.number()
                .required(question.required ? 'This field is required' : '')
                .max(question.validation_rules.max, `Must be at most ${question.validation_rules.max}`)
                .typeError('Must be a number')
            });
          }
        }
        break;
        
      case 'date':
        schema = Yup.object({
          answer: Yup.date()
            .required(question.required ? 'This field is required' : '')
            .typeError('Must be a valid date')
        });
        break;
        
      case 'single_choice':
        schema = Yup.object({
          answer: Yup.string()
            .required(question.required ? 'Please select an option' : '')
        });
        break;
        
      case 'multiple_choice':
        schema = Yup.object({
          answer: Yup.array()
            .min(question.required ? 1 : 0, 'Please select at least one option')
        });
        break;
        
      default:
        schema = Yup.object({
          answer: Yup.mixed().required(question.required ? 'This field is required' : '')
        });
    }
    
    setValidationSchema(schema);
  }, [question, currentValue]);

  // Get default value based on question type
  const getDefaultValueForType = (type) => {
    switch (type) {
      case 'text': return '';
      case 'number': return '';
      case 'date': return '';
      case 'single_choice': return '';
      case 'multiple_choice': return [];
      default: return '';
    }
  };

  // Render input based on question type
  const renderInput = ({ field, form }) => {
    if (!question) return null;

    switch (question.type) {
      case 'text':
        return (
          <textarea
            {...field}
            className="form-control"
            rows="3"
          />
        );
        
      case 'number':
        return (
          <input
            type="number"
            {...field}
            className="form-control"
          />
        );
        
      case 'date':
        return (
          <input
            type="date"
            {...field}
            className="form-control"
          />
        );
        
      case 'single_choice':
        return (
          <div className="mt-2">
            {question.options && question.options.map((option, index) => (
              <div key={index} className="form-check radio-option">
                <input
                  type="radio"
                  id={`option-${index}`}
                  className="form-check-input"
                  name={field.name}
                  value={option}
                  checked={field.value === option}
                  onChange={() => form.setFieldValue(field.name, option)}
                />
                <label className="form-check-label" htmlFor={`option-${index}`}>
                  {option}
                </label>
              </div>
            ))}
          </div>
        );
        
      case 'multiple_choice':
        const selectedValues = Array.isArray(field.value) ? field.value : [];
        return (
          <div className="mt-2">
            {question.options && question.options.map((option, index) => (
              <div key={index} className="form-check checkbox-option">
                <input
                  type="checkbox"
                  id={`option-${index}`}
                  className="form-check-input"
                  name={field.name}
                  value={option}
                  checked={selectedValues.includes(option)}
                  onChange={(e) => {
                    const newValues = [...selectedValues];
                    if (e.target.checked) {
                      newValues.push(option);
                    } else {
                      const index = newValues.indexOf(option);
                      if (index > -1) {
                        newValues.splice(index, 1);
                      }
                    }
                    form.setFieldValue(field.name, newValues);
                  }}
                />
                <label className="form-check-label" htmlFor={`option-${index}`}>
                  {option}
                </label>
              </div>
            ))}
          </div>
        );
        
      default:
        return (
          <input 
            type="text" 
            {...field} 
            className="form-control" 
          />
        );
    }
  };

  return (
    <div className="question-display">
      {question ? (
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            if (isLastQuestion) {
              onFinish(question.id, values.answer);
            } else {
              onSubmit(question.id, values.answer);
            }
          }}
          enableReinitialize
        >
          {({ isSubmitting }) => (
            <Form className="question-form">
              <div className="question-content">
                <h3 className="question-text mb-4">{question.text}</h3>
                <div className="answer-field">
                  <Field name="answer">
                    {(props) => renderInput(props)}
                  </Field>
                  <ErrorMessage
                    name="answer"
                    component="div"
                    className="error-message text-danger mt-2"
                  />
                </div>
              </div>
              
              <div className="navigation-buttons mt-4">
                {hasPrevious && (
                  <button
                    type="button"
                    className="btn btn-outline-primary me-2"
                    onClick={onPrevious}
                    disabled={isSubmitting || isLoading}
                  >
                    Previous
                  </button>
                )}
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting || isLoading}
                >
                  {isLastQuestion ? 'Finish' : 'Next'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      ) : (
        <div className="text-center">
          <p>Loading question...</p>
        </div>
      )}
    </div>
  );
};

export default QuestionDisplay;