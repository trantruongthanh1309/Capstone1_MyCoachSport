import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../pages/NewsFeed.css";
import { validateComment } from "../utils/validation";
import { useToast } from "../contexts/ToastContext";


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

export default function PostCard({ post, currentUserId, onStartChat, onShare }) {
    const navigate = useNavigate();
    const toast = useToast();
    const [isLiked, setIsLiked] = useState(post.is_liked);
    const [likesCount, setLikesCount] = useState(post.likes_count);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [commentContent, setCommentContent] = useState("");
    const [loadingComments, setLoadingComments] = useState(false);

    const sportIcon = SPORT_ICONS[post.sport] || "🏅";
    const topicLabel = TOPIC_LABELS[post.topic] || post.topic || "Chung";
    const topicColor = TOPIC_COLORS[post.topic] || "#64748b";

    const handleLike = async () => {
        const newLiked = !isLiked;
        setIsLiked(newLiked);
        setLikesCount(prev => newLiked ? prev + 1 : prev - 1);

        try {
            await fetch(`/api/social/posts/${post.id}/like`, {
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
            const res = await fetch(`/api/social/posts/${post.id}/comments`, {
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

        // Validate comment
        const commentValidation = validateComment(commentContent);
        if (!commentValidation.valid) {
            toast.error(`❌ ${commentValidation.message}`);
            return;
        }

        try {
            const res = await fetch(`/api/social/posts/${post.id}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ content: commentContent })
            });
            const data = await res.json();
            if (data.success) {
                setComments([data.comment, ...comments]);
                setCommentContent("");
                toast.success("✅ Đã thêm bình luận");
            } else {
                // Xử lý lỗi từ backend (bad words, etc.)
                if (data.code === 'BAD_WORDS') {
                    toast.error(`🚫 ${data.error || 'Bình luận chứa từ ngữ không phù hợp'}`);
                } else {
                    toast.error(`❌ ${data.error || 'Không thể thêm bình luận'}`);
                }
            }
        } catch (err) {
            console.error("Error posting comment:", err);
            toast.error("❌ Lỗi kết nối khi thêm bình luận");
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
                    onClick={(e) => {
                        e.stopPropagation();
                        if (post.user_id) {
                            navigate(`/profile/${post.user_id}`);
                        }
                    }}
                    style={{ cursor: 'pointer' }}
                />
                <div className="post-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <h4 
                            onClick={(e) => {
                                e.stopPropagation();
                                if (post.user_id) {
                                    navigate(`/profile/${post.user_id}`);
                                }
                            }}
                            style={{ cursor: 'pointer', margin: 0 }}
                        >
                            {post.user_name}
                        </h4>
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
                <button className="share-btn" onClick={() => onShare && onShare(post)}>
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
                                    style={{ width: 32, height: 32, cursor: 'pointer' }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (comment.user_id) {
                                            navigate(`/profile/${comment.user_id}`);
                                        }
                                    }}
                                />
                                <div className="comment-bubble">
                                    <div 
                                        className="comment-user"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (comment.user_id) {
                                                navigate(`/profile/${comment.user_id}`);
                                            }
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {comment.user_name}
                                    </div>
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
