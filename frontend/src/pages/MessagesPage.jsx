import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  MessageSquare,
  Send,
  Loader2,
  ExternalLink,
  MapPin,
  Clock,
  User,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export const MessagesPage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedConversationId = searchParams.get('conversationId');

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);
  const pollingRef = useRef(null);

  // Fetch list of conversations
  const fetchConversations = async () => {
    try {
      const { data } = await api.get('/conversations');
      if (data?.success) {
        setConversations(data.conversations || []);
        
        // Auto-select first conversation if none selected in URL and list is not empty
        if (!selectedConversationId && data.conversations.length > 0) {
          setSearchParams({ conversationId: data.conversations[0]._id });
        }
      }
    } catch (err) {
      console.error('Fetch conversations error:', err);
    } finally {
      setLoadingConversations(false);
    }
  };

  // Fetch messages for active conversation
  const fetchMessages = async (convId, isBackground = false) => {
    if (!convId) return;
    if (!isBackground) setLoadingMessages(true);
    try {
      const { data } = await api.get(`/conversations/${convId}/messages`);
      if (data?.success) {
        setActiveConversation(data.conversation);
        setMessages(data.messages || []);
      }
    } catch (err) {
      if (!isBackground) toast.error('Could not load chat messages');
    } finally {
      if (!isBackground) setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages(selectedConversationId);

      // Setup 4-second polling for live student chat
      if (pollingRef.current) clearInterval(pollingRef.current);
      pollingRef.current = setInterval(() => {
        fetchMessages(selectedConversationId, true);
      }, 4000);

      return () => {
        if (pollingRef.current) clearInterval(pollingRef.current);
      };
    }
  }, [selectedConversationId]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedConversationId || sending) return;

    setSending(true);
    const msgText = inputText.trim();
    setInputText('');

    try {
      const { data } = await api.post(`/conversations/${selectedConversationId}/messages`, {
        text: msgText,
      });

      if (data?.success && data?.message) {
        setMessages((prev) => [...prev, data.message]);
        // Update local conversation lastMessage snippet
        setConversations((prev) =>
          prev.map((c) =>
            c._id === selectedConversationId
              ? { ...c, lastMessage: { text: msgText, createdAt: new Date() } }
              : c
          )
        );
      }
    } catch (err) {
      toast.error('Failed to send message');
      setInputText(msgText);
    } finally {
      setSending(false);
    }
  };

  // Helper to find the other participant
  const getOtherParticipant = (conv) => {
    return conv?.participants?.find((p) => p._id !== user?.id) || conv?.participants?.[0];
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-[78vh] flex flex-col md:flex-row">
          
          {/* Left Column: Conversations Sidebar (w-full md:w-80 lg:w-96) */}
          <div className={`w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col ${selectedConversationId ? 'hidden md:flex' : 'flex'}`}>
            
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">Campus Chats</h2>
              </div>
              <span className="text-xs text-slate-400 font-semibold">
                {conversations.length} active
              </span>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {loadingConversations ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Loading chats...</p>
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">No conversations yet</p>
                  <p className="text-[11px] text-slate-400">
                    Find an item on the marketplace and tap "Contact Seller" to start a chat!
                  </p>
                </div>
              ) : (
                conversations.map((conv) => {
                  const other = getOtherParticipant(conv);
                  const isSelected = conv._id === selectedConversationId;

                  return (
                    <button
                      key={conv._id}
                      onClick={() => setSearchParams({ conversationId: conv._id })}
                      className={`w-full p-4 text-left flex items-start gap-3 transition-colors ${
                        isSelected ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {other?.profileImage ? (
                          <img src={other.profileImage} alt={other.name} className="w-full h-full object-cover" />
                        ) : (
                          other?.name?.charAt(0).toUpperCase() || 'U'
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between mb-0.5">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {other?.name || 'Student'}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            {conv.lastMessage?.createdAt
                              ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : ''}
                          </span>
                        </div>

                        <p className="text-[11px] font-semibold text-indigo-600 truncate mb-1">
                          {conv.listingId?.title || 'Campus Item'}
                        </p>

                        <p className="text-[11px] text-slate-500 truncate">
                          {conv.lastMessage?.text || 'Started a conversation.'}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

          </div>

          {/* Right Column: Chat Window */}
          <div className={`flex-1 flex flex-col ${!selectedConversationId ? 'hidden md:flex' : 'flex'}`}>
            
            {selectedConversationId && activeConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSearchParams({})}
                      className="md:hidden text-xs font-bold text-indigo-600 mr-1"
                    >
                      ← Back
                    </button>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {getOtherParticipant(activeConversation)?.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {getOtherParticipant(activeConversation)?.college} • {getOtherParticipant(activeConversation)?.department}
                      </p>
                    </div>
                  </div>

                  {/* Linked Listing Pill */}
                  {activeConversation.listingId && (
                    <Link
                      to={`/listing/${activeConversation.listingId._id}`}
                      className="flex items-center gap-2 p-1.5 pr-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors max-w-xs truncate"
                      title="View listing details"
                    >
                      <img
                        src={activeConversation.listingId.images?.[0] || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100'}
                        alt="thumb"
                        className="w-7 h-7 rounded-lg object-cover"
                      />
                      <div className="truncate text-left">
                        <p className="text-[11px] font-bold text-slate-800 truncate">
                          {activeConversation.listingId.title}
                        </p>
                        <p className="text-[10px] text-indigo-600 font-extrabold">
                          ₹{activeConversation.listingId.price}
                        </p>
                      </div>
                    </Link>
                  )}
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-slate-50/50">
                  {loadingMessages ? (
                    <div className="py-20 text-center">
                      <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mx-auto mb-2" />
                      <p className="text-xs text-slate-400">Loading conversation history...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="py-20 text-center text-xs text-slate-400">
                      No messages yet. Send a greeting to discuss pickup time & place!
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = (msg.senderId?._id || msg.senderId) === user?.id;

                      return (
                        <div
                          key={msg._id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-md px-4 py-2.5 rounded-2xl text-xs sm:text-sm shadow-sm ${
                              isMe
                                ? 'bg-indigo-600 text-white rounded-br-xs'
                                : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                            }`}
                          >
                            <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1 px-1">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Send Message Input */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type your message (e.g. Can we meet near hostel at 5 PM?)..."
                    className="flex-1 px-4 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || sending}
                    className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-colors disabled:opacity-40"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Select a Conversation</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Choose a chat from the left panel to coordinate campus pickup, bargain politely, or ask product questions.
                </p>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};

