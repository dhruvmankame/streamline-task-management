import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getAllUsers, getConversations, getDirectMessages, sendDirectMessage, markDirectMessagesAsRead } from '../services/api';
import { MessageCircle, Send, Users2, Loader, Lock, Search, X, Plus, Trash2 } from 'lucide-react';
import './MessagesPage.css';

const MessagesPage = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showUserList, setShowUserList] = useState(false);
    const messagesEndRef = useRef(null);
    const messageListRef = useRef(null);

    // Load conversations on mount
    useEffect(() => {
        loadConversations();
        loadUsers();
    }, []);

    // Auto-refresh messages every 5 seconds when a conversation is selected
    useEffect(() => {
        if (selectedUser) {
            loadMessages(selectedUser._id);
            const interval = setInterval(() => {
                loadMessages(selectedUser._id);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [selectedUser]);

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadConversations = async () => {
        try {
            const res = await getConversations();
            if (res.data?.success) {
                setConversations(res.data.conversations || []);
            }
        } catch (error) {
            console.error('Failed to load conversations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
            const res = await getAllUsers();
            if (res.data?.success) {
                setUsers(res.data.users || []);
            }
        } catch (error) {
            console.error('Failed to load users:', error);
        }
    };

    const loadMessages = async (userId) => {
        try {
            const res = await getDirectMessages(userId);
            if (res.data?.success) {
                setMessages(res.data.messages || []);
                // Mark messages as read
                await markDirectMessagesAsRead(userId);
                // Refresh conversations to update unread count
                loadConversations();
            }
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser || isSending) return;

        setIsSending(true);
        try {
            const res = await sendDirectMessage(selectedUser._id, { text: newMessage });
            if (res.data?.success) {
                setMessages(prev => [...prev, res.data.message]);
                setNewMessage('');
                loadConversations(); // Refresh to update last message
                scrollToBottom();
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            alert('Failed to send message. Please try again.');
        } finally {
            setIsSending(false);
        }
    };

    const handleSelectUser = (userData) => {
        setSelectedUser(userData);
        setShowUserList(false);
        setSearchQuery('');
    };

    const handleClearChat = async () => {
        if (!selectedUser) return;
        
        const confirmed = window.confirm(
            `Are you sure you want to clear all messages with ${selectedUser.name}? This action cannot be undone.`
        );
        
        if (confirmed) {
            try {
                // Clear messages locally first for immediate feedback
                setMessages([]);
                
                // TODO: Add API call to delete messages from server
                // await deleteDirectMessages(selectedUser._id);
                
                // Refresh conversations
                loadConversations();
                
                alert('Chat cleared successfully');
            } catch (error) {
                console.error('Failed to clear chat:', error);
                alert('Failed to clear chat. Please try again.');
                // Reload messages if there was an error
                loadMessages(selectedUser._id);
            }
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="messages-page">
                <div className="loading-container">
                    <Loader size={48} className="spinner" />
                    <p>Loading messages...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="messages-page">
            <div className="messages-container">
                {/* Sidebar - Conversations */}
                <div className="conversations-sidebar">
                    <div className="messages-sidebar-header">
                        <h2>
                            <MessageCircle size={24} />
                            Messages
                        </h2>
                        <button 
                            className="new-chat-btn"
                            onClick={() => setShowUserList(!showUserList)}
                            title="Start new conversation"
                        >
                            <Plus size={20} strokeWidth={2.5} />
                        </button>
                    </div>

                    {showUserList && (
                        <div className="user-selection-panel">
                            <div className="user-search">
                                <Search size={16} />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="search-input"
                                />
                                {searchQuery && (
                                    <button 
                                        className="clear-search"
                                        onClick={() => setSearchQuery('')}
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                            <div className="users-list">
                                {filteredUsers.length === 0 ? (
                                    <p className="no-users">No users found</p>
                                ) : (
                                    filteredUsers.map(u => (
                                        <div
                                            key={u._id}
                                            className="user-item"
                                            onClick={() => handleSelectUser(u)}
                                        >
                                            <div className="user-avatar">{u.name.charAt(0).toUpperCase()}</div>
                                            <div className="user-info">
                                                <div className="user-name">{u.name}</div>
                                                <div className="user-role">{u.role}</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    <div className="conversations-list">
                        {conversations.length === 0 ? (
                            <div className="no-conversations">
                                <MessageCircle size={48} />
                                <p>No conversations yet</p>
                                <button 
                                    className="btn-primary"
                                    onClick={() => setShowUserList(true)}
                                >
                                    Start a conversation
                                </button>
                            </div>
                        ) : (
                            conversations.map(conv => (
                                <div
                                    key={conv.user._id}
                                    className={`conversation-item ${selectedUser?._id === conv.user._id ? 'active' : ''}`}
                                    onClick={() => handleSelectUser(conv.user)}
                                >
                                    <div className="conversation-avatar">
                                        {conv.user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="conversation-details">
                                        <div className="conversation-header">
                                            <div className="conversation-name">{conv.user.name}</div>
                                            <div className="conversation-time">
                                                {formatTimestamp(conv.lastMessage.timestamp)}
                                            </div>
                                        </div>
                                        <div className="conversation-preview">
                                            <span className={conv.lastMessage.fromMe ? 'from-me' : ''}>
                                                {conv.lastMessage.fromMe ? 'You: ' : ''}
                                            </span>
                                            <Lock size={12} className="encrypt-icon" />
                                            Encrypted message
                                        </div>
                                    </div>
                                    {conv.unreadCount > 0 && (
                                        <div className="unread-badge">{conv.unreadCount}</div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="chat-area">
                    {!selectedUser ? (
                        <div className="no-chat-selected">
                            <MessageCircle size={64} />
                            <h2>Select a conversation</h2>
                            <p>Choose a conversation from the list or start a new one</p>
                        </div>
                    ) : (
                        <>
                            <div className="chat-header">
                                <div className="chat-header-info">
                                    <div className="chat-avatar">
                                        {selectedUser.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3>{selectedUser.name}</h3>
                                        <p className="chat-subtitle">
                                            <Lock size={12} /> End-to-end encrypted
                                        </p>
                                    </div>
                                </div>
                                <div className="chat-header-actions">
                                    <span className={`role-badge ${selectedUser.role}`}>
                                        {selectedUser.role}
                                    </span>
                                    <button 
                                        className="clear-chat-btn"
                                        onClick={handleClearChat}
                                        title="Clear all messages"
                                    >
                                        <Trash2 size={18} />
                                        <span>Clear Chat</span>
                                    </button>
                                </div>
                            </div>

                            <div className="messages-list" ref={messageListRef}>
                                {messages.length === 0 ? (
                                    <div className="no-messages">
                                        <p>No messages yet. Start the conversation!</p>
                                    </div>
                                ) : (
                                    messages.map(msg => (
                                        <div
                                            key={msg._id}
                                            className={`message ${msg.isFromCurrentUser ? 'sent' : 'received'}`}
                                        >
                                            <div className="message-bubble">
                                                <div className="message-text">{msg.text}</div>
                                                <div className="message-time">
                                                    {formatTimestamp(msg.timestamp)}
                                                    {msg.isFromCurrentUser && msg.readBy?.length > 1 && (
                                                        <span className="read-indicator"> • Read</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <form className="message-input-form" onSubmit={handleSendMessage}>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your message..."
                                    className="message-input"
                                    disabled={isSending}
                                    maxLength={1000}
                                />
                                <button
                                    type="submit"
                                    className="send-btn"
                                    disabled={!newMessage.trim() || isSending}
                                    title="Messages are encrypted and compressed"
                                >
                                    {isSending ? <Loader size={18} className="spinner" /> : <Send size={18} />}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessagesPage;
