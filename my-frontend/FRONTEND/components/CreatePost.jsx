import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import "../pages/NewsFeed.css";
import ImageUploader from "./ImageUploader";

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
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const handleSubmit = async () => {
        if (!content.trim()) {
            showToast("Vui lòng nhập nội dung bài viết trước khi đăng.", "error");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/social/posts`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
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
                showToast("✅ Bài viết đã được gửi! Admin sẽ duyệt sớm.", "success");
                if (data.post) {
                    onPostCreated(data.post);
                }
                setIsOpen(false);
                resetForm();
            } else {
                showToast(`❌ Lỗi: ${data.message || 'Không thể đăng bài.'}`, "error");
            }
        } catch (err) {
            console.error("❌ Error creating post:", err);
            showToast("❌ Lỗi kết nối! Vui lòng thử lại.", "error");
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

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(`${API_BASE}/api/upload`, {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            if (data.url) {
                setImageUrl(data.url);
            } else {
                alert("Upload thất bại: " + (data.error || "Lỗi không xác định"));
            }
        } catch (err) {
            console.error("Upload error:", err);
            alert("Lỗi kết nối khi upload ảnh.");
        } finally {
            setLoading(false);
        }
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

            {isOpen && createPortal(
                <div className="create-post-modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}>
                    <div className="create-post-modal-content">
                        <div className="create-post-modal-header">
                            <h3>Tạo bài viết mới</h3>
                            <button className="close-modal" onClick={() => setIsOpen(false)}>✖</button>
                        </div>
                        <div className="create-post-modal-body">

                            { }
                            <div style={{ marginBottom: 15 }}>
                                <label style={{ display: 'block', marginBottom: 5, fontSize: '0.9rem', color: '#1e293b', fontWeight: 'bold' }}>Môn thể thao:</label>
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

                            { }
                            <div style={{ marginBottom: 15 }}>
                                <label style={{ display: 'block', marginBottom: 5, fontSize: '0.9rem', color: '#1e293b', fontWeight: 'bold' }}>Chủ đề:</label>
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

                            { }
                            <input
                                className="create-post-title"
                                placeholder="Tiêu đề bài viết (ngắn gọn, súc tích)..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />

                            { }
                            <textarea
                                className="create-post-textarea"
                                placeholder={`Nội dung chi tiết về ${selectedTopic.label.toLowerCase()}...`}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />

                            <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: '#1e293b', fontWeight: 'bold' }}>Hình ảnh (Tùy chọn):</label>
                            <div style={{ marginBottom: 15 }}>
                                <label htmlFor="file-upload" className="custom-file-upload" style={{
                                    display: 'inline-block',
                                    padding: '10px 20px',
                                    cursor: 'pointer',
                                    background: '#e2e8f0',
                                    color: '#333',
                                    borderRadius: '12px',
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                    border: '1px solid #cbd5e1',
                                    transition: 'all 0.2s'
                                }}>
                                    📷 Chọn ảnh từ máy
                                </label>
                                <input
                                    id="file-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    style={{ display: 'none' }}
                                />
                                {loading && <span style={{ marginLeft: 10, color: '#666' }}>Đang tải lên...</span>}
                            </div>

                            {imageUrl && (
                                <div style={{ position: 'relative', marginBottom: 15, textAlign: 'center' }}>
                                    <img src={imageUrl} alt="Preview" className="image-preview" onError={() => setImageUrl('')} style={{ width: 'auto', maxWidth: '100%', borderRadius: '8px', maxHeight: '180px', objectFit: 'contain', border: '1px solid #e2e8f0' }} />
                                    <button
                                        onClick={() => setImageUrl('')}
                                        style={{
                                            position: 'absolute', top: -10, right: -10, background: '#ef4444',
                                            color: 'white', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>
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
                </div>,
                document.body
            )}
            {toast && createPortal(
                <div className={`custom-toast ${toast.type}`}>
                    {toast.type === 'success' ? '🎉' : '⚠️'} {toast.message}
                </div>,
                document.body
            )}
        </>
    );
}
