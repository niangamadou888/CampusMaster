'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { messageApi } from '@/services/messageApi';
import { Conversation, Message } from '@/types/message';
import { User } from '@/types/auth';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  LogOut,
  MessageSquare,
  Send,
  Plus,
  Search,
  X,
  ArrowLeft,
  GraduationCap,
  Bell,
} from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';
import { useNotifications } from '@/context/NotificationContext';

function TeacherMessagesContent() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState('');
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [contactSearch, setContactSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { unreadCount } = useNotifications();

  const navItems = [
    { href: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/teacher/courses', label: 'Courses', icon: BookOpen },
    { href: '/teacher/assignments', label: 'Assignments', icon: ClipboardList },
    { href: '/teacher/grades', label: 'Grades', icon: GraduationCap },
    { href: '/teacher/messages', label: 'Messages', icon: MessageSquare },
    { href: '/teacher/notifications', label: 'Notifications', icon: Bell },
  ];

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await messageApi.getConversations();
      setConversations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversation: Conversation) => {
    try {
      setMessagesLoading(true);
      setSelectedConversation(conversation);
      const data = await messageApi.getMessages(conversation.id);
      setMessages(data);
      if (conversation.unreadCount && conversation.unreadCount > 0) {
        await messageApi.markAsRead(conversation.id);
        loadConversations();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setMessagesLoading(false);
    }
  };

  const loadContacts = async () => {
    try {
      const data = await messageApi.getContacts();
      setContacts(data);
      setShowContacts(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contacts');
    }
  };

  const handleSend = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    const otherUser = getOtherParticipant(selectedConversation);
    if (!otherUser) return;

    try {
      setSending(true);
      await messageApi.sendMessage(otherUser.userEmail, messageText.trim());
      setMessageText('');
      await loadMessages(selectedConversation);
      loadConversations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleSendToContact = async (contact: User) => {
    const existing = conversations.find(
      (c) =>
        c.participant1.userEmail === contact.userEmail ||
        c.participant2.userEmail === contact.userEmail
    );
    if (existing) {
      setShowContacts(false);
      setContactSearch('');
      await loadMessages(existing);
      return;
    }
    setShowContacts(false);
    setContactSearch('');

    const tempConv: Conversation = {
      id: -1,
      participant1: user as User,
      participant2: contact,
      lastMessageAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      unreadCount: 0,
    };
    setSelectedConversation(tempConv);
    setMessages([]);
  };

  const handleSendNewConversation = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    const otherUser = getOtherParticipant(selectedConversation);
    if (!otherUser) return;

    try {
      setSending(true);
      await messageApi.sendMessage(otherUser.userEmail, messageText.trim());
      setMessageText('');
      await loadConversations();
      const updatedConversations = await messageApi.getConversations();
      const newConv = updatedConversations.find(
        (c) =>
          c.participant1.userEmail === otherUser.userEmail ||
          c.participant2.userEmail === otherUser.userEmail
      );
      if (newConv) {
        setSelectedConversation(newConv);
        await loadMessages(newConv);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const getOtherParticipant = (conv: Conversation): User | null => {
    if (!user) return null;
    return conv.participant1.userEmail === user.userEmail
      ? conv.participant2
      : conv.participant1;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const other = getOtherParticipant(conv);
    if (!other) return false;
    const name = `${other.userFirstName} ${other.userLastName}`.toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  const filteredContacts = contacts.filter((contact) => {
    if (!contactSearch) return true;
    const name = `${contact.userFirstName} ${contact.userLastName}`.toLowerCase();
    return name.includes(contactSearch.toLowerCase());
  });

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 h-screen w-64 border-r border-white/40 bg-white/70 backdrop-blur z-20">
        <div className="flex items-center gap-3 border-b border-white/40 p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-500 text-white font-semibold shadow">
            CM
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">CampusMaster</p>
            <p className="text-xs text-slate-500">Teacher workspace</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  isActive ? 'bg-purple-50 text-purple-600' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
                {item.href === '/teacher/notifications' && unreadCount > 0 && (
                  <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-4 right-4">
          <button
            onClick={logout}
            className="group flex w-full items-center gap-3 rounded-lg border border-transparent px-4 py-3 text-sm font-medium text-slate-700 transition-all hover:border-red-200 hover:bg-red-50 hover:font-bold hover:text-red-600"
          >
            <LogOut className="h-5 w-5 text-red-600 transition-colors" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="ml-64 flex flex-1 h-screen">
        {/* Conversations List */}
        <div className="w-80 border-r border-slate-200 bg-white flex flex-col">
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-lg font-bold text-slate-900">Messages</h1>
              <button
                onClick={loadContacts}
                className="rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 p-2 text-white shadow hover:shadow-lg transition"
                title="New message"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-sm text-slate-900 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-12 px-4">
                <MessageSquare className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No conversations yet</p>
                <button
                  onClick={loadContacts}
                  className="mt-3 text-sm font-semibold text-purple-600 hover:text-purple-700"
                >
                  Start a conversation
                </button>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const other = getOtherParticipant(conv);
                if (!other) return null;
                const isSelected = selectedConversation?.id === conv.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => loadMessages(conv)}
                    className={`w-full flex items-start gap-3 p-4 text-left transition hover:bg-slate-50 border-b border-slate-50 ${
                      isSelected ? 'bg-purple-50' : ''
                    }`}
                  >
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                      {other.userFirstName?.[0]}{other.userLastName?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {other.userFirstName} {other.userLastName}
                        </p>
                        <span className="text-xs text-slate-400 flex-shrink-0">
                          {formatDate(conv.lastMessageAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-xs text-slate-500 truncate">
                          {conv.lastMessage?.content || 'No messages yet'}
                        </p>
                        {conv.unreadCount && conv.unreadCount > 0 ? (
                          <span className="ml-2 inline-flex items-center justify-center h-5 min-w-[20px] rounded-full bg-purple-500 px-1.5 text-xs font-bold text-white flex-shrink-0">
                            {conv.unreadCount}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col bg-slate-50">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-200 bg-white flex items-center gap-3">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="lg:hidden rounded-lg p-1 hover:bg-slate-100 transition"
                >
                  <ArrowLeft className="h-5 w-5 text-slate-600" />
                </button>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-sm font-semibold">
                  {getOtherParticipant(selectedConversation)?.userFirstName?.[0]}
                  {getOtherParticipant(selectedConversation)?.userLastName?.[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {getOtherParticipant(selectedConversation)?.userFirstName}{' '}
                    {getOtherParticipant(selectedConversation)?.userLastName}
                  </p>
                  <p className="text-xs text-slate-500">Student</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messagesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">No messages yet. Say hello!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.sender.userEmail === user?.userEmail;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                            isMine
                              ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white'
                              : 'bg-white border border-slate-200 text-slate-900'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isMine ? 'text-purple-200' : 'text-slate-400'
                            }`}
                          >
                            {formatMessageTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-slate-200 bg-white">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (selectedConversation.id === -1) {
                          handleSendNewConversation();
                        } else {
                          handleSend();
                        }
                      }
                    }}
                  />
                  <button
                    onClick={selectedConversation.id === -1 ? handleSendNewConversation : handleSend}
                    disabled={sending || !messageText.trim()}
                    className="rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 p-2.5 text-white shadow hover:shadow-lg transition disabled:opacity-50"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-slate-200 mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-slate-700">Your Messages</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Select a conversation or start a new one
                </p>
                <button
                  onClick={loadContacts}
                  className="mt-4 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow hover:shadow-lg transition"
                >
                  New Message
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contacts Modal */}
      {showContacts && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[70vh] flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">New Message</h2>
              <button
                onClick={() => { setShowContacts(false); setContactSearch(''); }}
                className="rounded-lg p-1 hover:bg-slate-100 transition"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <div className="p-4 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                  placeholder="Search students..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-sm text-slate-900 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredContacts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-500">No contacts found</p>
                  <p className="text-xs text-slate-400 mt-1">
                    You can message students enrolled in your courses
                  </p>
                </div>
              ) : (
                filteredContacts.map((contact) => (
                  <button
                    key={contact.userEmail}
                    onClick={() => handleSendToContact(contact)}
                    className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 transition border-b border-slate-50"
                  >
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-sky-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                      {contact.userFirstName?.[0]}{contact.userLastName?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {contact.userFirstName} {contact.userLastName}
                      </p>
                      <p className="text-xs text-slate-500">Student</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 z-50 rounded-xl border border-red-100 bg-red-50 p-4 shadow-lg max-w-sm">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-red-800">{error}</p>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TeacherMessagesPage() {
  return (
    <ProtectedRoute requireTeacher>
      <TeacherMessagesContent />
    </ProtectedRoute>
  );
}
