import { useState, useEffect } from "react";
import './Profile.css';

export default function Profile() {
  const [userId, setUserId] = useState(localStorage.getItem("user_id") || "");
  const [profile, setProfile] = useState({
    name: "Người Dùng",
    sex: "Nam",
    age: 30,
    height: 170,
    weight: 70,
    activity: "Vừa phải (3-5 ngày/tuần)",
    goal: "Duy trì cân nặng",
    sport: "Bóng đá"
  });

  fetch("http://localhost:5000/api/profile", {
  method: "GET",
  credentials: "include" // ✅ Phải có dòng này
})
  .then(res => res.json())
  .then(data => {
    if (!data.error) {
      setProfile({
        name: data.Name,
        sex: data.Sex,
        age: data.Age,
        height: data.Height_cm,
        weight: data.Weight_kg,
        sport: data.Sport,
        goal: data.Goal
      });
    } else {
      console.warn("Lỗi:", data.error);
    }
  });

console.log("Cookies gửi đi:", document.cookie);  // Kiểm tra cookie gửi đi

  const saveProfile = () => {
    if (!userId || userId === "null" || userId === "undefined") {
      alert("❌ Không tìm thấy user_id. Vui lòng nhập ID hoặc đăng nhập.");
      return;
    }

    const sessions = profile.activity.includes("6-7") ? 6
                   : profile.activity.includes("1-2") ? 2
                   : 4;

    fetch(`http://localhost:5000/api/profile/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: profile.name,
        age: profile.age,
        sex: profile.sex,
        height_cm: profile.height,
        weight_kg: profile.weight,
        sport: profile.sport,
        goal: profile.goal,
        sessions_per_week: sessions
      })
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Kết quả từ server:", data);
        alert(data.message || "✅ Hồ sơ đã được lưu!");
      })
      .catch((err) => {
        console.error("❌ Lỗi khi gửi request:", err);
        alert("❌ Có lỗi xảy ra khi lưu hồ sơ.");
      });
  };

  const bmi = (profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1);
  const tdee = Math.round(
    (10 * profile.weight + 6.25 * profile.height - 5 * profile.age + (profile.sex === "Nam" ? 5 : -161)) * 1.55
  );

  return (
    <div className="profile-container">
      <div className="profile-left">
        <h2>Hồ sơ cá nhân</h2>

        {/* Nhập user_id */}
        <input
          type="number"
          value={userId}
          onChange={(e) => {
            setUserId(e.target.value);
            localStorage.setItem("user_id", e.target.value);
          }}
          placeholder="User ID"
        />

        <input
          type="text"
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          placeholder="Họ và tên"
        />
        <select
          value={profile.sex}
          onChange={(e) => setProfile({ ...profile, sex: e.target.value })}
        >
          <option value="Nam">Nam</option>
          <option value="Nữ">Nữ</option>
        </select>
        <input
          type="number"
          value={profile.age}
          onChange={(e) => setProfile({ ...profile, age: +e.target.value })}
          placeholder="Tuổi"
        />
        <input
          type="number"
          value={profile.height}
          onChange={(e) => setProfile({ ...profile, height: +e.target.value })}
          placeholder="Chiều cao (cm)"
        />
        <input
          type="number"
          value={profile.weight}
          onChange={(e) => setProfile({ ...profile, weight: +e.target.value })}
          placeholder="Cân nặng (kg)"
        />
        <input
          type="text"
          value={profile.sport}
          onChange={(e) => setProfile({ ...profile, sport: e.target.value })}
          placeholder="Môn thể thao (Sport)"
        />
        <select
          value={profile.activity}
          onChange={(e) => setProfile({ ...profile, activity: e.target.value })}
        >
          <option value="Vừa phải (3-5 ngày/tuần)">Vừa phải (3-5 ngày/tuần)</option>
          <option value="Ít hoạt động (1-2 ngày/tuần)">Ít hoạt động (1-2 ngày/tuần)</option>
          <option value="Rất hoạt động (6-7 ngày/tuần)">Rất hoạt động (6-7 ngày/tuần)</option>
        </select>
        <select
          value={profile.goal}
          onChange={(e) => setProfile({ ...profile, goal: e.target.value })}
        >
          <option value="Duy trì cân nặng">Duy trì cân nặng</option>
          <option value="Giảm cân">Giảm cân</option>
          <option value="Tăng cơ">Tăng cơ</option>
        </select>
        <button onClick={saveProfile}>Lưu hồ sơ</button>
      </div>

      <div className="profile-right">
        <div className="profile-info">
          <img src="https://via.placeholder.com/100" alt="Avatar" />
          <h3>{profile.name}</h3>
          <p>{profile.sex}, {profile.age} tuổi</p>
          <button>Thay đổi ảnh đại diện</button>
        </div>

        <div className="stats">
          <p className="bmi">BMI: {bmi}</p>
          <p className="tdee">TDEE: {tdee} kcal/ngày</p>
          <p>Chiều cao: {profile.height} cm</p>
          <p>Cân nặng: {profile.weight} kg</p>
          <p>Môn: {profile.sport}</p>
          <p>Mục tiêu: {profile.goal}</p>
        </div>
      </div>
    </div>
  );
}