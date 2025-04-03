from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Book, Review

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']

class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Review
        fields = ['id', 'book', 'user', 'user_id', 'rating', 'comment', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class BookSerializer(serializers.ModelSerializer):
    reviews = ReviewSerializer(many=True, read_only=True)
    average_rating = serializers.FloatField(read_only=True)
    
    class Meta:
        model = Book
        fields = ['id', 'title', 'author', 'genre', 'published_year', 'created_at', 'reviews', 'average_rating']
        read_only_fields = ['id', 'created_at'] 