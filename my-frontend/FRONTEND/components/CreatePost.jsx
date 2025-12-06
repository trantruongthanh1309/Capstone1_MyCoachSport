import { useState } from "react";
import "../pages/NewsFeed.css";

import config from "../config";

const API_BASE = config.API_BASE;

const TOPICS = [
    { id: "Workout", label: "💪 Tập luyện", color: "#ef4444" },
    { id: "Nutrition", label: "🥗 Dinh dưỡng", color: "#10b981" },
    { id: "Progress", label: "📈 Tiến bộ", color: "#3b82f6" },
    { id: "Question", label: "❓ Hỏi đáp", color: "#f59e0b" },
    { id: "Motivation", label: "🔥 Động lực", color: "#8b5cf6" }
];

const SPORTS = [
    { id: "Gym", label: "🏋️ Gym/Thể hình" },
    { id: "Yoga", label: "🧘 Yoga" },
    { id: "Running", label: "🏃 Chạy bộ" },
    { id: "Football", label: "⚽ Bóng đá" },
    { id: "Basketball", label: "🏀 Bóng rổ" },
    { id: "Other", label: "🎯 Khác" }
];

export default function CreatePost({ onPostCreated, userAvatar }) {
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [selectedTopic, setSelectedTopic] = useState(TOPICS[0]);
    const [selectedSport, setSelectedSport] = useState(SPORTS[0]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!content.trim()) {
            alert("Vui lòng nhập nội dung bài viết trước khi đăng.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/social/posts`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    // Tiêu đề có thể rỗng, backend xử lý mặc định nếu cần
                    title: title.trim() || null,
                    content,
                    image_url: imageUrl,
                    topic: selectedTopic.id,
                    sport: selectedSport.id
                })
            });

            const data = await res.json();
            console.log("📝 Post creation response:", data);

            if (res.ok && data.success) {
                alert("✅ Bài viết đã được gửi! Admin sẽ duyệt trong thời gian sớm nhất.");
                // ONLY add to UI if backend confirms success
                if (data.post) {
                    onPostCreated(data.post);
                }
                setIsOpen(false);
                resetForm();
            } else {
                alert(`❌ Lỗi: ${data.message || 'Không thể đăng bài. Vui lòng thử lại.'}`);
            }
        } catch (err) {
            console.error("❌ Error creating post:", err);
            alert("❌ Lỗi kết nối! Vui lòng kiểm tra internet và thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setTitle("");
        setContent("");
        setImageUrl("");
        setSelectedTopic(TOPICS[0]);
        setSelectedSport(SPORTS[0]);
    };

    return (
        <>
            <div className="create-post-box">
                <div className="create-post-header">
                    <img
                        src={userAvatar || "https://via.placeholder.com/40"}
                        alt="Avatar"
                        className="user-avatar"
                    />
                    <div className="post-input" onClick={() => setIsOpen(true)}>
                        Chia sẻ hành trình tập luyện của bạn...
                    </div>
                </div>
                <div className="create-post-actions">
                    <button className="action-btn" onClick={() => setIsOpen(true)}>
                        📷 Ảnh/Video
                    </button>
                    <button className="action-btn" onClick={() => setIsOpen(true)}>
                        💪 Check-in
                    </button>
                </div>
            </div>

            {isOpen && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Tạo bài viết mới</h3>
                            <button className="close-modal" onClick={() => setIsOpen(false)}>✖</button>
                        </div>
                        <div className="modal-body">

                            {/* Sport Selector */}
                            <div style={{ marginBottom: 15 }}>
                                <label style={{ display: 'block', marginBottom: 5, fontSize: '0.9rem', color: '#94a3b8' }}>Môn thể thao:</label>
                                <div className="topic-selector">
                                    {SPORTS.map(sport => (
                                        <div
                                            key={sport.id}
                                            className={`topic-tag ${selectedSport.id === sport.id ? 'selected' : ''}`}
                                            onClick={() => setSelectedSport(sport)}
                                        >
                                            {sport.label}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Topic Selector */}
                            <div style={{ marginBottom: 15 }}>
                                <label style={{ display: 'block', marginBottom: 5, fontSize: '0.9rem', color: '#94a3b8' }}>Chủ đề:</label>
                                <div className="topic-selector">
                                    {TOPICS.map(topic => (
                                        <div
                                            key={topic.id}
                                            className={`topic-tag ${selectedTopic.id === topic.id ? 'selected' : ''}`}
                                            onClick={() => setSelectedTopic(topic)}
                                        >
                                            {topic.label}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Title Input */}
                            <input
                                className="create-post-title"
                                placeholder="Tiêu đề bài viết (ngắn gọn, súc tích)..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />

                            {/* Content Input */}
                            <textarea
                                className="create-post-textarea"
                                placeholder={`Nội dung chi tiết về ${selectedTopic.label.toLowerCase()}...`}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />

                            <input
                                type="text"
                                placeholder="Dán link ảnh vào đây (URL)..."
                                className="comment-input"
                                style={{ width: '100%', marginBottom: 15, borderRadius: 8 }}
                                value={imageUrl}
                                onChange={e => setImageUrl(e.target.value)}
                            />

                            {imageUrl && (
                                <img src={imageUrl} alt="Preview" className="image-preview" onError={() => setImageUrl('')} />
                            )}

                            <button
                                className="post-submit-btn"
                                onClick={handleSubmit}
                                disabled={!content.trim() || loading}
                                style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' }}
                            >
                                {loading ? "Đang đăng..." : "Đăng bài ngay 🚀"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
