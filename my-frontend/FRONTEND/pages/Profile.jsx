import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Profile.css";
import { useToast } from "../contexts/ToastContext";
import ImageUploader from "../components/ImageUploader";
import { validateName, validateAge, validateHeight, validateWeight } from "../utils/validation";

export default function Profile() {
  const { userId: urlUserId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const currentUserId = localStorage.getItem("user_id");
  
  // Nếu có userId trong URL thì dùng, không thì dùng current user
  const [userId, setUserId] = useState(urlUserId || currentUserId || "");
  const [isViewingOtherProfile, setIsViewingOtherProfile] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [profile, setProfile] = useState({
    name: "Người Dùng",
    sex: "Nam",
    age: 30,
    height: 170,
    weight: 70,
    activity: "Vừa phải (3-5 ngày/tuần)",
    goal: "Duy trì cân nặng",
    sport: "Bóng đá",
    email: "",
    avatar: "https://ui-avatars.com/api/?name=User&size=200&background=667eea&color=fff"
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Update userId nếu có trong URL
    if (urlUserId) {
      setUserId(urlUserId);
      setIsViewingOtherProfile(urlUserId !== currentUserId);
      setIsOwnProfile(urlUserId === currentUserId);
    } else {
      setIsViewingOtherProfile(false);
      setIsOwnProfile(true);
    }
  }, [urlUserId, currentUserId]);

  useEffect(() => {
    if (!userId) return;

    const apiUrl = isViewingOtherProfile 
      ? `/api/profile/${userId}` 
      : "/api/profile";

    fetch(apiUrl, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          // Lấy privacy settings từ response
          const privacy = data.privacy || {};
          const showProgress = privacy.showProgress !== false; // Default true
          const showEmail = privacy.showEmail !== false; // Default true (khi xem profile chính mình)
          
          setProfile({
            name: data.Name,
            sex: data.Sex || (isViewingOtherProfile && !showProgress ? "Không hiển thị" : ""),
            age: data.Age || (isViewingOtherProfile && !showProgress ? null : 0),
            height: data.Height_cm || (isViewingOtherProfile && !showProgress ? null : 0),
            weight: data.Weight_kg || (isViewingOtherProfile && !showProgress ? null : 0),
            sport: data.Sport || "",
            goal: data.Goal || (isViewingOtherProfile && !showProgress ? "Không hiển thị" : ""),
            activity: data.Activity || "Vừa phải (3-5 ngày/tuần)",
            email: data.Email || (isViewingOtherProfile && !showEmail ? null : ""),  // Email sẽ là null nếu showEmail = false
            avatar: data.Avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.Name || 'User')}&size=200&background=667eea&color=fff`,
            showProgress: showProgress,  // Lưu để dùng trong render
            showEmail: showEmail
          });
          setIsOwnProfile(data.is_own_profile !== false);
        } else {
          console.warn("Lỗi:", data.error);
          if (data.error === "Hồ sơ này ở chế độ riêng tư") {
            toast.error("🔒 Hồ sơ này ở chế độ riêng tư");
            navigate("/profile");
          } else {
            toast.error(`❌ ${data.error}`);
          }
        }
      })
      .catch((err) => {
        console.warn("Error fetching profile:", err);
        toast.error("❌ Lỗi khi tải hồ sơ");
      });
  }, [userId, isViewingOtherProfile, navigate, toast]);

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
        
        // Refresh lại profile từ server để hiển thị dữ liệu mới nhất
        const apiUrl = isViewingOtherProfile 
          ? `/api/profile/${userId}` 
          : "/api/profile";
        
        fetch(apiUrl, {
          method: "GET",
          credentials: "include",
        })
          .then((res) => res.json())
          .then((refreshData) => {
            if (!refreshData.error) {
              const privacy = refreshData.privacy || {};
              const showProgress = privacy.showProgress !== false;
              const showEmail = privacy.showEmail !== false;
              
              setProfile({
                name: refreshData.Name,
                sex: refreshData.Sex || (isViewingOtherProfile && !showProgress ? "Không hiển thị" : ""),
                age: refreshData.Age || (isViewingOtherProfile && !showProgress ? null : 0),
                height: refreshData.Height_cm || (isViewingOtherProfile && !showProgress ? null : 0),
                weight: refreshData.Weight_kg || (isViewingOtherProfile && !showProgress ? null : 0),
                sport: refreshData.Sport || "",
                goal: refreshData.Goal || (isViewingOtherProfile && !showProgress ? "Không hiển thị" : ""),
                activity: refreshData.Activity || "Vừa phải (3-5 ngày/tuần)",
                email: refreshData.Email || (isViewingOtherProfile && !showEmail ? null : ""),
                avatar: refreshData.Avatar || profile.avatar,
                showProgress: showProgress,
                showEmail: showEmail
              });
              
              // Cập nhật localStorage để Navbar cũng hiển thị đúng
              if (refreshData.Name) localStorage.setItem('user_name', refreshData.Name);
              if (refreshData.Email) localStorage.setItem('user_email', refreshData.Email);
              if (refreshData.Avatar) localStorage.setItem('user_avatar', refreshData.Avatar);
              
              console.log("✅ Đã refresh profile sau khi lưu");
            }
          })
          .catch((err) => {
            console.error("❌ Lỗi khi refresh profile:", err);
          });
      })
      .catch((err) => {
        console.error("❌ Lỗi khi gửi request:", err);
        toast.error("❌ Có lỗi xảy ra khi lưu hồ sơ.");
      });
  };

  const handleAvatarUpload = async (url) => {
    console.log('🖼️ Avatar upload success, URL:', url);
    
    // Cập nhật ngay lập tức để UI refresh
    setProfile(prev => ({ ...prev, avatar: url }));
    
    // Cập nhật localStorage để Navbar cũng cập nhật ngay
    if (url) {
      localStorage.setItem('user_avatar', url);
      console.log('🖼️ Updated localStorage with avatar:', url);
    }
    
    // Tự động lưu profile với avatar mới
    if (userId && userId !== "null" && userId !== "undefined") {
      console.log('🖼️ Auto-saving profile with new avatar...');
      const sessions = profile.activity.includes("6-7")
        ? 6
        : profile.activity.includes("1-2")
          ? 2
          : 4;
      
      try {
        const res = await fetch(`/api/profile/${userId}`, {
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
            avatar: url  // Dùng URL mới từ upload
          }),
        });
        
        const data = await res.json();
        console.log('🖼️ Profile saved with new avatar:', data);
        
        // Refresh lại profile từ server để đảm bảo đồng bộ
        const apiUrl = isViewingOtherProfile 
          ? `/api/profile/${userId}` 
          : "/api/profile";
        
        fetch(apiUrl, {
          method: "GET",
          credentials: "include",
        })
          .then((res) => res.json())
          .then((refreshData) => {
            if (!refreshData.error) {
              const privacy = refreshData.privacy || {};
              const showProgress = privacy.showProgress !== false;
              const showEmail = privacy.showEmail !== false;
              
              setProfile({
                name: refreshData.Name,
                sex: refreshData.Sex || (isViewingOtherProfile && !showProgress ? "Không hiển thị" : ""),
                age: refreshData.Age || (isViewingOtherProfile && !showProgress ? null : 0),
                height: refreshData.Height_cm || (isViewingOtherProfile && !showProgress ? null : 0),
                weight: refreshData.Weight_kg || (isViewingOtherProfile && !showProgress ? null : 0),
                sport: refreshData.Sport || "",
                goal: refreshData.Goal || (isViewingOtherProfile && !showProgress ? "Không hiển thị" : ""),
                activity: refreshData.Activity || "Vừa phải (3-5 ngày/tuần)",
                email: refreshData.Email || (isViewingOtherProfile && !showEmail ? null : ""),
                avatar: refreshData.Avatar || url,  // Đảm bảo dùng avatar mới
                showProgress: showProgress,
                showEmail: showEmail
              });
              
              // Cập nhật lại localStorage
              if (refreshData.Avatar) {
                localStorage.setItem('user_avatar', refreshData.Avatar);
              }
              
              console.log('✅ Profile refreshed with new avatar');
            }
          })
          .catch((err) => {
            console.error('❌ Error refreshing profile:', err);
          });
      } catch (err) {
        console.error('❌ Error saving profile with new avatar:', err);
      }
    }
  };

  // Tính BMI và TDEE chỉ khi có đủ thông tin và được phép hiển thị
  const canShowProgress = isOwnProfile || profile.showProgress !== false;
  const hasProgressData = profile.weight && profile.height && profile.age;
  
  const bmi = (hasProgressData && canShowProgress) 
    ? (profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1)
    : null;
    
  const tdee = (hasProgressData && canShowProgress)
    ? Math.round(
        (10 * profile.weight +
          6.25 * profile.height -
          5 * profile.age +
          (profile.sex === "Nam" ? 5 : -161)) *
        1.55
      )
    : null;

  const getBMICategory = (bmi) => {
    if (!bmi) return { category: 'Không có dữ liệu', color: 'gray' };
    if (bmi < 18.5) return { category: 'Thiếu cân', color: 'yellow' };
    if (bmi < 25) return { category: 'Bình thường', color: 'green' };
    if (bmi < 30) return { category: 'Thừa cân', color: 'orange' };
    return { category: 'Béo phì', color: 'red' };
  };

  const bmiInfo = bmi ? getBMICategory(parseFloat(bmi)) : { category: 'Không hiển thị', color: 'gray' };

  return (
    <div className="profile-wrapper">
      <div className="profile-container">
        <div className="profile-left">
          <div className="user-profile-header">
            <h1 className="user-profile-title">
              {isOwnProfile ? "Hồ Sơ Cá Nhân" : `Hồ Sơ của ${profile.name}`}
            </h1>
            <div className="profile-subtitle">
              {isOwnProfile ? "Quản lý thông tin của bạn" : "Xem thông tin người dùng"}
            </div>
          </div>

          <div className="avatar-section">
            <div className="avatar-box">
              <img
                key={profile.avatar} // Force re-render khi avatar thay đổi
                src={profile.avatar}
                alt="Avatar"
                className="avatar"
                onError={(e) => {
                  // Nếu ảnh không load được (403, 404, etc.), dùng placeholder
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'User')}&size=200&background=667eea&color=fff`;
                }}
              />
              <div className="avatar-ring"></div>
              {isEditing && isOwnProfile && (
                <div className="avatar-edit-overlay" title="Click để đổi ảnh đại diện">
                  <span className="avatar-edit-icon">📷</span>
                </div>
              )}
            </div>
            {isEditing && isOwnProfile && (
              <div className="mt-4" style={{ width: '100%' }}>
                <ImageUploader onUploadSuccess={handleAvatarUpload} />
              </div>
            )}
            <h3 className="avatar-name">{profile.name}</h3>
            <p className="avatar-info">
              {canShowProgress && profile.sex && profile.age 
                ? `${profile.sex}, ${profile.age} tuổi` 
                : canShowProgress 
                  ? "Thông tin không đầy đủ"
                  : "Thông tin riêng tư"}
            </p>
          </div>

          <div className="form-section">

            {isOwnProfile && (
              <>
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
                    disabled={!isEditing || !isOwnProfile}
                  />
                </div>
              </>
            )}

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
                disabled={!isEditing || !isOwnProfile}
              />
            </div>

            {canShowProgress && (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">🎂</span>
                    Tuổi
                  </label>
                  <input
                    type="number"
                    value={profile.age || ''}
                    onChange={(e) => setProfile({ ...profile, age: +e.target.value })}
                    placeholder="Tuổi"
                    className="form-input"
                    disabled={!isEditing || !isOwnProfile}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">⚧</span>
                    Giới tính
                  </label>
                  <select
                    value={profile.sex || ''}
                    onChange={(e) => setProfile({ ...profile, sex: e.target.value })}
                    className="form-input form-select"
                    disabled={!isEditing || !isOwnProfile}
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
              </div>
            )}

            {canShowProgress && (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">⚖️</span>
                    Cân nặng (kg)
                  </label>
                  <input
                    type="number"
                    value={profile.weight || ''}
                    onChange={(e) => setProfile({ ...profile, weight: +e.target.value })}
                    placeholder="Cân nặng"
                    className="form-input"
                    disabled={!isEditing || !isOwnProfile}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">📏</span>
                    Chiều cao (cm)
                  </label>
                  <input
                    type="number"
                    value={profile.height || ''}
                    onChange={(e) => setProfile({ ...profile, height: +e.target.value })}
                    placeholder="Chiều cao"
                    className="form-input"
                    disabled={!isEditing || !isOwnProfile}
                  />
                </div>
              </div>
            )}

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

            {canShowProgress && (
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">🎯</span>
                Mục tiêu
              </label>
              <select
                value={profile.goal || ''}
                onChange={(e) => setProfile({ ...profile, goal: e.target.value })}
                className="form-input form-select"
                disabled={!isEditing || !isOwnProfile}
              >
                <option value="Duy trì cân nặng">Duy trì cân nặng</option>
                <option value="Giảm cân">Giảm cân</option>
                <option value="Tăng cơ">Tăng cơ</option>
              </select>
            </div>
            )}

            {isOwnProfile && (
              <>
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
              </>
            )}
          </div>
        </div>

        <div className="profile-right">
          <div className="stats-header">
            <h2 className="stats-title">
              <span className="stats-icon">📊</span>
              Thông Tin Sức Khỏe
            </h2>
          </div>

          {canShowProgress && bmi && (
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
          )}

          {canShowProgress && tdee && (
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
          )}

          {!canShowProgress && (
            <div className="user-stat-card" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔒</div>
              <p style={{ fontSize: '1.1rem', margin: 0 }}>Thông tin tiến độ đã được ẩn</p>
            </div>
          )}

          <div className="user-info-card">
            <h4 className="info-title">
              <span className="info-icon">📝</span>
              Thông Tin Chi Tiết
            </h4>
            <div className="info-list">
              {((isOwnProfile || profile.showEmail) && profile.email) && (
                <div className="info-item">
                  <span className="info-label">📧 Email:</span>
                  <span className="info-value">{profile.email}</span>
                </div>
              )}
              {canShowProgress && profile.height && (
                <div className="info-item">
                  <span className="info-label">Chiều cao:</span>
                  <span className="info-value">{profile.height} cm</span>
                </div>
              )}
              {canShowProgress && profile.weight && (
                <div className="info-item">
                  <span className="info-label">Cân nặng:</span>
                  <span className="info-value">{profile.weight} kg</span>
                </div>
              )}
              {profile.sport && (
                <div className="info-item">
                  <span className="info-label">Môn thể thao:</span>
                  <span className="info-value">{profile.sport}</span>
                </div>
              )}
              {canShowProgress && profile.goal && (
                <div className="info-item">
                  <span className="info-label">Mục tiêu:</span>
                  <span className="info-value">{profile.goal}</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}