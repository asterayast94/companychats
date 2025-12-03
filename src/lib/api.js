// src/lib/api.js
const API_BASE = "http://localhost:4000/compchat/api";

export const api = {
  createCall: () => fetch(`${API_BASE}/calls/create`, { method: "POST" }).then(r => r.json()),
  joinCall: (callId, user) =>
    fetch(`${API_BASE}/calls/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callId, user }),
    }).then(r => r.json()),
  endCall: (callId) =>
    fetch(`${API_BASE}/calls/end/${callId}`, { method: "DELETE" }).then(r => r.json()),
};