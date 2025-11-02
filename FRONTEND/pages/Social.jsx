import { useEffect, useMemo, useState } from "react";

const LS_KEY = "msc_social_fb_v1";

// Styles CSS améliorés
const styles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }

  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }

  .fb-wrap {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
  }

  .fb-grid {
    display: grid;
    grid-template-columns: 280px 1fr 280px;
    gap: 24px;
    max-width: 1400px;
    margin: 0 auto;
  }

  .fb-left {
    animation: slideInLeft 0.6s ease-out;
  }

  .fb-center {
    animation: fadeInUp 0.6s ease-out 0.1s both;
  }

  .fb-right {
    animation: slideInRight 0.6s ease-out;
  }

  .fb-card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
    transition: all 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  .fb-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }

  .fb-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: 3px solid #667eea;
    transition: all 0.3s ease;
    cursor: pointer;
  }

  .fb-avatar:hover {
    transform: scale(1.1) rotate(5deg);
    border-color: #764ba2;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  .fb-avatar-s {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 2px solid #667eea;
  }

  .fb-menu {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .fb-menu-item {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    text-decoration: none;
    color: #333;
    border-radius: 12px;
    transition: all 0.3s ease;
    font-weight: 500;
    position: relative;
    overflow: hidden;
  }

  .fb-menu-item::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 0;
    background: linear-gradient(90deg, #667eea, #764ba2);
    transition: width 0.3s ease;
    z-index: -1;
  }

  .fb-menu-item:hover {
    color: white;
    transform: translateX(8px);
  }

  .fb-menu-item:hover::before {
    width: 100%;
  }

  .fb-input, .fb-textarea {
    width: 100%;
    padding: 12px 16px;
    border-radius: 12px;
    border: 2px solid #e0e0e0;
    transition: all 0.3s ease;
    font-size: 14px;
    background: white;
  }

  .fb-input:focus, .fb-textarea:focus {
    border-color: #667eea;
    outline: none;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
    transform: translateY(-2px);
  }

  .fb-textarea {
    resize: none;
    font-family: inherit;
  }

  .fb-btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 12px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  .fb-btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }

  .fb-btn-primary:active {
    transform: translateY(0);
  }

  .fb-btn {
    background: #667eea;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
  }

  .fb-btn:hover {
    background: #764ba2;
    transform: scale(1.05);
  }

  .fb-btn-ghost {
    background: transparent;
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;
    color: #666;
  }

  .fb-btn-ghost:hover {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
    transform: scale(1.05);
  }

  .fb-composer-actions {
    display: flex;
    gap: 12px;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;
  }

  .fb-chip {
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    border: none;
    padding: 8px 16px;
    border-radius: 20px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;
  }

  .fb-chip:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .fb-post {
    margin-bottom: 24px;
    animation: fadeInUp 0.5s ease-out;
    position: relative;
    overflow: hidden;
  }

  .fb-post::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    animation: shimmer 2s infinite;
  }

  .fb-post-text {
    font-size: 16px;
    line-height: 1.6;
    color: #333;
    margin: 16px 0;
  }

  .fb-post-img {
    width: 100%;
    border-radius: 12px;
    margin-top: 16px;
    transition: all 0.3s ease;
    cursor: pointer;
  }

  .fb-post-img:hover {
    transform: scale(1.02);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }

  .fb-post-stats {
    display: flex;
    justify-content: space-between;
    padding: 12px 0;
    margin: 12px 0;
    border-top: 1px solid #f0f0f0;
    border-bottom: 1px solid #f0f0f0;
    font-size: 14px;
    color: #666;
  }

  .fb-post-actions {
    display: flex;
    gap: 12px;
    justify-content: space-around;
    padding: 8px 0;
  }

  .fb-comment-box {
    margin-top: 20px;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    padding: 16px;
    border-radius: 12px;
    animation: fadeInUp 0.3s ease-out;
  }

  .fb-comments {
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .fb-comment {
    display: flex;
    gap: 12px;
    animation: fadeInUp 0.4s ease-out;
  }

  .fb-comment-bubble {
    background: white;
    padding: 12px 16px;
    border-radius: 16px;
    max-width: 70%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
  }

  .fb-comment-bubble:hover {
    transform: translateX(4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .fb-comment-author {
    font-weight: 600;
    color: #667eea;
    margin-bottom: 4px;
  }

  .fb-contact {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px;
    border-radius: 10px;
    transition: all 0.3s ease;
    cursor: pointer;
    margin-bottom: 8px;
  }

  .fb-contact:hover {
    background: rgba(102, 126, 234, 0.1);
    transform: translateX(4px);
  }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #ccc;
    display: inline-block;
  }

  .dot.online {
    background: #4caf50;
    box-shadow: 0 0 8px rgba(76, 175, 80, 0.6);
    animation: pulse 2s infinite;
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

// Hàm tạo avatar ngẫu nhiên
const avatar = (name = "U") =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=667eea&color=fff&bold=true`;

// Phần Left Sidebar
function LeftSidebar() {
  return (
    <aside className="fb-left sticky">
      <div className="fb-card">
        <div className="flex items-center gap-3">
          <img className="fb-avatar" src={avatar("Bạn")} alt="" />
          <div>
            <div className="font-semibold text-gray-800">Bạn</div>
            <div className="text-gray-500 text-sm">Xem trang cá nhân</div>
          </div>
        </div>
      </div>

      <div className="fb-card">
        <div className="fb-menu">
          <a className="fb-menu-item" href="#!">🏋️‍♂️ Bài tập</a>
          <a className="fb-menu-item" href="#!">🍽 Thực đơn</a>
          <a className="fb-menu-item" href="#!">📈 Tiến độ</a>
          <a className="fb-menu-item" href="#!">⭐ Đã lưu</a>
        </div>
      </div>
    </aside>
  );
}

// Phần Composer - nơi người dùng tạo bài đăng mới
function Composer({ onPost }) {
  const [name, setName] = useState("Bạn");
  const [text, setText] = useState("");
  const [img, setImg] = useState("");

  const submit = () => {
    const t = text.trim();
    if (!t) return;
    onPost({
      id: Date.now(),
      author: name || "Bạn",
      avatar: avatar(name),
      text: t,
      image: img.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: [],
    });
    setText(""); setImg("");
  };

  return (
    <div className="fb-card">
      <div className="flex items-center gap-3 mb-3">
        <img className="fb-avatar" src={avatar(name)} alt="" />
        <input
          className="fb-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tên hiển thị"
        />
      </div>

      <div>
        <textarea
          className="fb-textarea"
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Bạn đang nghĩ gì?"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
              submit();
            }
          }}
        />
        <div className="flex gap-2 mt-2">
          <input
            className="fb-input flex-1"
            value={img}
            onChange={(e) => setImg(e.target.value)}
            placeholder="Link ảnh (tuỳ chọn)"
          />
          <button className="fb-btn-primary" onClick={submit}>Đăng</button>
        </div>
      </div>

      <div className="fb-composer-actions">
        <button className="fb-chip">📷 Ảnh</button>
        <button className="fb-chip">🎥 Video</button>
        <button className="fb-chip">🏷 Hashtag</button>
      </div>
    </div>
  );
}

// Phần hiển thị bài đăng
function Post({ post, onLike, onComment, onDelete }) {
  const time = useMemo(
    () => new Date(post.createdAt).toLocaleString("vi-VN"),
    [post.createdAt]
  );
  const [showCmt, setShowCmt] = useState(false);
  const [cmt, setCmt] = useState("");

  return (
    <article className="fb-card fb-post">
      <header className="flex items-center gap-3">
        <img className="fb-avatar" src={post.avatar} alt="" />
        <div>
          <div className="font-semibold text-gray-800">{post.author}</div>
          <div className="text-xs text-gray-500">{time}</div>
        </div>
        <div className="ml-auto">
          <button className="fb-btn-ghost" onClick={() => onDelete(post.id)}>⋯</button>
        </div>
      </header>

      <p className="fb-post-text">{post.text}</p>
      {post.image && (
        <img
          className="fb-post-img"
          src={post.image}
          alt=""
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
      )}

      <div className="fb-post-stats">
        <span>👍 {post.likes}</span>
        <span>💬 {post.comments.length} bình luận</span>
      </div>

      <div className="fb-post-actions">
        <button className="fb-btn-ghost" onClick={() => onLike(post.id)}>👍 Thích</button>
        <button className="fb-btn-ghost" onClick={() => setShowCmt((v) => !v)}>💬 Bình luận</button>
        <button className="fb-btn-ghost" onClick={() => alert("Chia sẻ (demo)")}>↗ Chia sẻ</button>
      </div>

      {showCmt && (
        <div className="fb-comment-box">
          <div className="flex gap-2">
            <input
              className="fb-input flex-1"
              value={cmt}
              onChange={(e) => setCmt(e.target.value)}
              placeholder="Viết bình luận…"
              onKeyDown={(e) => {
                if (e.key === "Enter" && cmt.trim()) {
                  onComment(post.id, cmt.trim());
                  setCmt("");
                }
              }}
            />
            <button
              className="fb-btn"
              onClick={() => {
                if (!cmt.trim()) return;
                onComment(post.id, cmt.trim());
                setCmt("");
              }}
            >
              Gửi
            </button>
          </div>

          <div className="fb-comments">
            {post.comments.map((cm, i) => (
              <div key={i} className="fb-comment">
                <img className="fb-avatar-s" src={avatar(cm.author)} alt="" />
                <div className="fb-comment-bubble">
                  <div className="fb-comment-author">{cm.author}</div>
                  <div>{cm.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

// Phần Right Sidebar
function RightSidebar() {
  return (
    <aside className="fb-right sticky">
      <div className="fb-card">
        <div className="font-semibold mb-3 text-gray-800">Liên hệ</div>
        <div className="fb-contact"><span className="dot online" /> Linh</div>
        <div className="fb-contact"><span className="dot online" /> Vũ</div>
        <div className="fb-contact"><span className="dot" /> Khang</div>
        <div className="fb-contact"><span className="dot" /> Huy</div>
      </div>

      <div className="fb-card">
        <div className="font-semibold mb-3 text-gray-800">Đang thịnh hành</div>
        <ul className="list-none text-sm text-gray-700 space-y-2">
          <li className="fb-contact">#calisthenics</li>
          <li className="fb-contact">#football_drills</li>
          <li className="fb-contact">#lean_bulk_meal</li>
        </ul>
      </div>
    </aside>
  );
}

// Social Feed chính
export default function Social() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) setPosts(JSON.parse(saved));
    else {
      const seed = [
        {
          id: 1,
          author: "Linh",
          avatar: avatar("Linh"),
          text: "Drill tăng tốc 6×30m, nghỉ 60s – thấy đùi hơi mỏi 😅",
          image: "",
          createdAt: new Date(Date.now() - 3600e3).toISOString(),
          likes: 4,
          comments: [{ author: "Bạn", text: "Gắt đó!" }],
        },
        {
          id: 2,
          author: "Bạn",
          avatar: avatar("Bạn"),
          text: "Bữa trưa tăng cơ: ức gà 150g + khoai lang 200g + salad 🥗",
          image: "",
          createdAt: new Date().toISOString(),
          likes: 6,
          comments: [],
        },
      ];
      setPosts(seed);
      localStorage.setItem(LS_KEY, JSON.stringify(seed));
    }
  }, []);

  const persist = (next) => {
    setPosts(next);
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  };

  const addPost = (p) => persist([p, ...posts]);
  const likePost = (id) =>
    persist(posts.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p)));
  const addComment = (id, text) =>
    persist(
      posts.map((p) =>
        p.id === id ? { ...p, comments: [...p.comments, { author: "Bạn", text }] } : p
      )
    );
  const delPost = (id) => persist(posts.filter((p) => p.id !== id));

  return (
    <>
      <style>{styles}</style>
      <main className="fb-wrap">
        <div className="fb-grid">
          <LeftSidebar />
          <section className="fb-center">
            <Composer onPost={addPost} />
            {posts.map((p) => (
              <Post
                key={p.id}
                post={p}
                onLike={likePost}
                onComment={addComment}
                onDelete={delPost}
              />
            ))}
          </section>
          <RightSidebar />
        </div>
      </main>
    </>
  );
}