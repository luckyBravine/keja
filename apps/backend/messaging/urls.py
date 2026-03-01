from django.urls import path
from . import views

urlpatterns = [
    path('conversations/', views.ConversationListView.as_view(), name='conversation-list'),
    path('conversations/<int:user_id>/messages/', views.MessageThreadView.as_view(), name='message-thread'),
    path('messages/<int:pk>/read/', views.MarkMessageReadView.as_view(), name='message-mark-read'),
]
