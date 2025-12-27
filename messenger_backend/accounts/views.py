from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate  # Добавьте этот импорт
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer
    
    def create(self, request, *args, **kwargs):
        # Вызываем родительский метод для создания пользователя
        response = super().create(request, *args, **kwargs)
        
        # Получаем созданного пользователя
        user = User.objects.get(username=request.data['username'])
        
        # Создаем токены
        refresh = RefreshToken.for_user(user)
        
        # Добавляем токены в ответ
        response.data.update({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
        
        return response

class LoginView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        # Проверяем, что переданы username и password
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response(
                {'error': 'Username and password are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Аутентифицируем пользователя
        user = authenticate(username=username, password=password)
        
        if user:
            # Создаем токены
            refresh = RefreshToken.for_user(user)
            
            # Сериализуем данные пользователя
            user_data = UserSerializer(user).data
            
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': user_data
            }, status=status.HTTP_200_OK)
        
        return Response(
            {'error': 'Invalid Credentials'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )

class UserProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user

class UserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)
    queryset = User.objects.all()
    
    def get_queryset(self):
        queryset = super().get_queryset()
        username = self.request.query_params.get('search', None)
        if username:
            queryset = queryset.filter(username__icontains=username)
        return queryset.exclude(id=self.request.user.id)