from django.urls import path
from .views import RegisterView, ExpenseListCreateView, ExpenseDeleteView,ExpenseUpdateView
from rest_framework_simplejwt.views import TokenObtainPairView
from .views import login_view

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('expenses/', ExpenseListCreateView.as_view(), name='expenses'),
    path('expenses/<int:pk>/', ExpenseDeleteView.as_view(), name='delete-expense'),
    path('expenses/<int:pk>/update/', ExpenseUpdateView.as_view(), name='update-expense'),
]