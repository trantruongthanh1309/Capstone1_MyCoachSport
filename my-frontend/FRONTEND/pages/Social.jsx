import { useEffect, useMemo, useState } from "react";
import ImageUploader from "../components/ImageUploader";
import { useToast } from "../contexts/ToastContext";

const styles = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .fb-wrap {
    min-height: 100vh;
    background: #f0f2f5;
    padding: 20px;
    font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
  }

  .fb-grid {
    display: grid;
    grid-template-columns: 280px 1fr 280px;
    gap: 32px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .fb-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
    overflow: hidden;
  }

  .fb-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    cursor: pointer;
  }
  
  .fb-avatar-lg {
    width: 48px;
    height: 48px;
  }

  .fb-left .fb-menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    color: #050505;
    font-weight: 600;
    border-radius: 8px;
    transition: background 0.2s;
    text-decoration: none;
  }
  .fb-left .fb-menu-item:hover {
    background: #e4e6eb;
  }

  .composer-container {
    padding: 16px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    margin-bottom: 24px;
  }

  .composer-top {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
  }

  .composer-input-area {
    flex: 1;
    background: #f0f2f5;
    border-radius: 20px;
    padding: 8px 16px;
    cursor: text;
    transition: background 0.2s;
  }
  
  .composer-input-area:focus-within {
    background: #e4e6eb;
  }

  .composer-textarea {
    width: 100%;
    background: transparent;
    border: none;
    resize: none;
    font-size: 1.05rem;
    outline: none;
    min-height: 24px;
    max-height: 200px;
    color: #050505;
    padding-top: 4px;
  }

  .composer-divider {
    height: 1px;
    background: #e4e6eb;
    margin: 8px 0;
  }

  .composer-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 4px;
  }

  .composer-btn-group {
    display: flex;
    gap: 4px;
  }

  .composer-action-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 8px;
    border: none;
    background: transparent;
    color: #65676b;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .composer-action-btn:hover {
    background: #f2f2f2;
  }

  .icon-photo { color: #45bd62; font-size: 20px; }
  .icon-tag { color: #1877f2; font-size: 20px; }
  .icon-feeling { color: #f7b928; font-size: 20px; }

  .btn-post {
    background: #1877f2;
    color: white;
    border: none;
    padding: 8px 24px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 15px;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  .btn-post:hover {
    background: #166fe5;
  }
  
  .btn-post:disabled {
    background: #e4e6eb;
    color: #bcc0c4;
    cursor: not-allowed;
  }

  .fb-post {
    padding: 0;
    animation: fadeInUp 0.5s ease-out;
  }
  
  .post-header {
    padding: 12px 16px 0;
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
  }
  
  .post-author-name {
    font-weight: 600;
    color: #050505;
    font-size: 15px;
  }
  
  .post-time {
    font-size: 13px;
    color: #65676b;
  }
  
  .post-content {
    padding: 4px 16px 16px;
    font-size: 15px;
    color: #050505;
    line-height: 1.5;
  }
  
  .post-image-container {
    width: 100%;
    background: #f0f2f5;
    display: flex;
    justify-content: center;
    cursor: pointer;
  }
  
  .post-image {
    max-width: 100%;
    max-height: 600px;
    object-fit: contain;
  }
  
  .post-stats {
    padding: 10px 16px;
    display: flex;
    justify-content: space-between;
    color: #65676b;
    font-size: 14px;
    border-bottom: 1px solid #e4e6eb;
  }
  
  .post-actions-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    padding: 4px;
  }
  
  .post-action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 8px;
    background: transparent;
    border: none;
    border-radius: 4px;
    color: #65676b;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  .post-action-btn:hover {
    background: #f0f2f5;
  }
  
  .post-action-btn.liked {
    color: #1877f2;
  }

  .fb-right .fb-card {
    padding: 16px;
  }
  .contact-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s;
  }
  .contact-item:hover {
    background: #e4e6eb;
  }
  .status-dot {
    width: 10px;
    height: 10px;
    background: #31a24c;
    border-radius: 50%;
    border: 2px solid white;
    position: absolute;
    bottom: 0;
    right: 0;
  }

  .sticky {
    position: sticky;
    top: 20px;
  }

  @media (max-width: 1024px) {
    .fb-grid {
      grid-template-columns: 1fr;
    }
    .fb-left, .fb-right {
      display: none;
    }
  }
`;

const avatar = (name = "U") =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&bold=true`;

function LeftSidebar({ user }) {
  return (
    <aside className="fb-left sticky">
      <div className="fb-menu">
        <div className="fb-menu-item">
          <img className="fb-avatar" src={user?.avatar || avatar(user?.name || "Bạn")} alt="" />
          <span>{user?.name || "Người dùng"}</span>
        </div>
        <a className="fb-menu-item" href="#!">
          <span style={{ fontSize: '24px' }}>👥</span> Bạn bè
        </a>
        <a className="fb-menu-item" href="#!">
          <span style={{ fontSize: '24px' }}>🏋️‍♂️</span> Nhóm tập luyện
        </a>
        <a className="fb-menu-item" href="#!">
          <span style={{ fontSize: '24px' }}>🏪</span> Marketplace
        </a>
        <a className="fb-menu-item" href="#!">
          <span style={{ fontSize: '24px' }}>📺</span> Watch
        </a>
        <a className="fb-menu-item" href="#!">
          <span style={{ fontSize: '24px' }}>⭐</span> Đã lưu
        </a>
      </div>
    </aside>
  );
}

function Composer({ onPost, user }) {
  const [text, setText] = useState("");
  const [img, setImg] = useState("");
  const [showUploader, setShowUploader] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const submit = () => {
    const t = text.trim();
    if (!t && !img) return;
    onPost({
      content: t,
      image_url: img,
    });
    setText("");
    setImg("");
    setShowUploader(false);
    setIsExpanded(false);
  };

  const handleImageUpload = (url) => {
    setImg(url);
    setShowUploader(false);
  };

  return (
    <div className="composer-container">
      <div className="composer-top">
        <img
          className="fb-avatar fb-avatar-lg"
          src={user?.avatar || avatar(user?.name || "Bạn")}
          alt=""
        />
        <div className="composer-input-area">
          <textarea
            className="composer-textarea"
            rows={isExpanded || text ? 3 : 1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder={`Bạn đang nghĩ gì thế, ${user?.name?.split(' ').pop() || 'bạn'}?`}
          />
        </div>
      </div>

      {}
      {img && (
        <div className="mb-3 relative rounded-lg overflow-hidden border border-gray-200">
          <img src={img} alt="Preview" className="w-full max-h-80 object-cover" />
          <button
            onClick={() => setImg("")}
            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100"
          >
            ❌
          </button>
        </div>
      )}

      {}
      {showUploader && (
        <div className="mb-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-600">Thêm ảnh vào bài viết</span>
            <button onClick={() => setShowUploader(false)} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>
          <ImageUploader onUploadSuccess={handleImageUpload} />
        </div>
      )}

      <div className="composer-divider"></div>

      <div className="composer-actions">
        <div className="composer-btn-group">
          <button className="composer-action-btn" onClick={() => setShowUploader(!showUploader)}>
            <span className="icon-photo">📷</span> Ảnh/Video
          </button>
          <button className="composer-action-btn">
            <span className="icon-tag">🏷</span> Gắn thẻ
          </button>
          <button className="composer-action-btn">
            <span className="icon-feeling">😊</span> Cảm xúc
          </button>
        </div>

        <button
          className="btn-post"
          onClick={submit}
          disabled={!text.trim() && !img}
        >
          Đăng
        </button>
      </div>
    </div>
  );
}

function Post({ post, onLike, onComment, onDelete, currentUser, onShare }) {
  const time = useMemo(
    () => new Date(post.created_at).toLocaleString("vi-VN"),
    [post.created_at]
  );
  const [showCmt, setShowCmt] = useState(false);
  const [cmt, setCmt] = useState("");

  const isAuthor = currentUser && currentUser.id === post.user_id;

  return (
    <article className="fb-card fb-post">
      <div className="post-header">
        <img className="fb-avatar" src={post.user_avatar || avatar(post.user_name)} alt="" />
        <div className="flex-1">
          <div className="post-author-name">{post.user_name}</div>
          <div className="post-time">{time}</div>
        </div>
        {isAuthor && (
          <button className="fb-btn-ghost" onClick={() => onDelete(post.id)}>🗑️</button>
        )}
      </div>

      <div className="post-content">{post.content}</div>

      {post.image_url && (
        <div className="post-image-container">
          <img
            className="post-image"
            src={post.image_url}
            alt=""
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        </div>
      )}

      <div className="post-stats">
        <span>👍 {post.likes_count}</span>
        <span>💬 {post.comments_count} bình luận</span>
      </div>

      <div className="post-actions-grid">
        <button
          className={`post-action-btn ${post.is_liked ? 'liked' : ''}`}
          onClick={() => onLike(post.id)}
        >
          <span>{post.is_liked ? '👍 Đã thích' : '👍 Thích'}</span>
        </button>
        <button className="post-action-btn" onClick={() => setShowCmt((v) => !v)}>
          <span>💬 Bình luận</span>
        </button>
        <button className="post-action-btn" onClick={() => onShare && onShare(post)}>
          <span>↗ Chia sẻ</span>
        </button>
      </div>

      {showCmt && (
        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <div className="flex gap-2">
            <input
              className="fb-input flex-1"
              value={cmt}
              onChange={(e) => setCmt(e.target.value)}
              placeholder="Viết bình luận công khai..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && cmt.trim()) {
                  onComment(post.id, cmt.trim());
                  setCmt("");
                }
              }}
            />
            <button
              className="btn-post"
              style={{ padding: '8px 16px' }}
              onClick={() => {
                if (!cmt.trim()) return;
                onComment(post.id, cmt.trim());
                setCmt("");
              }}
            >
              Gửi
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

function RightSidebar() {
  return (
    <aside className="fb-right sticky">
      <div className="fb-card">
        <div className="font-semibold mb-3 text-gray-600 text-lg">Người liên hệ</div>
        <div className="contact-item">
          <div className="relative">
            <img className="fb-avatar" src={avatar("Linh")} alt="" />
            <div className="status-dot"></div>
          </div>
          <span className="font-medium">Linh</span>
        </div>
        <div className="contact-item">
          <div className="relative">
            <img className="fb-avatar" src={avatar("Vũ")} alt="" />
            <div className="status-dot"></div>
          </div>
          <span className="font-medium">Vũ</span>
        </div>
        <div className="contact-item">
          <div className="relative">
            <img className="fb-avatar" src={avatar("Khang")} alt="" />
          </div>
          <span className="font-medium">Khang</span>
        </div>
      </div>
    </aside>
  );
}

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

export default function Social() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [shareModal, setShareModal] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/profile", { credentials: "include" });
        const data = await res.json();
        if (!data.error) {
          setUser({
            id: data.Id,
            name: data.Name,
            avatar: data.Avatar
          });
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/social/posts?page=1&per_page=20", { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts);
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const addPost = async (postData) => {
    try {
      const res = await fetch("/api/social/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(postData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Đăng bài thành công!");
        fetchPosts();
      } else {
        toast.error(data.error || "Lỗi khi đăng bài");
      }
    } catch (err) {
      toast.error("Lỗi kết nối");
    }
  };

  const likePost = async (id) => {
    try {
      const res = await fetch(`/api/social/posts/${id}/like`, {
        method: "POST",
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        setPosts(posts.map(p => {
          if (p.id === id) {
            return {
              ...p,
              likes_count: data.liked ? p.likes_count + 1 : p.likes_count - 1,
              is_liked: data.liked
            };
          }
          return p;
        }));
      }
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const addComment = async (id, text) => {
    // Import validation
    const { validateComment } = await import('../utils/validation');
    
    // Validate comment
    const commentValidation = validateComment(text);
    if (!commentValidation.valid) {
      toast.error(commentValidation.message);
      return;
    }
    
    try {
      const res = await fetch(`/api/social/posts/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: text })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Đã bình luận!");
        fetchPosts();
      }
    } catch (err) {
      toast.error("Lỗi khi bình luận");
    }
  };

  const delPost = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa bài viết này?")) return;
    try {
      const res = await fetch(`/api/social/posts/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Đã xóa bài viết");
        setPosts(posts.filter(p => p.id !== id));
      } else {
        toast.error(data.error || "Không thể xóa");
      }
    } catch (err) {
      toast.error("Lỗi kết nối");
    }
  };

  return (
    <>
      <style>{styles}</style>
      <main className="fb-wrap">
        <div className="fb-grid">
          <LeftSidebar user={user} />
          <section className="fb-center">
            <Composer onPost={addPost} user={user} />
            {posts.map((p) => (
              <Post
                key={p.id}
                post={p}
                onLike={likePost}
                onComment={addComment}
                onDelete={delPost}
                currentUser={user}
                onShare={(post) => setShareModal(post)}
              />
            ))}
          </section>
          <RightSidebar />
        </div>
      </main>
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
    </>
  );
}