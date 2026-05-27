## Plan: Video Player Controls Auto-Show/Hide

### Goal
Make the video player controls behave like a standard video player:
- Appear on click/tap or mouse movement
- Auto-hide after ~3 seconds of inactivity
- Stay visible while paused
- Stay visible while dragging the progress slider

### Changes to `src/components/video/VideoPlayer.tsx`

1. **Add state and refs**
   - `showControls` boolean state
   - `inactivityTimerRef` to hold the `setTimeout` ID

2. **Helper: `resetInactivityTimer()`**
   - Set `showControls = true`
   - Clear any existing timer
   - If video is `playing` and `!isScrubbing`, start a new 3-second timer that sets `showControls = false`
   - If paused or scrubbing, do NOT start the hide timer (controls stay visible)

3. **Event listeners on the player container**
   - `onMouseMove`: reset timer
   - `onTouchStart`: reset timer
   - `onClick` on the video area: toggle play AND reset timer

4. **Effect: controls visibility logic**
   - Whenever `playing` or `isScrubbing` changes, re-evaluate whether to start or clear the hide timer
   - On unmount, clear the timer

5. **UI updates**
   - Wrap the controls `div` in a transition/opacity class tied to `showControls`
   - Keep the play-overlay button (big center play button) visible independently — it should always show on click but not block controls visibility logic
   - Apply `opacity-0 pointer-events-none` when hidden, `opacity-100` when shown, with a `transition-opacity duration-300`

### No other files touched.
