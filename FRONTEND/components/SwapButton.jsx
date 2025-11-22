import { useState } from "react";
import "../pages/PlannerEnhanced.css";

/**
 * SwapButton Component - Nút đổi món ăn/bài tập TỰ ĐỘNG
 * Tìm món có calo/intensity tương tự và đổi ngay
 */
export default function SwapButton({ item, type, onSwapSuccess }) {
    const [swapping, setSwapping] = useState(false);

    const handleSwap = async () => {
        setSwapping(true);

        try {
            // Bước 1: Tìm món thay thế tự động
            let endpoint = "";
            let currentValue = 0;

            if (type === "meal") {
                currentValue = item.data.Kcal || 0;
                // Tìm món có calo tương tự (±50 kcal)
                const minKcal = currentValue - 50;
                const maxKcal = currentValue + 50;
                endpoint = `http://localhost:5000/api/meals?meal_type=${item.data.MealType}&min_kcal=${minKcal}&max_kcal=${maxKcal}`;
            } else {
                // Tìm bài tập cùng intensity
                endpoint = `http://localhost:5000/api/workouts?intensity=${item.data.Intensity}`;
            }

            const res = await fetch(endpoint, { credentials: "include" });
            const data = await res.json();

            // Lọc bỏ món hiện tại và chọn ngẫu nhiên 1 món
            const alternatives = data.filter(option => option.Id !== item.data.Id);

            if (alternatives.length === 0) {
                alert("❌ Không tìm thấy món thay thế phù hợp!");
                setSwapping(false);
                return;
            }

            // Chọn ngẫu nhiên 1 món
            const randomIndex = Math.floor(Math.random() * alternatives.length);
            const selectedOption = alternatives[randomIndex];

            // Bước 2: Gọi API swap
            const swapEndpoint = "http://localhost:5000/api/ai/swap";
            const payload = {
                user_id: 18, // TODO: Lấy từ context/props
                date: item.date,
                old_item_id: item.data.Id,
                new_item_id: selectedOption.Id,
                type: type
            };

            const swapRes = await fetch(swapEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                credentials: "include"
            });

            if (swapRes.ok) {
                // Thông báo thành công với thông tin món mới
                if (type === "meal") {
                    alert(`✅ Đã đổi thành công!\n\n` +
                        `Món cũ: ${item.data.Name} (${item.data.Kcal} kcal)\n` +
                        `Món mới: ${selectedOption.Name} (${selectedOption.Kcal} kcal)\n\n` +
                        `Chênh lệch: ${Math.abs(selectedOption.Kcal - item.data.Kcal)} kcal`);
                } else {
                    alert(`✅ Đã đổi thành công!\n\n` +
                        `Bài tập cũ: ${item.data.Name}\n` +
                        `Bài tập mới: ${selectedOption.Name}\n` +
                        `Cùng cường độ: ${selectedOption.Intensity}`);
                }

                // Reload lịch
                if (onSwapSuccess) onSwapSuccess();
            } else {
                throw new Error("Swap failed");
            }
        } catch (error) {
            console.error("Error swapping:", error);
            alert("❌ Đổi món thất bại. Vui lòng thử lại!");
        } finally {
            setSwapping(false);
        }
    };

    return (
        <button
            className={`action-btn swap-btn ${swapping ? 'swapping' : ''}`}
            onClick={handleSwap}
            title={type === "meal" ? "Đổi món có calo tương tự" : "Đổi bài tập cùng cường độ"}
            disabled={swapping}
        >
            {swapping ? '⏳' : '🔄'}
        </button>
    );
}
