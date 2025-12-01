import { useState } from "react";
import "../pages/NewsFeed.css";

const API_BASE = "http://localhost:5000";

const SPORT_ICONS = {
    "Gym": "🏋️",
    "Yoga": "🧘",
    "Running": "🏃",
    "Football": "⚽",
    "Basketball": "🏀",
    "Other": "🎯"
};

const TOPIC_COLORS = {
    "Workout": "#ef4444",
    "Nutrition": "#10b981",
    "Progress": "#3b82f6",
    "Question": "#f59e0b",
    "Motivation": "#8b5cf6"
};

const TOPIC_LABELS = {
    "Workout": "Tập luyện",
    "Nutrition": "Dinh dưỡng",
    "Progress": "Tiến bộ",
    "Question": "Hỏi đáp",
    "Motivation": "Động lực"
};

export default function PostCard({ post, currentUserId, onStartChat }) {
    const [isLiked, setIsLiked] = useState(post.is_liked);
    const [likesCount, setLikesCount] = useState(post.likes_count);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [commentContent, setCommentContent] = useState("");
    const [loadingComments, setLoadingComments] = useState(false);

    // Fallback for old posts without new fields
    const sportIcon = SPORT_ICONS[post.sport] || "🏅";
    const topicLabel = TOPIC_LABELS[post.topic] || post.topic || "Chung";
    const topicColor = TOPIC_COLORS[post.topic] || "#64748b";

    const handleLike = async () => {
        const newLiked = !isLiked;
        setIsLiked(newLiked);
        setLikesCount(prev => newLiked ? prev + 1 : prev - 1);

        try {
            await fetch(`${API_BASE}/api/social/posts/${post.id}/like`, {
                method: "POST",
                credentials: "include"
            });
        } catch (err) {
            setIsLiked(!newLiked);
            setLikesCount(prev => !newLiked ? prev + 1 : prev - 1);
        }
    };

    const loadComments = async () => {
        if (showComments) {
            setShowComments(false);
            return;
        }

        setLoadingComments(true);
        setShowComments(true);
        try {
            const res = await fetch(`${API_BASE}/api/social/posts/${post.id}/comments`, {
                credentials: "include"
            });
            const data = await res.json();
            if (data.success) {
                setComments(data.comments);
            }
        } catch (err) {
            console.error("Error loading comments:", err);
        } finally {
            setLoadingComments(false);
        }
    };

    const submitComment = async () => {
        if (!commentContent.trim()) return;

        try {
            const res = await fetch(`${API_BASE}/api/social/posts/${post.id}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ content: commentContent })
            });
            const data = await res.json();
            if (data.success) {
                setComments([data.comment, ...comments]);
                setCommentContent("");
            }
        } catch (err) {
            console.error("Error posting comment:", err);
        }
    };

    const handleMessageClick = () => {
        if (onStartChat) {
            onStartChat({
                id: post.user_id,
                name: post.user_name,
                avatar: post.user_avatar
            });
        }
    };

    return (
        <div className="post-card">
            <div className="post-header">
                <img
                    src={post.user_avatar || "https://via.placeholder.com/45"}
                    alt="Avatar"
                    className="user-avatar"
                />
                <div className="post-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <h4>{post.user_name}</h4>
                        {post.user_id !== currentUserId && (
                            <button
                                className="msg-icon-btn"
                                onClick={handleMessageClick}
                                title={`Nhắn tin với ${post.user_name}`}
                            >
                                💬
                            </button>
                        )}
                    </div>
                    <span className="post-time">
                        {new Date(post.created_at).toLocaleString('vi-VN', {
                            hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit'
                        })}
                    </span>
                </div>

                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
                    {post.sport && (
                        <span style={{ fontSize: '1.2rem', title: post.sport }}>{sportIcon}</span>
                    )}
                    <div
                        className="post-topic"
                        style={{ background: topicColor, boxShadow: `0 2px 10px ${topicColor}66` }}
                    >
                        {topicLabel}
                    </div>
                </div>
            </div>

            <div className="post-content-wrapper" style={{ padding: '0 20px 15px' }}>
                {post.title && (
                    <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-primary)', fontSize: '1.2rem' }}>
                        {post.title}
                    </h3>
                )}
                <div className="post-content" style={{ padding: 0 }}>
                    {post.content}
                </div>
            </div>

            {post.image_url && (
                <img src={post.image_url} alt="Post content" className="post-image" />
            )}

            <div className="post-stats">
                <span>❤️ {likesCount} lượt thích</span>
                <span>💬 {comments.length || post.comments_count} bình luận</span>
            </div>

            <div className="post-actions">
                <button
                    className={`like-btn ${isLiked ? 'liked' : ''}`}
                    onClick={handleLike}
                >
                    {isLiked ? '❤️ Đã thích' : '🤍 Thích'}
                </button>
                <button className="comment-btn" onClick={loadComments}>
                    💬 Bình luận
                </button>
                <button className="share-btn">
                    🔗 Chia sẻ
                </button>
            </div>

            {showComments && (
                <div className="comments-section">
                    <div className="comment-input-box">
                        <input
                            className="comment-input"
                            placeholder="Viết bình luận..."
                            value={commentContent}
                            onChange={e => setCommentContent(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && submitComment()}
                        />
                        <button
                            onClick={submitComment}
                            disabled={!commentContent.trim()}
                            style={{
                                background: 'var(--accent-color)',
                                border: 'none',
                                borderRadius: '50%',
                                width: 40,
                                height: 40,
                                color: 'white',
                                cursor: 'pointer',
                                opacity: commentContent.trim() ? 1 : 0.5
                            }}
                        >
                            ➤
                        </button>
                    </div>

                    {loadingComments ? (
                        <div style={{ textAlign: 'center', padding: 10, color: '#94a3b8' }}>Đang tải...</div>
                    ) : (
                        comments.map(comment => (
                            <div key={comment.id} className="comment-item">
                                <img
                                    src={comment.user_avatar || "https://via.placeholder.com/32"}
                                    alt="Avatar"
                                    className="user-avatar"
                                    style={{ width: 32, height: 32 }}
                                />
                                <div className="comment-bubble">
                                    <div className="comment-user">{comment.user_name}</div>
                                    <div className="comment-text">{comment.content}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
