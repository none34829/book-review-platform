import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { authApi } from '../services/api';

const ReviewForm = ({ bookId, review, onSubmit, onCancel }) => {
  const [rating, setRating] = useState(review ? review.rating : 5);
  const [comment, setComment] = useState(review ? review.comment : '');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // reset the form when switching between add/edit modes
  useEffect(() => {
    if (review) {
      setRating(review.rating);
      setComment(review.comment);
    } else {
      setRating(5);
      setComment('');
    }
  }, [review]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // check if comment is empty
    if (!comment.trim()) {
      setError('Please provide a comment for your review.');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      // make sure we're logged in first
      if (!localStorage.getItem('token')) {
        try {
          console.log('Attempting to authenticate before submitting review...');
          const authResponse = await authApi.login();
          if (authResponse.data && authResponse.data.token) {
            localStorage.setItem('token', authResponse.data.token);
            console.log('Authentication successful, token stored:', authResponse.data.token);
          } else {
            console.error('Auth response missing token:', authResponse);
            throw new Error('Authentication failed. Missing token in response.');
          }
        } catch (authErr) {
          console.error('Authentication failed:', authErr);
          console.error('Auth error response:', authErr.response?.data);
          throw new Error('Authentication failed. Please try again.');
        }
      }
      
      // put together the review data
      const reviewData = {
        rating: parseInt(rating, 10), // make sure rating is a number
        comment: comment.trim(),
        book: bookId, // pass the book ID as is
        user_id: 2, // use ID 2 which corresponds to user1
      };
      
      console.log('Submitting review data:', reviewData);
      await onSubmit(reviewData);
      setRating(5);
      setComment('');
    } catch (err) {
      console.error('Error saving review:', err);
      setError(`An error occurred: ${err.message || 'Unknown error'}.`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mb-4 p-3 border rounded">
      <h4>{review ? 'Edit Review' : 'Write a Review'}</h4>
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formRating">
          <Form.Label>Rating</Form.Label>
          <div className="d-flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => setRating(star)}
                style={{ cursor: 'pointer', fontSize: '2rem', color: star <= rating ? '#ffc107' : '#e4e5e9' }}
                className="me-1"
              >
                ★
              </span>
            ))}
          </div>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formComment">
          <Form.Label>Comment</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your review here..."
            required
          />
        </Form.Group>

        <div className="d-flex justify-content-end">
          {onCancel && (
            <Button 
              variant="outline-secondary" 
              onClick={onCancel} 
              className="me-2"
              disabled={submitting}
            >
              Cancel
            </Button>
          )}
          <Button 
            variant="primary" 
            type="submit"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : review ? 'Update Review' : 'Submit Review'}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default ReviewForm; 