
import { useState, useEffect } from "react";
import axios from "axios";  // Bạn có thể dùng axios hoặc fetch
import "./Leaderboard.css";  
export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    // Sử dụng axios để lấy dữ liệu từ API
    axios
      .get("http://localhost:5000/api/leaderboard")  // URL đúng của API
      .then((response) => {
        console.log(response.data);  // Kiểm tra xem dữ liệu có đúng không
        setLeaderboard(response.data);
      })
      .catch((error) => console.error("Error fetching leaderboard data:", error));
  }, []);

  return (
    <div className="leaderboard-container">
      <h2 className="leaderboard-title">🏆 Bảng Xếp Hạng</h2>
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Hạng</th>
            <th>Tên Người Dùng</th>
            <th>Điểm</th>
            <th>Thử Thách</th>
            <th>Ngày</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.length > 0 ? (
            leaderboard.map((entry, index) => (
              <tr key={entry.Id}>
                <td>{index + 1}</td>
                <td>{entry.Name}</td>
                <td>{entry.Points}</td>
                <td>{entry.Challenge_name}</td>
                <td>{entry.Date}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">Không có dữ liệu.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
