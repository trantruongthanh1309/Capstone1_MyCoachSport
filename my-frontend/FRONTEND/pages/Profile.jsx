import { useState, useEffect } from "react";
import "./Profile.css";
import { useToast } from "../contexts/ToastContext";
import ImageUploader from "../components/ImageUploader";
import { validateName, validateAge, validateHeight, validateWeight } from "../utils/validation";

export default function Profile() {
  const toast = useToast();
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
    avatar: "https://scontent.fdad3-6.fna.fbcdn.net/v/t39.30808-6/502146546_1398928527897385_7313017022900260020_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeH4YsIHxcYTMqx2z1giIot1-wWF3OqloOX7BYXc6qWg5djHXbAsMzwKd7ZNYlGPlStCnZjUBYnvCCQAKtMEliqS&_nc_ohc=mDibpFMF-hAQ7kNvwFnj7gZ&_nc_oc=AdlrVnC7KepvDk-8dc3WSouO7dp_CvLKA3RnKOYiuJbv7yZdMKv0udKzHf7nRBK_jetdXBwOmAPmPQCzke3siUN1&_nc_zt=23&_nc_ht=scontent.fdad3-6.fna&_nc_gid=HVl7nfmhRBwnwoq09Z2-_g&oh=00_AfifDlVn8smWIsDLmmLqfZSBOBENrEVhVUM4NBwYcxAwKA&oe=690D6F68"
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!userId) return;

    fetch("/api/profile", {
      method: "GET",
      credentials: "include",
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
            activity: data.Activity || "Vừa phải (3-5 ngày/tuần)",
            avatar: data.Avatar || profile.avatar
          });
        } else {
          console.warn("Lỗi:", data.error);
        }
      })
      .catch((err) => console.warn("Error fetching profile:", err));
  }, [userId]);

  const saveProfile = () => {
    console.log("Lưu hồ sơ đang được gọi...");

    if (!userId || userId === "null" || userId === "undefined") {
      toast.error("❌ Không tìm thấy user_id. Vui lòng nhập ID hoặc đăng nhập.");
      return;
    }

    // Validate form fields
    const nameValidation = validateName(profile.name);
    if (!nameValidation.valid) {
      toast.error(`❌ ${nameValidation.message}`);
      return;
    }

    const ageValidation = validateAge(profile.age);
    if (!ageValidation.valid) {
      toast.error(`❌ ${ageValidation.message}`);
      return;
    }

    const heightValidation = validateHeight(profile.height);
    if (!heightValidation.valid) {
      toast.error(`❌ ${heightValidation.message}`);
      return;
    }

    const weightValidation = validateWeight(profile.weight);
    if (!weightValidation.valid) {
      toast.error(`❌ ${weightValidation.message}`);
      return;
    }

    const sessions = profile.activity.includes("6-7")
      ? 6
      : profile.activity.includes("1-2")
        ? 2
        : 4;

    console.log("Saving profile with data:", profile);

    fetch(`/api/profile/${userId}`, {
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
        avatar: profile.avatar
      }),
    })
      .then((res) => {
        console.log("Server response:", res);
        return res.json();
      })
      .then((data) => {
        console.log("✅ Kết quả từ server:", data);
        toast.success(data.message || "✅ Hồ sơ đã được lưu!");
        setIsEditing(false);
      })
      .catch((err) => {
        console.error("❌ Lỗi khi gửi request:", err);
        toast.error("❌ Có lỗi xảy ra khi lưu hồ sơ.");
      });
  };

  const handleAvatarUpload = (url) => {
    setProfile({ ...profile, avatar: url });
  };

  const bmi = (profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1);
  const tdee = Math.round(
    (10 * profile.weight +
      6.25 * profile.height -
      5 * profile.age +
      (profile.sex === "Nam" ? 5 : -161)) *
    1.55
  );

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { category: 'Thiếu cân', color: 'yellow' };
    if (bmi < 25) return { category: 'Bình thường', color: 'green' };
    if (bmi < 30) return { category: 'Thừa cân', color: 'orange' };
    return { category: 'Béo phì', color: 'red' };
  };

  const bmiInfo = getBMICategory(parseFloat(bmi));

  return (
    <div className="profile-wrapper">
      <div className="profile-container">

        { }
        <div className="profile-left">
          <div className="user-profile-header">
            <h1 className="user-profile-title">Hồ Sơ Cá Nhân</h1>
            <div className="profile-subtitle">Quản lý thông tin của bạn</div>
          </div>

          { }
          <div className="avatar-section">
            <div className="avatar-box">
              <img
                src={profile.avatar}
                alt="Avatar"
                className="avatar"
              />
              <div className="avatar-ring"></div>
            </div>
            {isEditing && (
              <div className="mt-4">
                <ImageUploader onUploadSuccess={handleAvatarUpload} />
              </div>
            )}
            <h3 className="avatar-name">{profile.name}</h3>
            <p className="avatar-info">{profile.sex}, {profile.age} tuổi</p>
          </div>

          { }
          <div className="form-section">

            { }
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">🆔</span>
                User ID
              </label>
              <input
                type="number"
                value={userId}
                onChange={(e) => {
                  setUserId(e.target.value);
                  localStorage.setItem("user_id", e.target.value);
                }}
                placeholder="Nhập User ID"
                className="form-input"
                disabled={!isEditing}
              />
            </div>

            { }
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">👤</span>
                Tên người dùng
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Họ và tên"
                className="form-input"
                disabled={!isEditing}
              />
            </div>

            { }
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">🎂</span>
                  Tuổi
                </label>
                <input
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: +e.target.value })}
                  placeholder="Tuổi"
                  className="form-input"
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">⚧</span>
                  Giới tính
                </label>
                <select
                  value={profile.sex}
                  onChange={(e) => setProfile({ ...profile, sex: e.target.value })}
                  className="form-input form-select"
                  disabled={!isEditing}
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>
            </div>

            { }
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">⚖️</span>
                  Cân nặng (kg)
                </label>
                <input
                  type="number"
                  value={profile.weight}
                  onChange={(e) => setProfile({ ...profile, weight: +e.target.value })}
                  placeholder="Cân nặng"
                  className="form-input"
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">📏</span>
                  Chiều cao (cm)
                </label>
                <input
                  type="number"
                  value={profile.height}
                  onChange={(e) => setProfile({ ...profile, height: +e.target.value })}
                  placeholder="Chiều cao"
                  className="form-input"
                  disabled={!isEditing}
                />
              </div>
            </div>

            { }
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">⚽</span>
                Môn thể thao
              </label>
              <select
                value={profile.sport}
                onChange={(e) => setProfile({ ...profile, sport: e.target.value })}
                className="form-input form-select"
                disabled={!isEditing}
              >
                <option value="">-- Chọn môn thể thao --</option>
                <option value="Bóng đá">⚽ Bóng đá</option>
                <option value="Bóng rổ">🏀 Bóng rổ</option>
                <option value="Gym">🏋️ Gym/Thể hình</option>
                <option value="Chạy bộ">🏃 Chạy bộ</option>
                <option value="Bơi lội">🏊 Bơi lội</option>
                <option value="Yoga">🧘 Yoga</option>
                <option value="Cầu lông">🏸 Cầu lông</option>
                <option value="Tennis">🎾 Tennis</option>
                <option value="Bóng chuyền">🏐 Bóng chuyền</option>
                <option value="Boxing">🥊 Boxing</option>
                <option value="Đạp xe">🚴 Đạp xe</option>
                <option value="Cardio">❤️ Cardio</option>
                <option value="Pilates">🧘 Pilates</option>
                <option value="Bóng bàn">🏓 Bóng bàn</option>
                <option value="Võ thuật">🥋 Võ thuật</option>
                <option value="Khác">🎯 Khác</option>
              </select>
            </div>

            { }
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">⚡</span>
                Hoạt động thể chất
              </label>
              <select
                value={profile.activity}
                onChange={(e) => setProfile({ ...profile, activity: e.target.value })}
                className="form-input form-select"
                disabled={!isEditing}
              >
                <option value="Vừa phải (3-5 ngày/tuần)">Vừa phải (3-5 ngày/tuần)</option>
                <option value="Ít hoạt động (1-2 ngày/tuần)">Ít hoạt động (1-2 ngày/tuần)</option>
                <option value="Rất hoạt động (6-7 ngày/tuần)">Rất hoạt động (6-7 ngày/tuần)</option>
              </select>
            </div>

            { }
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">🎯</span>
                Mục tiêu
              </label>
              <select
                value={profile.goal}
                onChange={(e) => setProfile({ ...profile, goal: e.target.value })}
                className="form-input form-select"
                disabled={!isEditing}
              >
                <option value="Duy trì cân nặng">Duy trì cân nặng</option>
                <option value="Giảm cân">Giảm cân</option>
                <option value="Tăng cơ">Tăng cơ</option>
              </select>
            </div>

            { }
            <div className="button-group">
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="btn btn-edit">
                  <span className="btn-icon">✏️</span>
                  Chỉnh sửa
                </button>
              ) : (
                <>
                  <button onClick={saveProfile} className="btn btn-save">
                    <span className="btn-icon">✅</span>
                    Lưu hồ sơ
                  </button>
                  <button onClick={() => setIsEditing(false)} className="btn btn-cancel">
                    <span className="btn-icon">❌</span>
                    Hủy
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        { }
        <div className="profile-right">
          <div className="stats-header">
            <h2 className="stats-title">
              <span className="stats-icon">📊</span>
              Thông Tin Sức Khỏe
            </h2>
          </div>

          { }
          <div className="user-stat-card bmi-card">
            <div className="stat-card-header">
              <h3 className="stat-card-title">
                <span className="card-icon">📈</span>
                Chỉ số BMI
              </h3>
            </div>
            <div className="stat-value-wrapper">
              <div className="stat-value">{bmi}</div>
              <div className={`stat-badge badge-${bmiInfo.color}`}>
                {bmiInfo.category}
              </div>
            </div>
            <div className="bmi-scale">
              <div className="bmi-bar">
                <div
                  className="bmi-indicator"
                  style={{ left: `${Math.min(Math.max((parseFloat(bmi) / 40) * 100, 0), 100)}%` }}
                ></div>
              </div>
              <div className="user-bmi-labels">
                <span>Thiếu</span>
                <span>Chuẩn</span>
                <span>Thừa</span>
                <span>Béo</span>
              </div>
            </div>
          </div>

          { }
          <div className="user-stat-card tdee-card">
            <div className="stat-card-header">
              <h3 className="stat-card-title">
                <span className="card-icon">🔥</span>
                TDEE
              </h3>
            </div>
            <div className="stat-value-wrapper">
              <div className="stat-value">{tdee}</div>
              <div className="stat-unit">kcal/ngày</div>
            </div>
            <div className="tdee-breakdown">
              <div className="tdee-item">
                <span className="tdee-label">
                  <span className="tdee-icon">📉</span>
                  Giảm cân
                </span>
                <span className="tdee-value">{tdee - 500} kcal</span>
              </div>
              <div className="tdee-item tdee-maintain">
                <span className="tdee-label">
                  <span className="tdee-icon">➡️</span>
                  Duy trì
                </span>
                <span className="tdee-value">{tdee} kcal</span>
              </div>
              <div className="tdee-item">
                <span className="tdee-label">
                  <span className="tdee-icon">📈</span>
                  Tăng cơ
                </span>
                <span className="tdee-value">{tdee + 500} kcal</span>
              </div>
            </div>
          </div>

          { }
          <div className="user-info-card">
            <h4 className="info-title">
              <span className="info-icon">📝</span>
              Thông Tin Chi Tiết
            </h4>
            <div className="info-list">
              <div className="info-item">
                <span className="info-label">Chiều cao:</span>
                <span className="info-value">{profile.height} cm</span>
              </div>
              <div className="info-item">
                <span className="info-label">Cân nặng:</span>
                <span className="info-value">{profile.weight} kg</span>
              </div>
              <div className="info-item">
                <span className="info-label">Môn thể thao:</span>
                <span className="info-value">{profile.sport}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Mục tiêu:</span>
                <span className="info-value">{profile.goal}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}