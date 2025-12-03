// src/lib/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:4000"; // your backend runs on 4000

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
});

// Optional: debug
socket.onAny((event, ...args) => {
  console.log(`Socket Event → ${event}`, args);
});