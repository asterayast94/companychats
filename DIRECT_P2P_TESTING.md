# Direct P2P Video Call Testing Guide

## What Changed
The app now works with **fixed room IDs** instead of calling a backend API. This allows true peer-to-peer testing without API dependency.

## How It Works

### Room ID Format
- Format: `room-{userId}-{timestamp}`
- Example: `room-1-1732000000000`
- Users can share or manually enter room IDs to join calls

### Direct P2P Connection
1. Two users join the same room (via Socket.IO)
2. WebRTC peer connection negotiates automatically
3. Offer/Answer/ICE candidates exchanged through Socket.IO
4. Direct video/audio streams established

## Testing Scenarios

### Scenario 1: Host Creates & Guest Joins (Same Browser/Device)

**Host:**
1. Login as Alice (or any user)
2. Click link icon → "Video Call" page loads
3. See your Room ID (e.g., `room-1-1732000000000`)
4. Click "Start Hosting Call"
5. VideoCallLinkPage opens - shows "Connecting..."
6. Waits for guest

**Guest (in new tab/window):**
1. Open app in new tab
2. Login as Bob (different user)
3. Click link icon → "Video Call" page loads
4. Click "Join Other Call"
5. Paste or type Host's Room ID
6. Click "Join Call"
7. Auto-redirects to VideoCallLinkPage
8. Connection established automatically!

### Scenario 2: Manual Room ID Entry

1. Host creates call, gets Room ID: `room-1-1732000000000`
2. Guest opens "Join Other Call" dialog
3. Types: `room-1-1732000000000`
4. Clicks "Join Call"
5. P2P connection established

### Scenario 3: Share via Link

1. Host creates call
2. Clicks "Share Link" button
3. Link format: `/video-call/room-1-1732000000000`
4. Guest clicks link
5. Auto-detects room ID from URL
6. Joins call automatically

## Testing on Different Networks

### Local Testing (Same WiFi)
- Works out of box
- Both users same network
- Direct peer connection

### IP Address Testing (Coming Soon)
- Can pass user's local IP address
- Format might be: `room-{userId}@{ipAddress}`
- Enables testing across different networks locally

### Production (Different Networks)
- STUN servers handle NAT
- Configured: `stun.l.google.com`, `stun1.l.google.com`
- Automatic fallback if direct connection fails

## WebRTC Troubleshooting

### "Connecting..." doesn't resolve
1. Check Browser Console (F12) for errors
2. Verify Socket.IO is connected
3. Both users in same room? Check Room IDs match
4. Try refreshing page

### No video appears
1. Grant camera/microphone permissions
2. Check both users have cameras enabled (toggle buttons)
3. Verify hardware is plugged in
4. Try different browser

### Audio works but no video
1. Check camera is enabled (not toggled off)
2. Verify permission granted
3. Hardware might be in use elsewhere
4. Try closing other video apps

### Video frozen or laggy
1. Check network connection
2. Reduce resolution: lower bandwidth needed
3. Try fewer browser tabs open
4. Verify no other apps using bandwidth

## Room ID Sharing Methods

### Method 1: Copy Room ID
1. Click copy button on call screen
2. Share Room ID via any app (email, chat, etc.)
3. Recipient enters in "Join Other Call" dialog

### Method 2: Share Link (Mobile/Desktop)
1. Click "Share Link" button
2. Uses native share dialog (if available)
3. Automatically includes full URL

### Method 3: QR Code (Future)
- Generate QR code of link
- Scan with mobile device
- Auto-opens call

## Console Debugging

Open DevTools (F12) and check console for:

```
✓ Connected: <socket-id>           // Socket.IO connected
📨 Offer received: {...}           // WebRTC offer
📨 Answer received: {...}          // WebRTC answer
✓ Remote track received            // Video stream incoming
Connection state: connected        // P2P established
```

## Socket.IO Events (Observable)

Watch Network tab (F12) → WS filter:
- `joinCall` - User enters room
- `webrtc-offer` - Send video offer
- `webrtc-answer` - Send video answer
- `webrtc-ice` - Send connection candidates
- `message` - Chat messages

## Testing Checklist

- [ ] Room ID generates on call creation
- [ ] Copy Room ID button works
- [ ] Join dialog accepts Room ID
- [ ] Navigation to call works
- [ ] "Connecting..." shows briefly
- [ ] Local video appears
- [ ] Remote video appears (when 2nd user joins)
- [ ] Camera toggle works
- [ ] Microphone toggle works
- [ ] Call duration counter increments
- [ ] Chat panel opens/closes
- [ ] Messages send in chat
- [ ] Other user receives messages
- [ ] Copy button copies room ID
- [ ] End call button returns to chat list

## Files Modified

```
src/pages/
├── CreateLinkPage.tsx          (Generate room, join dialog)
├── JoinLinkPage.tsx            (Simplified redirect)
└── VideoCallLinkPage.tsx       (Direct P2P, Socket.IO)

src/App.tsx                      (Routes)
```

## No API Calls Required

✓ No `/compchat/api/calls/create` needed
✓ No `/compchat/api/calls/join` needed
✓ Only Socket.IO for WebRTC negotiation
✓ Works fully offline (except remote peer)

## Next Steps

1. Test with two users on same device
2. Test with two browsers/tabs
3. Try different room IDs
4. Test chat during call
5. Test video toggle on/off
6. Test audio toggle mute/unmute
7. Once working: Add IP address support
8. Then: Add backend API integration when ready
