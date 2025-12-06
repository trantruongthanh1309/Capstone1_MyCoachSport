import { useState, useEffect } from 'react';
import './DailyBriefingModal.css';

export default function DailyBriefingModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [plan, setPlan] = useState({ meals: [], workouts: [] });
    const [loading, setLoading] = useState(true);
    const [currentPhase, setCurrentPhase] = useState("morning");

    const getUserId = () => {
        const stored = localStorage.getItem('user_id');
        return stored ? parseInt(stored) : 18;
    };

    useEffect(() => {
        console.log('🔔 DailyBriefingModal mounted!');

        const determinePhase = () => {
            const hour = new Date().getHours();
            console.log('⏰ Current hour:', hour);
            if (hour >= 5 && hour < 10) return "morning";
            if (hour >= 10 && hour < 14) return "noon";
            if (hour >= 14 && hour < 17) return "afternoon";
            return "evening";
        };
        const phase = determinePhase();
        setCurrentPhase(phase);
        console.log('📅 Current phase:', phase);

        const fetchTodayPlan = async () => {
            try {
                const userId = getUserId();
                const today = new Date().toISOString().split('T')[0];
                console.log('📡 Fetching schedule for user:', userId, 'date:', today);

                const res = await fetch(
                    `http://localhost:5000/api/ai/schedule?user_id=${userId}&date=${today}`,
                    { credentials: 'include' }
                );
                const data = await res.json();

                console.log('📦 API Response:', data);

                if (data && data.schedule) {
                    const meals = data.schedule.filter(item => item.type === 'meal');
                    const workouts = data.schedule.filter(item => item.type === 'workout');

                    console.log('🍽️ Meals found:', meals.length);
                    console.log('🏋️ Workouts found:', workouts.length);

                    setPlan({ meals, workouts });
                    setIsOpen(true);
                    console.log('✅ Modal should now be visible!');
                } else {
                    console.warn('⚠️ No schedule data received');
                    setIsOpen(true);
                }
            } catch (err) {
                console.error("❌ Error fetching daily briefing:", err);
                setIsOpen(true);
            } finally {
                setLoading(false);
            }
        };

        fetchTodayPlan();
    }, []);

    if (!isOpen) {
        return null;
    }

    const getPhaseContent = () => {
        console.log('📊 Full plan data:', plan);
        console.log('🍽️ Total meals:', plan.meals?.length || 0);
        console.log('🏋️ Total workouts:', plan.workouts?.length || 0);

        let message = "";
        let relevantMeals = [];
        let relevantWorkouts = [];

        if (currentPhase === 'morning') {
            message = "Chào ngày mới! Sáng nay";
            relevantMeals = plan.meals.filter(m => {
                const type = m.data?.MealType?.toLowerCase();
                console.log('🌅 Morning meal check:', m.data?.Name, 'Type:', type);
                return type === 'morning' || type === 'breakfast';
            });
            relevantWorkouts = plan.workouts.filter(w => {
                const time = w.time?.toLowerCase();
                return time === 'morning_slot' || time === 'morning';
            });
        }
        else if (currentPhase === 'noon') {
            message = "Đã đến giờ trưa! Trưa nay";
            relevantMeals = plan.meals.filter(m => {
                const type = m.data?.MealType?.toLowerCase();
                console.log('☀️ Noon meal check:', m.data?.Name, 'Type:', type);
                return type === 'afternoon' || type === 'lunch' || type === 'noon';
            });
            relevantWorkouts = plan.workouts.filter(w => {
                const time = w.time?.toLowerCase();
                return time === 'afternoon_slot' || time === 'noon';
            });
        }
        else if (currentPhase === 'afternoon') {
            message = "Cố lên! Chiều nay";
            relevantMeals = plan.meals.filter(m => {
                const type = m.data?.MealType?.toLowerCase();
                return type === 'afternoon' || type === 'snack';
            });
            relevantWorkouts = plan.workouts.filter(w => {
                const time = w.time?.toLowerCase();
                return time === 'afternoon_slot' || time === 'evening_slot';
            });
        }
        else {
            message = "Buổi tối thư giãn! Tối nay";
            relevantMeals = plan.meals.filter(m => {
                const type = m.data?.MealType?.toLowerCase();
                console.log('🌙 Evening meal check:', m.data?.Name, 'Type:', type);
                return type === 'evening' || type === 'dinner';
            });
            relevantWorkouts = plan.workouts.filter(w => {
                const time = w.time?.toLowerCase();
                return time === 'evening_slot' || time === 'evening';
            });
        }

        console.log(`✅ Filtered for ${currentPhase}: ${relevantMeals.length} meals, ${relevantWorkouts.length} workouts`);

        return {
            message,
            meals: relevantMeals,
            workouts: relevantWorkouts
        };
    };

    const content = getPhaseContent();

    return (
        <div className="daily-briefing-overlay">
            <div className="daily-briefing-content featured">
                <div className={`daily-briefing-header phase-${currentPhase}`}>
                    <h2>{content.message}</h2>
                    <p className="phase-subtitle">
                        {currentPhase === 'morning' && "🌅 Sáng nay"}
                        {currentPhase === 'noon' && "☀️ Trưa nay"}
                        {currentPhase === 'afternoon' && "🌤️ Chiều nay"}
                        {currentPhase === 'evening' && "🌙 Tối nay"}
                    </p>
                </div>

                <div className="daily-briefing-body">
                    {content.workouts.length > 0 && (
                        <div className="briefing-section highlight">
                            <div className="section-title">
                                <span className="emoji">🏋️‍♂️</span>
                                <span>Tập Luyện</span>
                            </div>
                            <div className="item-list">
                                {content.workouts.map((item, index) => (
                                    <div key={index} className="briefing-item workout featured-item">
                                        <div className="item-icon">💪</div>
                                        <div className="item-details">
                                            <div className="item-name">{item.data?.Name || 'N/A'}</div>
                                            <div className="item-subtext">
                                                {item.data?.Duration_min || 0} phút • {item.data?.Intensity || 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {content.meals.length > 0 && (
                        <div className="briefing-section highlight">
                            <div className="section-title">
                                <span className="emoji">🍽️</span>
                                <span>Dinh Dưỡng</span>
                            </div>
                            <div className="item-list">
                                {content.meals.map((item, index) => (
                                    <div key={index} className="briefing-item meal featured-item">
                                        <div className="item-icon">🥗</div>
                                        <div className="item-details">
                                            <div className="item-name">{item.data?.Name || 'N/A'}</div>
                                            <div className="item-subtext">
                                                {item.data?.Kcal || 0} kcal • {item.data?.Protein || 0}g Protein
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {content.meals.length === 0 && content.workouts.length === 0 && (
                        <div className="empty-state">
                            <p>Không có hoạt động cụ thể nào cho khung giờ này.</p>
                            <p className="sub-empty">Hãy kiểm tra toàn bộ lịch trình trong Planner nhé!</p>
                        </div>
                    )}
                </div>

                <div className="daily-briefing-footer">
                    <button className="btn-briefing-close" onClick={() => setIsOpen(false)}>
                        Đã rõ, cảm ơn!
                    </button>
                    <button className="btn-briefing-view-all" onClick={() => window.location.href = '/planner'}>
                        Xem cả ngày 👉
                    </button>
                </div>
            </div>
        </div>
    );
}
