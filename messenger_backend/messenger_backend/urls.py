from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from accounts.views import RegisterView, LoginView, UserProfileView, UserListView
from messenger.views import ChatViewSet, MessageViewSet, ContactViewSet
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'chats', ChatViewSet, basename='chat')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'contacts', ContactViewSet, basename='contact')

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Аутентификация
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    path('api/auth/login/', LoginView.as_view(), name='login'),
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/', include('accounts.urls')),
    
    # Пользователи
    path('api/users/me/', UserProfileView.as_view(), name='user-profile'),
    path('api/users/', UserListView.as_view(), name='user-list'),
    
    # API мессенджера
    path('api/', include(router.urls)),
]