import { useState, useEffect } from "react";
import "./Profile.css";

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
    sport: "Bóng đá",
  });

  useEffect(() => {
    if (!userId) return; // Không gọi API nếu không có userId

    fetch("http://localhost:5000/api/profile", {
      method: "GET",
      credentials: "include", // ✅ Phải có dòng này
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setProfile({
            name: data.Name,
            sex: data.Sex,
            age: data.Age,
            height: data.Height_cm,
            weight: data.Weight_kg,
            sport: data.Sport,
            goal: data.Goal,
          });
        } else {
          console.warn("Lỗi:", data.error);
        }
      })
      .catch((err) => console.warn("Error fetching profile:", err));
  }, [userId]); // Chỉ gọi khi userId thay đổi

  // Lưu hồ sơ khi bấm nút "Lưu hồ sơ"
  const saveProfile = () => {
    console.log("Lưu hồ sơ đang được gọi..."); // Debugging line

    if (!userId || userId === "null" || userId === "undefined") {
      alert("❌ Không tìm thấy user_id. Vui lòng nhập ID hoặc đăng nhập.");
      return;
    }

    const sessions = profile.activity.includes("6-7")
      ? 6
      : profile.activity.includes("1-2")
      ? 2
      : 4;

    console.log("Saving profile with data:", profile); // Debugging line

    fetch(`http://localhost:5000/api/profile/${userId}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: profile.name,
        age: profile.age,
        sex: profile.sex,
        height_cm: profile.height,
        weight_kg: profile.weight,
        sport: profile.sport,
        goal: profile.goal,
        sessions_per_week: sessions,
      }),
    })
      .then((res) => {
        console.log("Server response:", res); // Debugging line
        return res.json();
      })
      .then((data) => {
        console.log("✅ Kết quả từ server:", data); // Debugging line
        alert(data.message || "✅ Hồ sơ đã được lưu!");
      })
      .catch((err) => {
        console.error("❌ Lỗi khi gửi request:", err);
        alert("❌ Có lỗi xảy ra khi lưu hồ sơ.");
      });
  };

  const bmi = (profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1);
  const tdee = Math.round(
    (10 * profile.weight +
      6.25 * profile.height -
      5 * profile.age +
      (profile.sex === "Nam" ? 5 : -161)) *
      1.55
  );

  return (
    <div className="profile-container">
      <div className="profile-left">
        <h2>Hồ sơ cá nhân</h2>

        {/* Nhập user_id */}
        <div className="profile-field">
          <label>User ID:</label>
          <input
            type="number"
            value={userId}
            onChange={(e) => {
              setUserId(e.target.value);
              localStorage.setItem("user_id", e.target.value);
            }}
            placeholder="User ID"
          />
        </div>

        {/* Tên */}
        <div className="profile-field">
          <label>Tên:</label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            placeholder="Họ và tên"
          />
        </div>

        {/* Giới tính */}
        <div className="profile-field">
          <label>Giới tính:</label>
          <select
            value={profile.sex}
            onChange={(e) => setProfile({ ...profile, sex: e.target.value })}
          >
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
          </select>
        </div>

        {/* Tuổi */}
        <div className="profile-field">
          <label>Tuổi:</label>
          <input
            type="number"
            value={profile.age}
            onChange={(e) => setProfile({ ...profile, age: +e.target.value })}
            placeholder="Tuổi"
          />
        </div>

        {/* Chiều cao */}
        <div className="profile-field">
          <label>Chiều cao:</label>
          <input
            type="number"
            value={profile.height}
            onChange={(e) => setProfile({ ...profile, height: +e.target.value })}
            placeholder="Chiều cao (cm)"
          />
        </div>

        {/* Cân nặng */}
        <div className="profile-field">
          <label>Cân nặng:</label>
          <input
            type="number"
            value={profile.weight}
            onChange={(e) => setProfile({ ...profile, weight: +e.target.value })}
            placeholder="Cân nặng (kg)"
          />
        </div>

        {/* Môn thể thao */}
        <div className="profile-field">
          <label>Môn thể thao:</label>
          <input
            type="text"
            value={profile.sport}
            onChange={(e) => setProfile({ ...profile, sport: e.target.value })}
            placeholder="Môn thể thao"
          />
        </div>

        {/* Hoạt động thể chất */}
        <div className="profile-field">
          <label>Hoạt động thể chất:</label>
          <select
            value={profile.activity}
            onChange={(e) => setProfile({ ...profile, activity: e.target.value })}
          >
            <option value="Vừa phải (3-5 ngày/tuần)">Vừa phải (3-5 ngày/tuần)</option>
            <option value="Ít hoạt động (1-2 ngày/tuần)">Ít hoạt động (1-2 ngày/tuần)</option>
            <option value="Rất hoạt động (6-7 ngày/tuần)">Rất hoạt động (6-7 ngày/tuần)</option>
          </select>
        </div>

        {/* Mục tiêu */}
        <div className="profile-field">
          <label>Mục tiêu:</label>
          <select
            value={profile.goal}
            onChange={(e) => setProfile({ ...profile, goal: e.target.value })}
          >
            <option value="Duy trì cân nặng">Duy trì cân nặng</option>
            <option value="Giảm cân">Giảm cân</option>
            <option value="Tăng cơ">Tăng cơ</option>
          </select>
        </div>

        {/* Nút Lưu */}
        <div className="action-buttons">
          <button onClick={saveProfile}>Lưu hồ sơ</button>
        </div>
      </div>

      <div className="profile-right">
        <div className="profile-info">
          <img src="data:image/jpeg;base64,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" alt="Avatar" />
          <h3>{profile.name}</h3>
          <p>
            {profile.sex}, {profile.age} tuổi
          </p>
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