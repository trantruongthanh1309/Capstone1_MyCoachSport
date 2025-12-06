import { useState, useEffect } from "react";
import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";
import Messenger from "../components/Messenger";
import "./NewsFeed.css";

import config from "../config";

const API_BASE = config.API_BASE;

const SPORTS_FILTER = [
    { id: "All", label: "🌐 Tất cả" },
    { id: "Gym", label: "🏋️ Gym" },
    { id: "Yoga", label: "🧘 Yoga" },
    { id: "Running", label: "🏃 Chạy bộ" },
    { id: "Football", label: "⚽ Bóng đá" },
    { id: "Basketball", label: "🏀 Bóng rổ" }
];

export default function NewsFeed() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [chatTarget, setChatTarget] = useState(null);
    const [selectedSport, setSelectedSport] = useState("All");

    useEffect(() => {
        fetch(`${API_BASE}/api/auth/me`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setCurrentUser(data);
                }
            });
    }, []);

    useEffect(() => {
        setPosts([]);
        setPage(1);
        setHasMore(true);
        setLoading(true);
        loadPosts(1, selectedSport);
    }, [selectedSport]);

    const loadPosts = async (pageNum, sport) => {
        try {
            const res = await fetch(`${API_BASE}/api/social/posts?page=${pageNum}&sport=${sport}`, {
                credentials: "include"
            });
            const data = await res.json();

            if (data.success) {
                setPosts(prev => pageNum === 1 ? data.posts : [...prev, ...data.posts]);
                setHasMore(data.current_page < data.pages);
            }
        } catch (err) {
            console.error("Error loading posts:", err);
        } finally {
            setLoading(false);
        }
    };

    const handlePostCreated = (newPost) => {
        // Nếu đang xem "Tất cả" hoặc đúng môn thể thao vừa đăng thì thêm vào đầu
        if (selectedSport === "All" || selectedSport === newPost.sport) {
            setPosts([newPost, ...posts]);
        }
    };

    const handleScroll = () => {
        // Improved scroll detection
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
        const clientHeight = document.documentElement.clientHeight || window.innerHeight;

        if (scrollTop + clientHeight >= scrollHeight - 50 && hasMore && !loading) {
            const nextPage = page + 1;
            setPage(nextPage);
            loadPosts(nextPage, selectedSport);
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [hasMore, loading, page, selectedSport]);

    const handleStartChat = (user) => {
        setChatTarget(user);
    };

    return (
    <div className="newsfeed-container">
            {/* Left Column: Feed */}
            <div className="feed-column">
        {/* Hero header */}
        <header className="feed-hero">
          <div className="feed-hero-left">
            <h1 className="feed-hero-title">Bảng tin thể thao</h1>
            <p className="feed-hero-subtitle">
              Chia sẻ hành trình luyện tập, truyền cảm hứng cho cộng đồng MySportCoach AI.
            </p>
          </div>
          <div className="feed-hero-right">
            <span className="feed-hero-pill">🚀 Mỗi ngày một câu chuyện mới</span>
          </div>
        </header>

        {/* Sport Filter Bar */}
        <div className="sport-filter-bar">
                    {SPORTS_FILTER.map(sport => (
                        <div
                            key={sport.id}
                            className={`filter-chip ${selectedSport === sport.id ? 'active' : ''}`}
                            onClick={() => setSelectedSport(sport.id)}
                        >
                            {sport.label}
                        </div>
                    ))}
                </div>

                <CreatePost
                    onPostCreated={handlePostCreated}
                    userAvatar={currentUser?.avatar}
                />

                {loading && page === 1 ? (
                    <div style={{ textAlign: 'center', padding: 20, color: '#94a3b8' }}>
                        Đang tải bảng tin thể thao...
                    </div>
                ) : (
                    posts.map(post => (
                        <PostCard
                            key={post.id}
                            post={post}
                            currentUserId={currentUser?.user_id}
                            onStartChat={handleStartChat}
                        />
                    ))
                )}

                {!hasMore && posts.length > 0 && (
                    <div style={{ textAlign: 'center', padding: 20, color: '#65676b' }}>
                        Bạn đã xem hết tin mới!
                    </div>
                )}

                {!loading && posts.length === 0 && (
                    <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                        Chưa có bài viết nào về môn này. Hãy là người đầu tiên chia sẻ! 🚀
                    </div>
                )}
            </div>

            {/* Right Column: Messenger */}
            <Messenger
                currentUserId={currentUser?.user_id}
                startChatWithUser={chatTarget}
            />
        </div>
    );
}
