# Video Call & Real-Time Chat Setup

## Overview
The application now integrates WebRTC video calls with Socket.IO real-time messaging. All pages work with your mock API endpoints.

## Features Implemented

### 1. Video Call Link Generation (CreateLinkPage)
- Users can create a shareable video call link
- Calls API: `POST /compchat/api/calls/create` to generate a unique call ID
- Displays call link with share and copy options
- Connects to Socket.IO and joins the call room
- Routes to VideoCallLinkPage to start hosting

### 2. Join Call Link (JoinLinkPage)
- Guest users access `/join/{callId}`
- Automatically joins the call via API: `POST /compchat/api/calls/join`
- Shows host user profile with status
- Connects via Socket.IO
- Routes to VideoCallLinkPage to join active call

### 3. Video Call Interface (VideoCallLinkPage)
- Full WebRTC peer-to-peer video conferencing
- Features:
  - Local video preview (bottom-right corner with teal border)
  - Remote video display (full screen)
  - Toggle camera/microphone
  - Call duration timer
  - End call button
  - Real-time chat panel (toggle with button)
  - Copy link button
  - STUN servers for NAT traversal

#### WebRTC Implementation
- Automatic offer/answer exchange via Socket.IO
- ICE candidate exchange for connection establishment
- Handles connection state changes
- Graceful cleanup on disconnect

#### Real-Time Chat
- Messages displayed in side panel during call
- Socket.IO `sendMessage` event integration
- Shows sender name, timestamp, and message
- Text input with Enter key support

### 4. Chat Window Integration (ChatWindowPage)
- Socket.IO real-time messaging
- Joins chat room: `socket.emit("joinChat", { chatId })`
- Sends messages: `socket.emit("sendMessage", { chatId, message, senderId })`
- Receives incoming messages on "message" event
- One-click video call initiation from chat

## API Endpoints Used

### Calls
- **Create Call**: `POST http://localhost:4000/compchat/api/calls/create`
  - Response: `{ "success": true, "callId": "uuid" }`

- **Join Call**: `POST http://localhost:4000/compchat/api/calls/join`
  - Body: `{ "callId": "uuid", "user": "user123" }`

### Chats
- **Get Chats**: `GET http://localhost:4000/compchat/api/chats?userId=1`
  - Response: `[{"id": 1, "type": "private", "participants": [1, 2]}]`

- **Get Messages**: `GET http://localhost:4000/compchat/api/messages?chatId=1`
  - Response: `[{"id": 1, "chatId": 1, "senderId": 1, "body": "Hello"}]`

## Socket.IO Events

### WebRTC Events (Video Calls)
- `joinCall` - Join a call room
- `webrtc-offer` - Send SDP offer
- `webrtc-answer` - Send SDP answer
- `webrtc-ice` - Send ICE candidates
- `userJoined` - Another user joined (listen)
- `userLeft` - User left (listen)

### Chat Events
- `joinChat` - Join chat room
- `sendMessage` - Send message
- `message` - Receive message (listen)

## Testing Flow

### Host Creates Call
1. Login as Alice (user ID: 1)
2. Click link icon in header → Create Call
3. Shows call ID and shareable link
4. Click "Start Call & Wait"
5. Enters VideoCallLinkPage (awaiting guest)

### Guest Joins Call
1. Access `/join/{callId}` link
2. Shows Alice's profile
3. Click "Join Video Call"
4. WebRTC connection established automatically
5. Video exchange begins
6. Chat panel available to send messages

### During Call
- Toggle camera and microphone
- Send chat messages (no audio routing yet)
- View call duration
- Copy link to invite others
- End call returns to chats

## Browser Requirements
- WebRTC supported browser (Chrome, Firefox, Safari, Edge)
- HTTPS or localhost for getUserMedia access
- Microphone and camera permissions

## Mock Data
Users in system:
- 1: Alice Johnson
- 2: Bob Smith
- 3: Carol Williams
- 4: David Brown
- 5: Emma Davis

## File Structure
```
src/
├── pages/
│   ├── CreateLinkPage.tsx       # Create call link
│   ├── JoinLinkPage.tsx          # Join call link
│   ├── VideoCallLinkPage.tsx     # Full video call interface
│   └── ChatWindowPage.tsx        # Updated with Socket.IO
├── services/
│   ├── apiService.ts            # API calls
│   └── socketService.ts         # Socket.IO wrapper
└── App.tsx                        # Updated routes
```

## Running Locally

Ensure your backend is running on `http://localhost:4000/compchat/api` with:
- REST endpoints for calls and chats
- Socket.IO server for real-time events

Then start the app:
```bash
npm run dev
```

## Notes
- Service layer abstracts all API and Socket.IO calls
- Full TypeScript support with proper interfaces
- Clean separation of concerns
- Responsive design works on desktop and tablet
- Error handling for API failures
- Automatic socket reconnection
