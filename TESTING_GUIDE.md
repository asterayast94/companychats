# Testing Guide - Video Call & Real-Time Chat

## Prerequisites
1. Backend API running on `http://localhost:4000/compchat/api`
2. Socket.IO server running on `http://localhost:4000`
3. Two browsers or tabs for testing two users simultaneously

## Quick Start

### Step 1: Login
1. Open app at `http://localhost:3000`
2. Login as Alice (click Alice Johnson)
3. You'll see chat list

### Step 2: Create a Video Call Link
1. Click the link icon (⛓) in the top-right of header
2. App calls `/compchat/api/calls/create`
3. You'll see:
   - Call ID displayed
   - Shareable link
   - Copy and Share buttons
4. Click "Start Call & Wait"
5. VideoCallLinkPage opens with "Connecting..." state
6. Awaiting guest to join

### Step 3: Join Call as Guest
1. In a new tab, visit the link shown or: `http://localhost:3000/join/{callId}`
2. App calls `/compchat/api/calls/join`
3. Shows Alice's profile
4. Click "Join Video Call"
5. Automatic WebRTC connection
6. Both video streams established

### Step 4: Test Call Features

#### Video Controls
- Click camera icon: Toggles your video on/off
- Red icon = camera disabled
- Gray icon = camera enabled

#### Audio Controls
- Click microphone icon: Toggle audio
- Red icon = muted
- Gray icon = unmuted

#### Chat During Call
1. Click chat bubble icon (💬) in controls
2. Right panel appears
3. Type message and press Enter or click Send
4. Message appears with timestamp
5. Other user should see incoming message via Socket.IO

#### Call Duration
- Shows elapsed time in format MM:SS
- Updates every second

#### Copy Link
- Click copy icon (📋)
- Copies current call URL to clipboard
- Share with others

#### End Call
- Click red phone icon (🔴)
- Cleans up WebRTC connections
- Returns to chat list

## Testing Socket.IO Integration

### Messages Flow
1. During active call, open chat panel
2. Type: "Hello from Alice"
3. Send message
4. Event flow:
   - `socket.emit("sendMessage", {chatId, message, senderId})`
   - Backend broadcasts to room
   - `socket.on("message", ...)` receives
   - Message appears in chat

### WebRTC Flow
1. Host creates call (joins room)
2. Guest joins same room
3. Automatic WebRTC exchange:
   - Host creates offer
   - `socket.emit("webrtc-offer", ...)`
   - Guest receives via `socket.on("webrtc-offer", ...)`
   - Guest creates answer
   - `socket.emit("webrtc-answer", ...)`
   - ICE candidates exchanged
   - Video streams connect

## Test Cases

### ✓ Call Creation
- [ ] Call ID generates successfully
- [ ] Link includes call ID
- [ ] Copy link works
- [ ] Share button available

### ✓ Call Joining
- [ ] Guest link shows host profile
- [ ] Join successful
- [ ] No errors on console

### ✓ WebRTC Connection
- [ ] Local video appears on join
- [ ] Remote video appears after guest joins
- [ ] Video continues streaming
- [ ] Connection stable for 5+ seconds

### ✓ Camera/Microphone
- [ ] Toggle camera - video on/off
- [ ] Toggle microphone - button state changes
- [ ] Stays muted after toggle
- [ ] Tracks stay active

### ✓ Chat During Call
- [ ] Chat panel toggles
- [ ] Can type messages
- [ ] Messages send on Enter
- [ ] Timestamp shows correctly
- [ ] Other user receives messages

### ✓ Call Termination
- [ ] End call button works
- [ ] Returns to chat list
- [ ] WebRTC connections close
- [ ] No console errors

### ✓ Error Handling
- [ ] Missing camera permission - error shown
- [ ] Invalid call ID - redirects home
- [ ] Network disconnection - graceful handling
- [ ] Socket reconnection attempts

## Network Testing

### Test on Different Networks
1. Local network (same WiFi)
2. HTTPS tunneling (for real devices)
3. Different internet connections

### Using STUN Servers
- Built-in: `stun:stun.l.google.com:19302`
- Built-in: `stun:stun1.l.google.com:19302`
- No TURN server configured (requires external connection)

## Mobile Testing

### iOS Safari
1. Enable Camera access
2. Enable Microphone access
3. Video call should work
4. Chat should work

### Android Chrome
1. Grant permissions
2. Should work like desktop
3. Test landscape/portrait

## Performance Testing

### Metrics to Monitor
- WebRTC connection time
- Video frame rate
- Audio quality
- Chat latency
- Memory usage

### DevTools
1. Open Chrome DevTools (F12)
2. Network tab - monitor Socket.IO messages
3. Console - no errors during call
4. Performance - record call duration

## Common Issues

### No video appears
- Check camera permissions
- Check browser console for errors
- Verify hardware is working
- Try different browser

### No remote video
- Ensure other user's camera is on
- Check WebRTC connection state
- Look at Network tab for webrtc-offer/answer
- Check console for errors

### Chat messages not appearing
- Check Socket.IO connection
- Verify sendMessage events in Network tab
- Check backend receiving messages
- Ensure chatId is correct

### Call link doesn't work
- Verify callId in URL is valid
- Check API response from /calls/join
- Ensure backend is running
- Try fresh link generation

## Debugging

### Enable Detailed Logging
Edit `src/services/socketService.ts`:
```typescript
// Add detailed logging
socket.on('connect', () => {
  console.log('✓ Connected:', socket.id);
});

socket.on('webrtc-offer', (data) => {
  console.log('📨 Offer received:', data);
});
```

### Monitor Socket Events
1. Open DevTools
2. Network tab
3. Filter by WS (WebSocket)
4. Watch Socket.IO events

### Check API Responses
1. Network tab → XHR/Fetch
2. POST to /calls/create - should return callId
3. POST to /calls/join - should return success
4. GET messages/chats - should return data

## Cleanup

After testing, verify:
- [ ] All connections closed
- [ ] No orphaned streams
- [ ] No console errors
- [ ] No memory leaks
- [ ] Sockets disconnected
