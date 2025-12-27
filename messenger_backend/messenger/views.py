from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Chat, Message, Contact
from .serializers import ChatSerializer, MessageSerializer, ContactSerializer

class ChatViewSet(viewsets.ModelViewSet):
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Chat.objects.all()
    
    def get_queryset(self):
        user = self.request.user
        return self.queryset.filter(participants=user)
    
    def perform_create(self, serializer):
        chat = serializer.save()
        chat.participants.add(self.request.user)
        # Для приватного чата добавляем второго участника
        if chat.chat_type == 'private':
            participant_id = self.request.data.get('participant_id')
            if participant_id:
                chat.participants.add(participant_id)
    
    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        chat = self.get_object()
        messages = chat.messages.all()
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Message.objects.all()
    
    def get_queryset(self):
        user = self.request.user
        return self.queryset.filter(
            Q(chat__participants=user) | Q(sender=user)
        ).distinct()
    
    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        message = self.get_object()
        if message.chat.participants.filter(id=request.user.id).exists():
            message.is_read = True
            message.read_by.add(request.user)
            message.save()
            return Response({'status': 'message marked as read'})
        return Response({'error': 'Permission denied'}, 
            status=status.HTTP_403_FORBIDDEN)

class ContactViewSet(viewsets.ModelViewSet):
    serializer_class = ContactSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Contact.objects.all()
    
    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)