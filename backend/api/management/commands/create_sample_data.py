from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import Book, Review
import random

class Command(BaseCommand):
    help = 'Creates sample books and reviews for development'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating sample data...')
        
        # adding some cool books ppl might like
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
        
        # gotta make some fake users lol
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
        
        # Sample review templates - more natural, human-like comments
        review_templates = [
            "loved it! definitely recommend to anyone who enjoys {genre}",
            "omg this book was sooo good!! couldn't put it down",
            "tbh not what i expected... kinda disappointing :(",
            "took me a while to get into it but the ending was worth it",
            "meh, it was ok. nothing special",
            "AMAZING book!!! one of my all-time favs",
            "not bad, but I've read better. the characters were kinda flat",
            "pretty good read for a rainy weekend. 👍",
            "liked the story but hated the main character... so annoying",
            "honestly? overrated. don't get why everyone loves it so much",
            "read this in one sitting! absolutely incredible",
            "just finished it last night and i'm still thinking about it",
            "slow start but gets better. stick with it",
            "can't believe i waited so long to read this!",
            "ugh the writing style was not for me. gave up halfway"
        ]
        
        # now let's add some reviews from ppl
        for book in books:
            for user in users:
                # nah skip some randomly cuz not everyone reviews everything
                if random.random() < 0.3:
                    continue
                    
                # Pick a random review template and fill in the genre
                comment = random.choice(review_templates).replace('{genre}', book.genre.lower())
                
                review, created = Review.objects.get_or_create(
                    book=book,
                    user=user,
                    defaults={
                        'rating': random.randint(1, 5),
                        'comment': comment
                    }
                )
                if created:
                    self.stdout.write(f'Created review for {book.title} by {user.username}')
                else:
                    self.stdout.write(f'Review already exists for {book.title} by {user.username}')
        
        self.stdout.write(self.style.SUCCESS('Successfully created sample data')) 