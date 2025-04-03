# Book Review Platform

A full-stack application for browsing books and leaving reviews. Built with Django REST Framework (backend) and React (frontend).

## Features

- Browse books with filter by genre
- Search books by title, author, or genre
- View book details and reviews
- Add, edit, and delete reviews (authenticated users)
- Average rating calculation per book

## Tech Stack

### Backend
- Django
- Django REST Framework
- SQLite (for development)

### Frontend
- React
- React Router
- React Bootstrap
- Axios

## Setup and Installation

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   pip install django djangorestframework django-cors-headers
   ```

3. Run migrations:
   ```
   python manage.py migrate
   ```

4. Create a superuser:
   ```
   python manage.py createsuperuser
   ```

5. Create sample data (optional):
   ```
   python manage.py create_sample_data
   ```

6. Start the development server:
   ```
   python manage.py runserver
   ```

The Django API will be available at http://127.0.0.1:8000/api/

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

The React application will be available at http://localhost:3000

## API Endpoints

- **GET /api/books/** - List all books
- **GET /api/books/{id}/** - Retrieve a specific book
- **GET /api/books/{id}/reviews/** - Get reviews for a specific book
- **GET /api/reviews/** - List all reviews
- **POST /api/reviews/** - Create a new review
- **PUT /api/reviews/{id}/** - Update a review
- **DELETE /api/reviews/{id}/** - Delete a review

## Authentication

Authentication is managed using Django's token authentication:
- **POST /api-token-auth/** - Obtain an auth token

## Users
Sample users created by the `create_sample_data` command:
- Username: user1, Password: password123
- Username: user2, Password: password123
- Username: user3, Password: password123
- Username: user4, Password: password123 