import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './NewsFeed.css';

const NewsFeed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newPostContent, setNewPostContent] = useState('');
    const [isPosting, setIsPosting] = useState(false);

    // Cấu hình User hiện tại (Giả lập hiển thị, ID lấy từ backend session)
    const currentUser = {
        name: "Bạn",
        avatar: "https://ui-avatars.com/api/?name=You&background=1877F2&color=fff"
    };

    // API Base URL
    const API_URL = "http://localhost:5000/api/newsfeed";

    // Fetch posts
    const fetchPosts = async () => {
        try {
            setError(null);
            const response = await axios.get(API_URL, { withCredentials: true });
            if (response.data.success) {
                setPosts(response.data.data);
            } else {
                setError("Không tải được bài viết: " + response.data.error);
            }
        } catch (err) {
            console.error("Fetch Error:", err);
            setError("Lỗi kết nối Server! Hãy kiểm tra xem Backend có đang chạy không.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    // Handle Create Post
    const handlePostSubmit = async () => {
        if (!newPostContent.trim()) return;

        setIsPosting(true);
        try {
            const response = await axios.post(`${API_URL}/create`, {
                content: newPostContent,
                image: null
            }, { withCredentials: true });

            if (response.data.success) {
                setNewPostContent('');
                fetchPosts(); // Reload list
            } else {
                alert("Lỗi: " + response.data.error);
            }
        } catch (err) {
            alert('Lỗi kết nối khi đăng bài!');
        } finally {
            setIsPosting(false);
        }
    };

    // Handle Like
    const handleLike = async (postId) => {
        // Optimistic UI Update
        setPosts(posts.map(post =>
            post.id === postId ? { ...post, likes: post.likes + 1, isLiked: true } : post
        ));

        try {
            await axios.post(`${API_URL}/like`, { post_id: postId }, { withCredentials: true });
        } catch (err) {
            console.error("Like Error:", err);
        }
    };

    if (loading) return <div className="newsfeed-loading">Đang tải bảng tin...</div>;

    return (
        <div className="newsfeed-container">
            {error && (
                <div className="error-banner">
                    ⚠️ {error}
                    <button onClick={fetchPosts}>Thử lại</button>
                </div>
            )}

            <div className="newsfeed-layout">

                {/* LEFT SIDEBAR */}
                <div className="sidebar-left">
                    <div className="menu-item active">
                        <div className="menu-icon">🏠</div>
                        <span>Trang chủ</span>
                    </div>
                    <div className="menu-item">
                        <div className="menu-icon">👥</div>
                        <span>Bạn bè</span>
                    </div>
                    <div className="menu-item">
                        <div className="menu-icon">💪</div>
                        <span>Nhóm tập luyện</span>
                    </div>
                </div>

                {/* MAIN FEED */}
                <div className="feed-center">

                    {/* Create Post Box */}
                    <div className="create-post-box">
                        <div className="input-section">
                            <img src={currentUser.avatar} alt="User" className="user-avatar" />
                            <input
                                type="text"
                                className="post-input"
                                placeholder="Bạn đang nghĩ gì?"
                                value={newPostContent}
                                onChange={(e) => setNewPostContent(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handlePostSubmit()}
                                disabled={isPosting}
                            />
                        </div>
                        <div className="actions-section">
                            <button className="action-btn">📷 Ảnh/Video</button>
                            <button className="action-btn">😊 Cảm xúc</button>
                            <button
                                className="post-btn-primary"
                                onClick={handlePostSubmit}
                                disabled={isPosting || !newPostContent.trim()}
                            >
                                {isPosting ? 'Đang đăng...' : 'Đăng'}
                            </button>
                        </div>
                    </div>

                    {/* Posts List */}
                    {posts.length === 0 && !error && (
                        <div className="empty-state">Chưa có bài viết nào. Hãy là người đầu tiên!</div>
                    )}

                    {posts.map(post => (
                        <div key={post.id} className="post-card">
                            <div className="post-header">
                                <div className="post-author-info">
                                    <img src={post.author.avatar} alt={post.author.name} className="user-avatar" />
                                    <div>
                                        <h4 className="author-name">{post.author.name}</h4>
                                        <span className="post-time">{post.createdAt}</span>
                                    </div>
                                </div>
                                <button className="post-menu-btn">...</button>
                            </div>

                            <div className="post-content-text">
                                {post.content}
                            </div>

                            {post.image && (
                                <div className="post-image-container">
                                    <img src={post.image} alt="Post content" className="post-image" />
                                </div>
                            )}

                            <div className="post-stats">
                                <div className="like-count">
                                    <span className="like-icon-circle">👍</span>
                                    <span>{post.likes}</span>
                                </div>
                                <div className="comment-count">
                                    {post.comments} bình luận
                                </div>
                            </div>

                            <div className="post-actions-bar">
                                <button
                                    className={`interact-btn ${post.isLiked ? 'active' : ''}`}
                                    onClick={() => handleLike(post.id)}
                                >
                                    👍 Thích
                                </button>
                                <button className="interact-btn">💬 Bình luận</button>
                                <button className="interact-btn">↗️ Chia sẻ</button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* RIGHT SIDEBAR */}
                <div className="sidebar-right">
                    <div className="widget-card">
                        <div className="widget-header">Người liên hệ</div>
                        {['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C'].map((name, idx) => (
                            <div key={idx} className="contact-item">
                                <div className="contact-avatar-wrapper">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${name}&background=random`}
                                        alt={name}
                                        className="user-avatar"
                                    />
                                    <div className="online-dot"></div>
                                </div>
                                <span className="contact-name">{name}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default NewsFeed;
