import { useState, useEffect } from "react";
import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";
import Messenger from "../components/Messenger";
import { useToast } from "../contexts/ToastContext";
import "./NewsFeed.css";


const SPORTS_FILTER = [
    { id: "All", label: "🌐 Tất cả" },
    { id: "Gym", label: "🏋️ Gym" },
    { id: "Yoga", label: "🧘 Yoga" },
    { id: "Running", label: "🏃 Chạy bộ" },
    { id: "Football", label: "⚽ Bóng đá" },
    { id: "Basketball", label: "🏀 Bóng rổ" }
];

function ShareModal({ post, onClose, onShare }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    // Load conversations
    fetch(`/api/social/conversations`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) setConversations(data.conversations);
      });
  }, []);

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

  const handleShare = async () => {
    if (!selectedUser) {
      toast.error('Vui lòng chọn người nhận');
      return;
    }

    setLoading(true);
    try {
      // Get or create conversation
      const convRes = await fetch(`/api/social/conversations/${selectedUser.id}`, {
        credentials: 'include'
      });
      const convData = await convRes.json();
      
      if (!convData.success) {
        throw new Error('Không thể tạo cuộc trò chuyện');
      }

      const conversationId = convData.conversation.id;

      // Send message with shared post
      const msgRes = await fetch(`/api/social/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content: message || '📎 Đã chia sẻ một bài đăng',
          shared_post_id: post.id
        })
      });

      const msgData = await msgRes.json();
      if (msgData.success) {
        toast.success(`✅ Đã chia sẻ bài đăng đến ${selectedUser.name}`);
        onShare && onShare();
        onClose();
      } else {
        throw new Error(msgData.error || 'Không thể chia sẻ');
      }
    } catch (err) {
      toast.error(`❌ Lỗi: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const avatar = (name = "U") =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&bold=true`;

  const allUsers = [
    ...conversations.map(c => c.other_user),
    ...searchResults
  ].filter((user, index, self) => 
    index === self.findIndex(u => u.id === user.id)
  );

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }} onClick={onClose}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '80vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e4e6eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>Chia sẻ bài đăng</h3>
          <button onClick={onClose} style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#65676b'
          }}>✕</button>
        </div>

        <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="Tìm người dùng..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e4e6eb',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
              Chọn người nhận:
            </label>
            <div style={{
              maxHeight: '200px',
              overflowY: 'auto',
              border: '1px solid #e4e6eb',
              borderRadius: '8px'
            }}>
              {allUsers.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#65676b' }}>
                  {searchQuery ? 'Không tìm thấy người dùng' : 'Tìm kiếm để chọn người nhận'}
                </div>
              ) : (
                allUsers.map(user => (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    style={{
                      padding: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      background: selectedUser?.id === user.id ? '#e7f3ff' : 'transparent',
                      borderBottom: '1px solid #f0f2f5'
                    }}
                  >
                    <img
                      src={user.avatar || avatar(user.name)}
                      alt=""
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <span style={{ fontWeight: selectedUser?.id === user.id ? '600' : '400' }}>
                      {user.name}
                    </span>
                    {selectedUser?.id === user.id && <span>✓</span>}
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
              Tin nhắn kèm theo (tùy chọn):
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Viết tin nhắn..."
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e4e6eb',
                borderRadius: '8px',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
          </div>
        </div>

        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid #e4e6eb',
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              border: '1px solid #e4e6eb',
              borderRadius: '8px',
              background: 'white',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Hủy
          </button>
          <button
            onClick={handleShare}
            disabled={!selectedUser || loading}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '8px',
              background: selectedUser && !loading ? '#1877f2' : '#e4e6eb',
              color: selectedUser && !loading ? 'white' : '#65676b',
              cursor: selectedUser && !loading ? 'pointer' : 'not-allowed',
              fontWeight: '600'
            }}
          >
            {loading ? 'Đang gửi...' : 'Gửi'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NewsFeed() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [chatTarget, setChatTarget] = useState(null);
    const [selectedSport, setSelectedSport] = useState("All");
    const [shareModal, setShareModal] = useState(null);
    const toast = useToast();

    useEffect(() => {
        fetch(`/api/auth/me`, { credentials: 'include' })
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
            const res = await fetch(`/api/social/posts?page=${pageNum}&sport=${sport}`, {
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
        if (selectedSport === "All" || selectedSport === newPost.sport) {
            setPosts([newPost, ...posts]);
        }
    };

    const handleScroll = () => {
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
            {}
            <div className="feed-column">
        {}
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

        {}
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
                            onShare={(post) => setShareModal(post)}
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

            {}
            <Messenger
                currentUserId={currentUser?.user_id}
                startChatWithUser={chatTarget}
            />
            {shareModal && (
              <ShareModal
                post={shareModal}
                onClose={() => setShareModal(null)}
                onShare={() => {
                  toast.success('✅ Đã chia sẻ bài đăng thành công!');
                  setShareModal(null);
                }}
              />
            )}
        </div>
    );
}
