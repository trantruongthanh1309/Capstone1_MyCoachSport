import { useState } from "react";
import "./Planner.css";

const samplePlan = [
  {
    day: "Thứ 2",
    meals: { sáng: "Ức gà + cơm gạo lứt", trưa: "Salad cá ngừ", tối: "Sữa chua Hy Lạp" },
    workouts: { sáng: "Chạy interval 4x5 phút", tối: "Hít đất 3x15" },
  },
  {
    day: "Thứ 3",
    meals: { sáng: "Trứng + yến mạch", trưa: "Thịt bò + khoai lang", tối: "Sinh tố protein" },
    workouts: { sáng: "Gym: Squat 4x8", tối: "Deadlift 4x6" },
  },
  {
    day: "Thứ 4",
    meals: { sáng: "Cơm + cá hồi", trưa: "Salad ức gà", tối: "Sữa ít béo" },
    workouts: { sáng: "Bơi 30 phút", tối: "Plank 3x60s" },
  },
  {
    day: "Thứ 5",
    meals: { sáng: "Ngũ cốc nguyên hạt", trưa: "Ức gà + khoai tây", tối: "Trái cây" },
    workouts: { sáng: "Cầu lông 1h", tối: "Jumping jack 3x50" },
  },
  {
    day: "Thứ 6",
    meals: { sáng: "Phở bò ít béo", trưa: "Cơm gạo lứt + thịt heo nạc", tối: "Rau củ luộc" },
    workouts: { sáng: "Bóng đá 90 phút", tối: "Stretching 15 phút" },
  },
  {
    day: "Thứ 7",
    meals: { sáng: "Trứng ốp + bánh mì đen", trưa: "Thịt gà + khoai lang", tối: "Chuối + whey" },
    workouts: { sáng: "Gym: Bench press 4x8", tối: "Pull up 3x10" },
  },
  {
    day: "Chủ nhật",
    meals: { sáng: "Bún chả ít mỡ", trưa: "Cơm cá thu", tối: "Súp rau củ" },
    workouts: { sáng: "Yoga 45 phút", tối: "Đi bộ 30 phút" },
  },
];

export default function Planner() {
  const [plan] = useState(samplePlan);

  return (
    <div className="p-6 space-y-10">
      <h1 className="text-3xl font-bold text-center text-cyan-700 animate-fadeIn">
        🗓️ Weekly Planner
      </h1>

      {/* Meal Plan */}
      <div className="animate-slideUp">
        <h2 className="text-xl font-semibold mb-4 text-cyan-600">🍽 Meal Plan</h2>
        <div className="overflow-x-auto">
          <table className="planner-table w-full border-collapse shadow-md">
            <thead>
              <tr>
                <th>Buổi</th>
                {plan.map((d, i) => (
                  <th key={i}>{d.day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {["sáng", "trưa", "tối"].map((mealKey, i) => (
                <tr key={i}>
                  <td className="font-semibold capitalize">{mealKey}</td>
                  {plan.map((d, j) => (
                    <td key={j} className="hover-cell">
                      {d.meals[mealKey]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Workout Plan */}
      <div className="animate-slideUp delay-200">
        <h2 className="text-xl font-semibold mb-4 text-indigo-600">🏋️ Workout Plan</h2>
        <div className="overflow-x-auto">
          <table className="planner-table w-full border-collapse shadow-md">
            <thead>
              <tr>
                <th>Buổi</th>
                {plan.map((d, i) => (
                  <th key={i}>{d.day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {["sáng", "tối"].map((workKey, i) => (
                <tr key={i}>
                  <td className="font-semibold capitalize">{workKey}</td>
                  {plan.map((d, j) => (
                    <td key={j} className="hover-cell">
                      {d.workouts[workKey]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
