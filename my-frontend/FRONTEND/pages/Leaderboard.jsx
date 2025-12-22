import { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import ImageUploader from '../components/ImageUploader';
import './Leaderboard.css';

export default function Leaderboard() {
  const [rankings, setRankings] = useState([]);
  const [myStats, setMyStats] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [activeTab, setActiveTab] = useState('rankings');
  const toast = useToast();

  useEffect(() => {
    fetchRankings();
    fetchMyStats();
    fetchAchievements();
  }, []);

  const fetchRankings = async () => {
    try {
      const res = await fetch('/api/leaderboard/rankings', {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setRankings(data.rankings);
      }
    } catch (err) {
      console.error('Error fetching rankings:', err);
    }
  };

  const fetchMyStats = async () => {
    try {
      const res = await fetch('/api/leaderboard/my-stats', {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setMyStats(data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchAchievements = async () => {
    try {
      const res = await fetch('/api/leaderboard/achievements', {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setAchievements(data.achievements);
      }
    } catch (err) {
      console.error('Error fetching achievements:', err);
    }
  };


  const getRankColor = (rank) => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return '#4a5568';
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return '👑';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="leaderboard-container">
      {}
      <div className="leaderboard-header">
        <h1 className="leaderboard-title">🏆 Bảng Xếp Hạng</h1>
        <p className="leaderboard-subtitle">Cạnh tranh và chinh phục đỉnh cao!</p>
      </div>

      {}
      {myStats && (
        <div className="my-stats-card">
          <div className="stats-row">
            <div className="stat-item">
              <div className="stat-icon">🏅</div>
              <div className="stat-content">
                <div className="stat-label">Hạng</div>
                <div className="stat-value">#{myStats.rank || 'N/A'}</div>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">⭐</div>
              <div className="stat-content">
                <div className="stat-label">Điểm</div>
                <div className="stat-value">{myStats.stats.total_points}</div>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">💪</div>
              <div className="stat-content">
                <div className="stat-label">Bài tập</div>
                <div className="stat-value">{myStats.stats.total_workouts}</div>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">🔥</div>
              <div className="stat-content">
                <div className="stat-label">Streak</div>
                <div className="stat-value">{myStats.stats.current_streak} ngày</div>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-label">Level</div>
                <div className="stat-value">{myStats.stats.level}</div>
              </div>
            </div>
          </div>
          <div className="exp-bar">
            <div className="exp-label">EXP: {myStats.stats.experience} / 1000</div>
            <div className="exp-progress">
              <div
                className="exp-fill"
                style={{ width: `${(myStats.stats.experience / 1000) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'rankings' ? 'active' : ''}`}
          onClick={() => setActiveTab('rankings')}
        >
          🏆 Xếp hạng
        </button>
        <button
          className={`tab ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          🎖️ Thành tựu
        </button>
      </div>

      {}
      {activeTab === 'rankings' && (
        <div className="rankings-list">
          {rankings.map((user, index) => (
            <div key={user.user_id} className="ranking-card">
              <div className="rank-badge" style={{ background: getRankColor(user.rank) }}>
                {getRankIcon(user.rank)}
              </div>
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_name)}&background=random`}
                alt={user.user_name}
                className="user-avatar"
              />
              <div className="user-info">
                <div className="user-name">{user.user_name}</div>
                <div className="user-sport">{user.sport || 'Thể thao'}</div>
              </div>
              <div className="user-stats-inline">
                <div className="stat-mini">
                  <span className="stat-mini-icon">⭐</span>
                  <span className="stat-mini-value">{user.total_points}</span>
                </div>
                <div className="stat-mini">
                  <span className="stat-mini-icon">💪</span>
                  <span className="stat-mini-value">{user.total_workouts}</span>
                </div>
                <div className="stat-mini">
                  <span className="stat-mini-icon">🔥</span>
                  <span className="stat-mini-value">{user.current_streak}</span>
                </div>
                <div className="stat-mini">
                  <span className="stat-mini-icon">📊</span>
                  <span className="stat-mini-value">Lv.{user.level}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="achievements-grid">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
            >
              <div className="achievement-icon">{achievement.icon}</div>
              <div className="achievement-name">{achievement.name}</div>
              <div className="achievement-desc">{achievement.description}</div>
              <div className="achievement-reward">+{achievement.points_reward} điểm</div>
              {achievement.unlocked && (
                <div className="achievement-unlocked-badge">✅ Đã mở khóa</div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
