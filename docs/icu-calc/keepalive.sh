#!/bin/bash
# Keep the ICU calculator preview reachable.
#
# The sandbox is paused/resumed between turns: files persist, processes do not.
# This watchdog respawns the preview server whenever it stops answering, so the
# live preview recovers on its own a few seconds after the sandbox wakes up.
PORT="${1:-8000}"
LOG=/tmp/serve-${PORT}.log

for pid in $(pgrep -f "serve.py ${PORT}"); do
  kill "$pid" 2>/dev/null
done
sleep 1

python3 /home/user/icu-calc/serve.py "$PORT" >>"$LOG" 2>&1 &
SRV=$!
echo "watchdog up (server pid $SRV, port $PORT, log $LOG)"

while true; do
  sleep 10
  if ! kill -0 "$SRV" 2>/dev/null; then
    python3 /home/user/icu-calc/serve.py "$PORT" >>"$LOG" 2>&1 &
    SRV=$!
    echo "$(date -Is) respawned server pid $SRV" >>"$LOG"
  fi
done
