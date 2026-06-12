import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Send, MessageSquare, Search, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

function formatTime(date) {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function initials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function ChatPage() {
  const { user, token } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const [typingName, setTypingName] = useState('');
  const [newRecipient, setNewRecipient] = useState('');
  const [showNew, setShowNew] = useState(false);
  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);

  const activeRef = useRef(null);

  // Sync active state to ref for use inside socket callbacks
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  // Connect socket
  useEffect(() => {
    const socket = io(SOCKET_URL, { auth: { token } });
    socketRef.current = socket;

    socket.on('connect_error', (err) => {
      console.error('Socket error:', err.message);
    });

    socket.on('newMessage', (msg) => {
      // Only append if it's for the currently active conversation
      if (activeRef.current?._id === msg.conversation) {
        setMessages(prev => [...prev, msg]);
        
        // Let the server know we read it implicitly if we are in the room, 
        // but for now we just keep the unread count at 0 locally.
        setConversations(prev => prev.map(c =>
          c._id === msg.conversation
            ? { ...c, lastMessage: msg.text, lastMessageAt: msg.createdAt, unreadCount: 0 }
            : c
        ));
      } else {
        // It's for a background conversation, increment unread count
        setConversations(prev => prev.map(c =>
          c._id === msg.conversation
            ? { ...c, lastMessage: msg.text, lastMessageAt: msg.createdAt, unreadCount: (c.unreadCount || 0) + 1 }
            : c
        ));
      }
    });

    socket.on('conversationUpdated', (data) => {
      setConversations(prev => prev.map(c =>
        c._id === data.conversationId
          ? { ...c, lastMessage: data.lastMessage, lastMessageAt: data.lastMessageAt, unreadCount: (c.unreadCount || 0) + 1 }
          : c
      ));
    });

    socket.on('userTyping', ({ name }) => {
      setTyping(true);
      setTypingName(name);
    });
    socket.on('userStoppedTyping', () => setTyping(false));

    return () => socket.disconnect();
  }, [token]);

  // Fetch conversations
  useEffect(() => {
    api.get('/chat/conversations').then(r => setConversations(r.data)).catch(console.error);
  }, []);

  // Load messages when conversation selected
  useEffect(() => {
    if (!active) return;
    api.get(`/chat/conversations/${active._id}/messages`)
      .then(r => {
        setMessages(r.data);
        // Clear unread count locally when opened
        setConversations(prev => prev.map(c => 
          c._id === active._id ? { ...c, unreadCount: 0 } : c
        ));
      })
      .catch(console.error);
    socketRef.current?.emit('joinConversation', active._id);
    setTyping(false);
  }, [active]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMsg = () => {
    if (!text.trim() || !active) return;
    socketRef.current?.emit('sendMessage', { conversationId: active._id, text: text.trim() });
    socketRef.current?.emit('stopTyping', { conversationId: active._id });
    setText('');
  };

  const handleTyping = (val) => {
    setText(val);
    if (!active) return;
    socketRef.current?.emit('typing', { conversationId: active._id });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socketRef.current?.emit('stopTyping', { conversationId: active._id });
    }, 1500);
  };

  const startConversation = async () => {
    if (!newRecipient.trim()) return;
    try {
      // Try to find user by email
      const { data: users } = await api.get(`/auth/me`);
      // We'll start convo by passing recipientId directly – prompt user for email
      toast.error('Enter the user ID from their profile. (Coming soon: user search)');
    } catch {
      toast.error('Could not start conversation');
    }
  };

  const other = (conv) => conv.participants?.find(p => p._id !== user.id && p._id !== user._id);

  return (
    <div className="chat-layout">
      {/* Sidebar */}
      <div className="chat-sidebar">
        <div className="chat-header-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Messages</span>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{conversations.length}</span>
        </div>

        {conversations.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            <MessageSquare size={32} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
            No conversations yet.<br />Apply to a job to connect with recruiters.
          </div>
        ) : (
          conversations.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)).map(conv => {
            const o = other(conv);
            return (
              <div key={conv._id}
                className={`conversation-item${active?._id === conv._id ? ' active' : ''}`}
                onClick={() => setActive(conv)}>
                <div className="conv-avatar">{initials(o?.name || '?')}</div>
                <div className="conv-info" style={{ flex: 1, minWidth: 0 }}>
                  <div className="conv-name" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o?.name || 'Unknown'}</span>
                    {conv.unreadCount > 0 && (
                      <span className="badge badge-brand" style={{ fontSize: '10px', padding: '2px 6px', marginLeft: '6px', minWidth: '18px', textAlign: 'center' }}>
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="conv-last" style={{ fontWeight: conv.unreadCount > 0 ? '700' : 'normal', color: conv.unreadCount > 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {conv.lastMessage || 'Start chatting…'}
                  </div>
                </div>
                <span className="badge badge-neutral" style={{ fontSize: '10px' }}>{o?.role}</span>
              </div>
            );
          })
        )}
      </div>

      {/* Main chat area */}
      <div className="chat-main">
        {!active ? (
          <div className="loading-screen">
            <MessageSquare size={48} style={{ opacity: 0.15 }} />
            <p style={{ color: 'var(--text-muted)' }}>Select a conversation to start chatting</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-surface)' }}>
              <div className="conv-avatar">{initials(other(active)?.name || '?')}</div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '15px' }}>{other(active)?.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{other(active)?.role}</div>
              </div>
            </div>

            {/* Messages */}
            <div className="messages-area">
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', margin: 'auto' }}>
                  No messages yet — say hello! 👋
                </div>
              )}
              {messages.map(msg => {
                const mine = msg.sender?._id === user.id || msg.sender?._id === user._id || msg.sender === user.id;
                return (
                  <div key={msg._id} style={{ display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start' }}>
                    {!mine && <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '3px', marginLeft: '4px' }}>{msg.sender?.name}</span>}
                    <div className={`message-bubble ${mine ? 'mine' : 'theirs'}`}>
                      {msg.text}
                      <div className="message-time">{formatTime(msg.createdAt)}</div>
                    </div>
                  </div>
                );
              })}
              {typing && (
                <div style={{ alignSelf: 'flex-start' }}>
                  <div className="message-bubble theirs" style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '10px 14px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{typingName} is typing</span>
                    <span style={{ display: 'flex', gap: '3px' }}>
                      {[0,1,2].map(i => <span key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--text-muted)', animation: `pulse 1.2s ${i*0.2}s infinite` }} />)}
                    </span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="chat-input-area">
              <input
                className="chat-input"
                placeholder="Type a message…"
                value={text}
                onChange={e => handleTyping(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMsg()}
              />
              <button className="btn btn-primary btn-icon" onClick={sendMsg} disabled={!text.trim()}>
                <Send size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
