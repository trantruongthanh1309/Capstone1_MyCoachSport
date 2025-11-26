import { useState, useEffect } from "react";
import axios from "axios";
import "./Leaderboard.css";

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, workouts, challenges
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      console.log("🔄 Fetching leaderboard data...");

      const response = await axios.get("http://localhost:5000/api/leaderboard");
      console.log("📦 Response received:", response);
      console.log("📊 Response data:", response.data);

      if (response.data.success) {
        console.log("✅ Success! Data:", response.data.data);
        console.log("📈 Total users:", response.data.total);
        setLeaderboard(response.data.data);
      } else {
        console.error("❌ API returned success=false");
      }
    } catch (error) {
      console.error("❌ Error fetching leaderboard:", error);
      console.error("Error details:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredData = () => {
    let filtered = [...leaderboard];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.sport.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter and re-sort
    if (filter === "workouts") {
      filtered.sort((a, b) => b.workoutsCompleted - a.workoutsCompleted);
    } else if (filter === "challenges") {
      filtered.sort((a, b) => b.challengesCompleted - a.challengesCompleted);
    }

    return filtered;
  };

  const getRankClass = (rank) => {
    if (rank === 1) return "rank-gold";
    if (rank === 2) return "rank-silver";
    if (rank === 3) return "rank-bronze";
    return "";
  };

  const getLevelBadge = (level, color) => {
    const badges = {
      "Legend": "👑",
      "Master": "⭐",
      "Expert": "💎",
      "Advanced": "🔥",
      "Beginner": "🌱"
    };
    return { icon: badges[level] || "🌱", color };
  };

  const filteredData = getFilteredData();

  if (loading) {
    return (
      <div className="leaderboard-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải bảng xếp hạng...</p>
      </div>
    );
  }

  return (
    <div className="leaderboard-page">
      {/* Hero Section */}
      <div className="leaderboard-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="trophy-icon">🏆</span>
            Bảng Xếp Hạng
          </h1>
          <p className="hero-subtitle">
            Cạnh tranh với các vận động viên hàng đầu và leo lên vị trí số 1!
          </p>
        </div>
        <div className="hero-stats">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-value">{leaderboard.length}</div>
            <div className="stat-label">Vận Động Viên</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💪</div>
            <div className="stat-value">
              {leaderboard.reduce((sum, u) => sum + u.workoutsCompleted, 0)}
            </div>
            <div className="stat-label">Bài Tập Hoàn Thành</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-value">
              {leaderboard.reduce((sum, u) => sum + u.challengesCompleted, 0)}
            </div>
            <div className="stat-label">Thử Thách Hoàn Thành</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="leaderboard-controls">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Tìm kiếm vận động viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            <span className="filter-icon">🏅</span>
            Tổng Điểm
          </button>
          <button
            className={`filter-btn ${filter === "workouts" ? "active" : ""}`}
            onClick={() => setFilter("workouts")}
          >
            <span className="filter-icon">💪</span>
            Bài Tập
          </button>
          <button
            className={`filter-btn ${filter === "challenges" ? "active" : ""}`}
            onClick={() => setFilter("challenges")}
          >
            <span className="filter-icon">🎯</span>
            Thử Thách
          </button>
        </div>
      </div>

      {/* Top 3 Podium */}
      {filter === "all" && leaderboard.length >= 3 && (
        <div className="podium-section">
          <div className="podium">
            {/* 2nd Place */}
            <div className="podium-item podium-second">
              <div className="podium-avatar">
                <div className="avatar-circle silver">
                  {leaderboard[1].name.charAt(0).toUpperCase()}
                </div>
                <div className="rank-badge silver">🥈</div>
              </div>
              <h3 className="podium-name">{leaderboard[1].name}</h3>
              <p className="podium-points">{leaderboard[1].totalPoints} điểm</p>
              <div className="podium-stand silver-stand">
                <div className="stand-number">2</div>
              </div>
            </div>

            {/* 1st Place */}
            <div className="podium-item podium-first">
              <div className="podium-avatar">
                <div className="avatar-circle gold">
                  {leaderboard[0].name.charAt(0).toUpperCase()}
                </div>
                <div className="rank-badge gold">🥇</div>
                <div className="crown">👑</div>
              </div>
              <h3 className="podium-name">{leaderboard[0].name}</h3>
              <p className="podium-points">{leaderboard[0].totalPoints} điểm</p>
              <div className="podium-stand gold-stand">
                <div className="stand-number">1</div>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="podium-item podium-third">
              <div className="podium-avatar">
                <div className="avatar-circle bronze">
                  {leaderboard[2].name.charAt(0).toUpperCase()}
                </div>
                <div className="rank-badge bronze">🥉</div>
              </div>
              <h3 className="podium-name">{leaderboard[2].name}</h3>
              <p className="podium-points">{leaderboard[2].totalPoints} điểm</p>
              <div className="podium-stand bronze-stand">
                <div className="stand-number">3</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="leaderboard-table-container">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Hạng</th>
              <th>Vận Động Viên</th>
              <th>Cấp Độ</th>
              <th>Môn Thể Thao</th>
              <th>Điểm</th>
              <th>Bài Tập</th>
              <th>Thử Thách</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((user, index) => {
                const displayRank = filter === "all" ? user.rank : index + 1;
                const levelBadge = getLevelBadge(user.level, user.levelColor);

                return (
                  <tr key={user.userId} className={getRankClass(displayRank)}>
                    <td className="rank-cell">
                      <div className="rank-number">
                        {user.badge || displayRank}
                      </div>
                    </td>
                    <td className="user-cell">
                      <div className="user-info">
                        <div className="user-avatar">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-details">
                          <div className="user-name">{user.name}</div>
                          <div className="user-goal">{user.goal}</div>
                        </div>
                      </div>
                    </td>
                    <td className="level-cell">
                      <div className={`level-badge level-${user.levelColor}`}>
                        <span className="level-icon">{levelBadge.icon}</span>
                        <span className="level-text">{user.level}</span>
                      </div>
                    </td>
                    <td className="sport-cell">
                      <span className="sport-tag">{user.sport}</span>
                    </td>
                    <td className="points-cell">
                      <div className="points-value">{user.totalPoints}</div>
                    </td>
                    <td className="workouts-cell">
                      <div className="stat-badge workout-badge">
                        💪 {user.workoutsCompleted}
                      </div>
                    </td>
                    <td className="challenges-cell">
                      <div className="stat-badge challenge-badge">
                        🎯 {user.challengesCompleted}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="no-data">
                  Không tìm thấy kết quả phù hợp
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
