from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import Book, Review
import random

class Command(BaseCommand):
    help = 'Creates sample books and reviews for development'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating sample data...')
        
        # Create sample books
        books_data = [
            {
                'title': 'To Kill a Mockingbird',
                'author': 'Harper Lee',
                'genre': 'Fiction',
                'published_year': 1960
            },
            {
                'title': '1984',
                'author': 'George Orwell',
                'genre': 'Science Fiction',
                'published_year': 1949
            },
            {
                'title': 'The Great Gatsby',
                'author': 'F. Scott Fitzgerald',
                'genre': 'Fiction',
                'published_year': 1925
            },
            {
                'title': 'Pride and Prejudice',
                'author': 'Jane Austen',
                'genre': 'Romance',
                'published_year': 1813
            },
            {
                'title': 'The Hobbit',
                'author': 'J.R.R. Tolkien',
                'genre': 'Fantasy',
                'published_year': 1937
            },
            {
                'title': 'Harry Potter and the Sorcerer\'s Stone',
                'author': 'J.K. Rowling',
                'genre': 'Fantasy',
                'published_year': 1997
            },
        ]
        
        books = []
        for book_data in books_data:
            book, created = Book.objects.get_or_create(**book_data)
            books.append(book)
            if created:
                self.stdout.write(f'Created book: {book.title}')
            else:
                self.stdout.write(f'Book already exists: {book.title}')
        
        # Create sample users if they don't exist
        users = []
        for i in range(1, 5):
            username = f'user{i}'
            email = f'user{i}@example.com'
            user, created = User.objects.get_or_create(
                username=username,
                defaults={'email': email, 'is_active': True}
            )
            if created:
                user.set_password('password123')
                user.save()
                self.stdout.write(f'Created user: {username}')
            else:
                self.stdout.write(f'User already exists: {username}')
            users.append(user)
        
        # Create sample reviews
        for book in books:
            for user in users:
                # Skip some reviews randomly
                if random.random() < 0.3:
                    continue
                    
                review, created = Review.objects.get_or_create(
                    book=book,
                    user=user,
                    defaults={
                        'rating': random.randint(1, 5),
                        'comment': f'This is a sample review for {book.title} by {user.username}.'
                    }
                )
                if created:
                    self.stdout.write(f'Created review for {book.title} by {user.username}')
                else:
                    self.stdout.write(f'Review already exists for {book.title} by {user.username}')
        
        self.stdout.write(self.style.SUCCESS('Successfully created sample data')) 