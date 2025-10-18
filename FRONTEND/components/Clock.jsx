import { useState, useEffect } from "react";

export default function Clock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="my-4 text-center">
      <div className="text-3xl font-bold">{now.toLocaleTimeString("vi-VN")}</div>
      <div>
        {now.toLocaleDateString("vi-VN", {
          weekday: "long", year: "numeric", month: "long", day: "numeric"
        })}
      </div>
    </div>
  );
}
