import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../contexts/ToastContext";
import "../pages/NewsFeed.css";

export default function Messenger({ currentUserId, startChatWithUser }) {
    const navigate = useNavigate();
    const toast = useToast();
    const [conversations, setConversations] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [msgContent, setMsgContent] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const chatBodyRef = useRef(null);

    useEffect(() => {
        if (startChatWithUser) {
            setActiveChat(startChatWithUser);
        }
    }, [startChatWithUser]);

    const loadConversations = () => {
        if (currentUserId) {
            fetch(`/api/social/conversations`, { credentials: 'include' })
                .then(res => res.json())
                .then(data => {
                    if (data.success) setConversations(data.conversations);
                });
        }
    };

    useEffect(() => {
        loadConversations();
        const interval = setInterval(loadConversations, 10000);
        return () => clearInterval(interval);
    }, [currentUserId]);

    useEffect(() => {
        if (activeChat) {
            const targetId = activeChat.other_user?.id || activeChat.id;

            fetch(`/api/social/conversations/${targetId}`, { credentials: 'include' })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setMessages(data.messages);
                        setActiveChat(prev => ({
                            ...data.conversation,
                            other_user: data.conversation.other_user
                        }));
                    }
                });
        }
    }, [activeChat?.other_user?.id, activeChat?.id]);

    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = async () => {
        if (!msgContent.trim() || !activeChat) return;

        try {
            const res = await fetch(`/api/social/conversations/${activeChat.id}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ content: msgContent })
            });
            const data = await res.json();
            if (data.success) {
                setMessages([...messages, data.message]);
                setMsgContent("");
                loadConversations();
            } else {
                // Hiển thị lỗi nếu bị chặn
                if (data.code === 'MESSAGES_BLOCKED') {
                    toast.error(`🔒 ${data.error || 'Không thể gửi tin nhắn'}`);
                } else {
                    toast.error(`❌ ${data.error || 'Không thể gửi tin nhắn'}`);
                }
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
            const res = await fetch(`/api/social/users/search?q=${query}`, { credentials: 'include' });
            const data = await res.json();
            if (data.success) {
                setSearchResults(data.users);
            }
        } catch (err) {
            console.error("Search error:", err);
        }
    };

    const startNewChat = (user) => {
        setActiveChat({
            id: null, // Unknown conversation ID yet
            other_user: user
        });
        setShowSearch(false);
        setSearchQuery("");
    };

    return (
        <>
            {}
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

                {}
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
                            >
                                <div 
                                    className="conv-avatar"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (conv.other_user?.id) {
                                            navigate(`/profile/${conv.other_user.id}`);
                                        }
                                    }}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <img
                                        src={conv.other_user?.avatar || "https://via.placeholder.com/40"}
                                        alt="Avatar"
                                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                                    />
                                    <div className="online-status"></div>
                                </div>
                                <div 
                                    className="conv-info"
                                    style={{ flex: 1, cursor: 'pointer' }}
                                    onClick={() => setActiveChat(conv)}
                                >
                                    <h5 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (conv.other_user?.id) {
                                                navigate(`/profile/${conv.other_user.id}`);
                                            }
                                        }}
                                        style={{ cursor: 'pointer', marginBottom: '4px' }}
                                    >
                                        {conv.other_user?.name}
                                    </h5>
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

            {}
            {activeChat && (
                <div className="chat-window">
                    <div className="chat-header">
                        <div 
                            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flex: 1 }}
                            onClick={(e) => {
                                if (activeChat.other_user?.id) {
                                    navigate(`/profile/${activeChat.other_user.id}`);
                                }
                            }}
                        >
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
                        <span 
                            style={{ fontSize: '1.2rem', cursor: 'pointer' }}
                            onClick={() => setActiveChat(null)}
                        >
                            ✖
                        </span>
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
                                <div>{msg.content}</div>
                                {msg.shared_post && (
                                    <div style={{
                                        marginTop: '8px',
                                        border: '1px solid #e4e6eb',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        background: 'white',
                                        maxWidth: '300px'
                                    }}>
                                        <div style={{ padding: '12px', borderBottom: '1px solid #e4e6eb' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                                <img
                                                    src={msg.shared_post.user_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.shared_post.user_name)}`}
                                                    alt=""
                                                    style={{ width: '24px', height: '24px', borderRadius: '50%' }}
                                                />
                                                <span style={{ fontSize: '13px', fontWeight: '600' }}>
                                                    {msg.shared_post.user_name}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '14px', color: '#1c1e21' }}>
                                                {msg.shared_post.content}
                                            </div>
                                        </div>
                                        {msg.shared_post.image_url && (
                                            <img
                                                src={msg.shared_post.image_url}
                                                alt="Shared post"
                                                style={{ width: '100%', maxHeight: '200px', objectFit: 'cover' }}
                                            />
                                        )}
                                    </div>
                                )}
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
