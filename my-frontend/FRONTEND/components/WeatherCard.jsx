import { useState, useEffect } from "react";

export default function WeatherCard() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch(`/api/weather?city=Hanoi,vn`)
      .then(r => r.json()).then(setData)
      .catch(() => setData({ error: "Không tải được thời tiết" }));
  }, []);
  if (!data) return <p>⏳ Đang tải...</p>;
  if (data.error) return <p>⚠️ {data.error}</p>;
  return (
    <div className="flex gap-4 items-center bg-white p-4 rounded shadow max-w-md mx-auto">
      <img src={`https://openweathermap.org/img/wn/${data.icon}@2x.png`} alt="weather"/>
      <div>
        <h2 className="text-lg font-bold text-cyan-600">{data.city}</h2>
        <p>{data.description}</p>
        <p>🌡 {data.temp}°C (cảm giác {data.feels_like}°C)</p>
        <p>💧 {data.humidity}% | 💨 {data.wind} m/s</p>
      </div>
    </div>
  );
}
