import { useState } from "react";
import styles from "./Videos.module.css";

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
    <div className={styles.wrap}>
      <h1 className={styles.title}>🎥 Video kỹ thuật & drills theo môn</h1>
      <p className={styles.sub}>Nhập tên môn (VD: bóng đá, cầu lông, bơi lội…) để tìm bài tập phù hợp.</p>

      <div className={styles.bar}>
        <input
          className={styles.input}
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Nhập tên môn thể thao…"
          onKeyDown={(e) => e.key === "Enter" && search()}
        />
        <button className={styles.btn} onClick={() => search()}>Tìm video</button>
      </div>

      <div className={styles.chips}>
        {SUGGESTS.map((c) => (
          <button key={c} className={styles.chip} onClick={() => onChip(c)}>{c}</button>
        ))}
      </div>

      {!!state.error && <div className={styles.state}>{state.error}</div>}
      {state.loading && <div className={styles.state}>⏳ Đang tải…</div>}
      {!state.loading && !state.error && videos.length === 0 && (
        <div className={styles.empty}>Không có kết quả. Hãy thử từ khóa khác nhé!</div>
      )}

      <div className={styles.grid}>
        {videos.map((v) => (
          <article className={styles.card} key={v.id}>
            <img className={styles.thumb} src={v.thumb} alt={v.title} />
            <div className={styles.meta}>
              <h3 className={styles.title2} title={v.title}>{v.title}</h3>
              <div className={styles.chan}>{v.channel}</div>
              <div className={styles.row}>
                <span className={styles.dur}>⏱ {v.duration || ""}</span>
                <a className={styles.open} href={v.url} target="_blank" rel="noopener noreferrer">Xem</a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
