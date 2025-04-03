import React, { useEffect } from 'react';
import { Card, Button } from 'react-bootstrap';

const ReviewCard = ({ review, onEdit, onDelete, canModify }) => {
  // Debug the review object
  useEffect(() => {
    console.log('ReviewCard received review:', review);
  }, [review]);

  // Helper function to render stars
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<i key={i} className="bi bi-star-fill text-warning"></i>);
      } else {
        stars.push(<i key={i} className="bi bi-star text-warning"></i>);
      }
    }
    return stars;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (err) {
      console.error('Error formatting date:', err);
      return dateString;
    }
  };
  
  // Check if review or user is undefined
  if (!review || !review.user) {
    console.error('Invalid review object:', review);
    return (
      <Card className="mb-3 shadow-sm">
        <Card.Body>
          <p className="text-danger">Error: Invalid review data</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mb-3 shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div>
            <strong>{review.user.username}</strong>
            <span className="text-muted ms-2">
              {formatDate(review.created_at)}
            </span>
          </div>
          <div>{renderStars(review.rating)}</div>
        </div>
        <Card.Text>{review.comment}</Card.Text>
        {canModify && (
          <div className="d-flex justify-content-end">
            <Button 
              variant="outline-primary" 
              size="sm" 
              className="me-2" 
              onClick={() => onEdit(review)}
            >
              Edit
            </Button>
            <Button 
              variant="outline-danger" 
              size="sm" 
              onClick={() => onDelete(review.id)}
            >
              Delete
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default ReviewCard; 