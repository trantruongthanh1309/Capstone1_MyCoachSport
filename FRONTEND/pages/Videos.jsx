import { useState } from "react";
import "./Videos.css";

const API_BASE = "http://localhost:5000";
const SUGGESTS = ["Bóng đá", "Bóng rổ", "Cầu lông", "Bơi lội", "Tennis", "Boxing", "Calisthenics"];

export default function Videos() {
  const [term, setTerm] = useState("");
  const [videos, setVideos] = useState([]);
  const [state, setState] = useState({ loading: false, error: "" });

  const search = async (q0) => {
    const q = (q0 ?? term).trim();
    if (!q) return setState({ loading: false, error: "⚠️ Vui lòng nhập môn thể thao." });
    setState({ loading: true, error: "" });
    setVideos([]);
    try {
      const r = await fetch(`${API_BASE}/api/videos?q=${encodeURIComponent(q)}&max=8`);
      const d = await r.json();
      if (d.error) setState({ loading: false, error: d.error });
      else {
        setVideos(d.videos || []);
        setState({ loading: false, error: "" });
      }
    } catch {
      setState({ loading: false, error: "❌ Lỗi khi tải video." });
    }
  };

  const onChip = (q) => {
    setTerm(q);
    search(q);
  };

  return (
    <div className="wrap">
      <div className="animated-bg"></div>
      
      <div className="header-section">
        <div className="icon-wrapper">
          <span className="main-icon">🎥</span>
          <div className="icon-glow"></div>
        </div>
        <h1 className="gradient-title">Video kỹ thuật & drills theo môn</h1>
        <p className="subtitle">Nhập tên môn (VD: bóng đá, cầu lông, bơi lội…) để tìm bài tập phù hợp.</p>
      </div>

      <div className="search-container glass-effect">
        <div className="search-bar">
          <div className="input-wrapper">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input
              className="search-input"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Nhập tên môn thể thao…"
              onKeyDown={(e) => e.key === "Enter" && search()}
            />
            {term && (
              <button className="clear-input-btn" onClick={() => setTerm("")}>
                ×
              </button>
            )}
          </div>
          <button className="search-btn" onClick={() => search()}>
            <span>Tìm video</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="chips-container">
          <span className="chips-label">Gợi ý:</span>
          <div className="chips">
            {SUGGESTS.map((c, i) => (
              <button 
                key={c} 
                className="chip" 
                onClick={() => onChip(c)}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <span className="chip-text">{c}</span>
                <span className="chip-arrow">→</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {state.loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p className="loading-text">Đang tìm kiếm video cho bạn...</p>
        </div>
      )}

      {!!state.error && !state.loading && (
        <div className="error-state">
          <span className="error-icon">⚠️</span>
          <p>{state.error}</p>
        </div>
      )}

      {!state.loading && !state.error && videos.length === 0 && term && (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>Không tìm thấy video</h3>
          <p>Hãy thử từ khóa khác hoặc chọn môn thể thao từ gợi ý bên trên!</p>
        </div>
      )}

      {videos.length > 0 && (
        <div className="results-header">
          <h2 className="results-title">
            <span className="results-icon">📹</span>
            Tìm thấy {videos.length} video
          </h2>
        </div>
      )}

      <div className="video-grid">
        {videos.map((v, i) => (
          <article 
            className="video-card" 
            key={v.id}
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div className="thumbnail-wrapper">
              <img className="thumbnail" src={v.thumb} alt={v.title} />
              <div className="play-overlay">
                <div className="play-button">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5.14v14.72L18 12z"/>
                  </svg>
                </div>
              </div>
              {v.duration && (
                <div className="duration-badge">{v.duration}</div>
              )}
            </div>
            
            <div className="card-content">
              <h3 className="video-title" title={v.title}>{v.title}</h3>
              <div className="channel-name">{v.channel}</div>
              
              <div className="card-footer">
                <div className="video-stats">
                  <span className="stat-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 6v6l4 2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    {v.duration || "N/A"}
                  </span>
                </div>
                <a 
                  className="watch-btn" 
                  href={v.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <span>Xem ngay</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div className="card-shine"></div>
          </article>
        ))}
      </div>
    </div>
  );
}