import { useEffect, useMemo, useState } from "react";
import "./Social.css";

const LS_KEY = "msc_social_fb_v1";

// Hàm tạo avatar ngẫu nhiên
const avatar = (name = "U") =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff`;

// Phần Left Sidebar
function LeftSidebar() {
  return (
    <aside className="fb-left sticky top-16">
      <div className="fb-card">
        <div className="flex items-center gap-3">
          <img className="fb-avatar" src={avatar("Bạn")} alt="" />
          <div>
            <div className="font-semibold">Bạn</div>
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

  const submit = (e) => {
    e.preventDefault();
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

      <form onSubmit={submit}>
        <textarea
          className="fb-textarea"
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Bạn đang nghĩ gì?"
        />
        <div className="flex gap-2 mt-2">
          <input
            className="fb-input flex-1"
            value={img}
            onChange={(e) => setImg(e.target.value)}
            placeholder="Link ảnh (tuỳ chọn)"
          />
          <button className="fb-btn-primary" type="submit">Đăng</button>
        </div>
      </form>

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
          <div className="font-semibold">{post.author}</div>
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
        <span>{post.comments.length} bình luận</span>
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
    <aside className="fb-right sticky top-16">
      <div className="fb-card">
        <div className="font-semibold mb-2">Liên hệ</div>
        <div className="fb-contact"><span className="dot online" /> Linh</div>
        <div className="fb-contact"><span className="dot online" /> Vũ</div>
        <div className="fb-contact"><span className="dot" /> Khang</div>
        <div className="fb-contact"><span className="dot" /> Huy</div>
      </div>

      <div className="fb-card">
        <div className="font-semibold mb-2">Đang thịnh hành</div>
        <ul className="list-disc list-inside text-sm text-gray-700">
          <li>#calisthenics</li>
          <li>#football_drills</li>
          <li>#lean_bulk_meal</li>
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
    <main className="fb-wrap pt-20">
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
  );
}
