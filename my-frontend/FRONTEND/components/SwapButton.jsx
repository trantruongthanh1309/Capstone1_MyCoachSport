import { useState } from "react";
import { useToast } from "../contexts/ToastContext";
import "../pages/PlannerEnhanced.css";

export default function SwapButton({ item, type, onSwapSuccess, userId }) {
    const [swapping, setSwapping] = useState(false);
    const toast = useToast();

    const handleSwap = async () => {
        setSwapping(true);

        try {
            let suggestEndpoint = "";
            let payload = {};

            if (type === "meal") {
                suggestEndpoint = "http://localhost:5000/api/smart-swap/suggest-meal";
                payload = {
                    user_id: userId,
                    current_meal_id: item.data.Id,
                    time_slot: item.data.MealType  // morning, afternoon, evening
                };
            } else {
                suggestEndpoint = "http://localhost:5000/api/smart-swap/suggest-workout";
                payload = {
                    user_id: userId,
                    current_workout_id: item.data.Id
                };
            }

            const suggestRes = await fetch(suggestEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                credentials: "include"
            });

            if (!suggestRes.ok) {
                throw new Error("Failed to get suggestions");
            }

            const suggestData = await suggestRes.json();
            const suggestions = suggestData.suggestions || [];

            if (suggestions.length === 0) {
                toast.error("Không tìm thấy món thay thế phù hợp với profile của bạn!");
                setSwapping(false);
                return;
            }

            const selectedOption = suggestions[0];

            const swapEndpoint = "http://localhost:5000/api/ai/swap";
            const swapPayload = {
                user_id: userId,
                date: item.date,
                old_item_id: item.data.Id,
                new_item_id: selectedOption.Id,
                type: type
            };
            
            // Thêm slot cho meal để backend biết swap đúng meal (morning/afternoon/evening)
            if (type === "meal" && item.data.MealType) {
                swapPayload.slot = item.data.MealType; // morning, afternoon, evening
            }

            const swapRes = await fetch(swapEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(swapPayload),
                credentials: "include"
            });

            if (swapRes.ok) {
                if (type === "meal") {
                    const kcalDiff = selectedOption.kcal_diff || Math.abs(selectedOption.Kcal - item.data.Kcal);
                    const message = `Đã đổi thành công!\n\n` +
                        `Món cũ: ${item.data.Name} (${item.data.Kcal} kcal)\n` +
                        `Món mới: ${selectedOption.Name} (${selectedOption.Kcal} kcal)\n\n` +
                        `Chênh lệch: ${kcalDiff} kcal\n` +
                        `Score phù hợp: ${selectedOption.score}/100`;
                    toast.success(message, 5000);
                } else {
                    const message = `Đã đổi thành công!\n\n` +
                        `Bài tập cũ: ${item.data.Name}\n` +
                        `Bài tập mới: ${selectedOption.Name}\n` +
                        `Cùng cường độ: ${selectedOption.Intensity}\n` +
                        `Score phù hợp: ${selectedOption.score}/100`;
                    toast.success(message, 5000);
                }

                if (onSwapSuccess) onSwapSuccess();
            } else {
                const errorData = await swapRes.json();
                console.error("Swap API error:", errorData);
                toast.error(`Đổi món thất bại: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error("Error swapping:", error);
            toast.error(`Đổi món thất bại: ${error.message}`);
        } finally {
            setSwapping(false);
        }
    };

    return (
        <button
            className={`action-btn swap-btn ${swapping ? 'swapping' : ''}`}
            onClick={handleSwap}
            title={type === "meal" ? "Đổi món thông minh theo profile" : "Đổi bài tập phù hợp"}
            disabled={swapping}
        >
            {swapping ? '⏳' : '🔄'}
        </button>
    );
}
