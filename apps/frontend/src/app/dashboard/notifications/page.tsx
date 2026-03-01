'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch, getApiUrl, getAuthHeaders } from '@/app/lib/api';

interface ConversationSummary {
  other_user_id: number;
  other_user_name: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

interface MessageItem {
  id: number;
  sender: number;
  recipient: number;
  sender_name: string;
  recipient_name: string;
  body: string;
  listing: number | null;
  listing_title: string | null;
  read_at: string | null;
  created_at: string;
  is_from_me: boolean;
}

function formatMessageTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour ago`;
  if (diffDays < 7) return `${diffDays} day ago`;
  return d.toLocaleDateString();
}

const NotificationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'notifications' | 'messages'>('notifications');
  const [loading, setLoading] = useState(true);
  const notifications: Array<{ id: number; message: string; time: string; type: string; read: boolean }> = [];

  // Messages from API
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<ConversationSummary | null>(null);
  const [threadMessages, setThreadMessages] = useState<MessageItem[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [sendBody, setSendBody] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const loadConversations = useCallback(async () => {
    setConversationsLoading(true);
    const res = await apiFetch<ConversationSummary[]>('messaging/conversations/');
    if (res.ok && Array.isArray(res.data)) setConversations(res.data);
    setConversationsLoading(false);
  }, []);

  useEffect(() => {
    if (activeTab === 'messages') loadConversations();
  }, [activeTab, loadConversations]);

  const loadThread = useCallback(async (otherUserId: number) => {
    setThreadLoading(true);
    const res = await apiFetch<MessageItem[]>(`messaging/conversations/${otherUserId}/messages/`);
    if (res.ok && Array.isArray(res.data)) setThreadMessages(res.data);
    setThreadLoading(false);
  }, []);

  useEffect(() => {
    if (selectedConversation) loadThread(selectedConversation.other_user_id);
    else setThreadMessages([]);
  }, [selectedConversation, loadThread]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || !sendBody.trim()) return;
    setSending(true);
    const res = await fetch(
      getApiUrl(`messaging/conversations/${selectedConversation.other_user_id}/messages/`),
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ body: sendBody.trim() }),
      }
    );
    if (res.ok) {
      setSendBody('');
      loadThread(selectedConversation.other_user_id);
      loadConversations();
    }
    setSending(false);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <div className="h-9 w-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-5 w-96 bg-gray-100 rounded animate-pulse mt-2" />
        </div>
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 h-12 flex gap-4 px-6 items-center">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-50 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Notifications & Messages</h1>
        <p className="mt-2 text-gray-600">Stay updated with your property activity and agent communications.</p>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-1 px-6">
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'notifications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'messages'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Messages
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              {notifications.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-sm">No notifications yet.</p>
                  <p className="text-xs mt-1">When you have appointments or listing updates, they’ll appear here.</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border border-gray-200 rounded-lg cursor-pointer transition-colors ${
                      notification.read ? 'bg-white' : 'bg-blue-50'
                    } hover:bg-gray-50`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                      {!notification.read && (
                        <span className="ml-4 w-2 h-2 bg-blue-600 rounded-full"></span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="flex flex-col sm:flex-row gap-6 -m-6 sm:m-0">
              <div className="w-full sm:w-80 border-b sm:border-b-0 sm:border-r border-gray-200 flex-shrink-0">
                {conversationsLoading ? (
                  <div className="p-4 space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-14 bg-gray-100 rounded animate-pulse" />
                    ))}
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-6 text-center text-sm text-gray-500">
                    No conversations yet. Message an agent from a listing to start.
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {conversations.map((c) => (
                      <li key={c.other_user_id}>
                        <button
                          type="button"
                          onClick={() => setSelectedConversation(c)}
                          className={`w-full text-left p-4 hover:bg-gray-50 flex items-start gap-3 ${
                            selectedConversation?.other_user_id === c.other_user_id ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium flex-shrink-0">
                            {c.other_user_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium text-gray-900 truncate">{c.other_user_name}</span>
                              {c.unread_count > 0 && (
                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                                  {c.unread_count > 9 ? '9+' : c.unread_count}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 truncate">{c.last_message || 'No messages'}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{formatMessageTime(c.last_message_at)}</p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex-1 min-w-0 flex flex-col">
                {!selectedConversation ? (
                  <div className="flex-1 flex items-center justify-center text-gray-500 text-sm py-12">
                    Select a conversation or start a new one from a listing.
                  </div>
                ) : (
                  <>
                    <div className="border-b border-gray-200 px-4 py-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                        {selectedConversation.other_user_name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-gray-900">{selectedConversation.other_user_name}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedConversation(null)}
                        className="sm:hidden ml-auto text-gray-500 hover:text-gray-700"
                      >
                        Back
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-80 p-4 space-y-3">
                      {threadLoading ? (
                        <div className="space-y-3">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="h-12 bg-gray-100 rounded animate-pulse w-3/4" />
                          ))}
                        </div>
                      ) : (
                        threadMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.is_from_me ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[85%] rounded-lg px-4 py-2 ${
                                msg.is_from_me
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap break-words">{msg.body}</p>
                              <p className={`text-xs mt-1 ${msg.is_from_me ? 'text-blue-100' : 'text-gray-500'}`}>
                                {formatMessageTime(msg.created_at)}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={sendBody}
                          onChange={(e) => setSendBody(e.target.value)}
                          placeholder="Type a message..."
                          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          disabled={sending}
                        />
                        <button
                          type="submit"
                          disabled={sending || !sendBody.trim()}
                          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {sending ? 'Sending...' : 'Send'}
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
