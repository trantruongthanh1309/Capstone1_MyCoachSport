import { useState } from "react";
const API_BASE = "http://localhost:5000";

export default function ChatBox() {
  const [msg, setMsg] = useState("");
  const [log, setLog] = useState([]);

  const send = async () => {
    const content = msg.trim();
    if (!content) return;
    setLog(l => [...l, { who: "you", text: content }]);
    setMsg("");
    try {
      const r = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content })
      });
      const j = await r.json();
      setLog(l => [...l, { who: "bot", text: j.reply || "⚠️ Lỗi server" }]);
    } catch {
      setLog(l => [...l, { who: "bot", text: "❌ Backend error" }]);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-6">
      <h3 className="font-bold mb-2">💬 Chatbot</h3>
      <div className="border h-48 overflow-y-auto p-2 mb-2 bg-gray-50">
        {log.map((m, i) => (
          <div key={i} className={m.who === "you" ? "text-right" : "text-left"}>
            {m.text}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input className="border flex-1 p-2"
          value={msg}
          onChange={e => setMsg(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}/>
        <button onClick={send} className="bg-cyan-500 text-white px-3">Gửi</button>
      </div>
    </div>
  );
}
