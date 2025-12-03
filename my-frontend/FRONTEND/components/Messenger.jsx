import { useState, useEffect, useRef } from "react";
import "../pages/NewsFeed.css";
import config from "../config";

const API_BASE = config.API_BASE;

export default function Messenger({ currentUserId, startChatWithUser }) {
    const [conversations, setConversations] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [msgContent, setMsgContent] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const chatBodyRef = useRef(null);

    // Expose startChatWithUser to parent if needed, or handle internal prop change
    useEffect(() => {
        if (startChatWithUser) {
            setActiveChat(startChatWithUser);
        }
    }, [startChatWithUser]);

    // Load conversations
    const loadConversations = () => {
        if (currentUserId) {
            fetch(`${API_BASE}/api/social/conversations`, { credentials: 'include' })
                .then(res => res.json())
                .then(data => {
                    if (data.success) setConversations(data.conversations);
                });
        }
    };

    useEffect(() => {
        loadConversations();
        const interval = setInterval(loadConversations, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [currentUserId]);

    // Load messages when chat opens
    useEffect(() => {
        if (activeChat) {
            // If activeChat has an ID, use it. If it's a new user (from search), fetch by user ID
            const targetId = activeChat.other_user?.id || activeChat.id; // Handle both conversation obj and user obj

            fetch(`${API_BASE}/api/social/conversations/${targetId}`, { credentials: 'include' })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setMessages(data.messages);
                        // Ensure we have the full conversation object
                        setActiveChat(prev => ({
                            ...data.conversation,
                            other_user: data.conversation.other_user
                        }));
                    }
                });
        }
    }, [activeChat?.other_user?.id, activeChat?.id]); // Watch for ID changes

    // Auto scroll
    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = async () => {
        if (!msgContent.trim() || !activeChat) return;

        try {
            const res = await fetch(`${API_BASE}/api/social/conversations/${activeChat.id}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ content: msgContent })
            });
            const data = await res.json();
            if (data.success) {
                setMessages([...messages, data.message]);
                setMsgContent("");
                loadConversations(); // Refresh list to show latest msg
            }
        } catch (err) {
            console.error("Error sending message:", err);
        }
    };

    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/api/social/users/search?q=${query}`, { credentials: 'include' });
            const data = await res.json();
            if (data.success) {
                setSearchResults(data.users);
            }
        } catch (err) {
            console.error("Search error:", err);
        }
    };

    const startNewChat = (user) => {
        // Set active chat temporarily with user info, effect will fetch/create conversation
        setActiveChat({
            id: null, // Unknown conversation ID yet
            other_user: user
        });
        setShowSearch(false);
        setSearchQuery("");
    };

    return (
        <>
            {/* Sidebar List */}
            <div className="messenger-column">
                <div className="messenger-header">
                    <span>💬 Tin nhắn</span>
                    <button
                        className="new-chat-btn"
                        onClick={() => setShowSearch(true)}
                        title="Tìm người chat"
                    >
                        ➕
                    </button>
                </div>

                {/* Search Box */}
                {showSearch && (
                    <div className="messenger-search-box">
                        <div className="search-header">
                            <input
                                autoFocus
                                placeholder="Tìm tên (vd: Dũng)..."
                                value={searchQuery}
                                onChange={e => handleSearch(e.target.value)}
                            />
                            <button onClick={() => setShowSearch(false)}>✖</button>
                        </div>
                        <div className="search-results">
                            {searchResults.map(user => (
                                <div key={user.id} className="search-user-item" onClick={() => startNewChat(user)}>
                                    <img src={user.avatar || "https://via.placeholder.com/30"} alt="Avt" />
                                    <span>{user.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="conversation-list">
                    {conversations.length === 0 ? (
                        <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                            Chưa có tin nhắn nào.<br />Bấm ➕ để tìm bạn bè!
                        </div>
                    ) : (
                        conversations.map(conv => (
                            <div
                                key={conv.id}
                                className={`conversation-item ${activeChat?.id === conv.id ? 'active' : ''}`}
                                onClick={() => setActiveChat(conv)}
                            >
                                <div className="conv-avatar">
                                    <img
                                        src={conv.other_user?.avatar || "https://via.placeholder.com/40"}
                                        alt="Avatar"
                                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                                    />
                                    <div className="online-status"></div>
                                </div>
                                <div className="conv-info">
                                    <h5>{conv.other_user?.name}</h5>
                                    <div className="conv-last-msg">
                                        {conv.last_message?.sender_id === currentUserId ? "Bạn: " : ""}
                                        {conv.last_message?.content || "Bắt đầu trò chuyện"}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Window Overlay */}
            {activeChat && (
                <div className="chat-window">
                    <div className="chat-header" onClick={() => setActiveChat(null)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <img
                                src={activeChat.other_user?.avatar || "https://via.placeholder.com/30"}
                                alt="Avatar"
                                style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 'bold' }}>{activeChat.other_user?.name}</span>
                                <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>Đang hoạt động</span>
                            </div>
                        </div>
                        <span style={{ fontSize: '1.2rem' }}>✖</span>
                    </div>

                    <div className="chat-body" ref={chatBodyRef}>
                        {messages.length === 0 && (
                            <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: 20 }}>
                                Hãy nói "Xin chào" với {activeChat.other_user?.name}! 👋
                            </div>
                        )}
                        {messages.map(msg => (
                            <div
                                key={msg.id}
                                className={`chat-msg ${msg.sender_id === currentUserId ? 'me' : 'other'}`}
                            >
                                {msg.content}
                            </div>
                        ))}
                    </div>

                    <div className="chat-footer">
                        <input
                            className="chat-input-mini"
                            placeholder="Nhập tin nhắn..."
                            value={msgContent}
                            onChange={e => setMsgContent(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && sendMessage()}
                            autoFocus
                        />
                        <button
                            onClick={sendMessage}
                            style={{ background: 'var(--accent-color)', border: 'none', borderRadius: '50%', width: 35, height: 35, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            ➤
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
