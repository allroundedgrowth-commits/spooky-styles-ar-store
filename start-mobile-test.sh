#!/bin/bash

echo "========================================"
echo "Starting Spooky Wigs - Mobile Test Mode"
echo "========================================"
echo ""
echo "This will start the frontend with HTTPS enabled"
echo "for mobile camera testing."
echo ""
echo "IMPORTANT: You'll need to accept the security"
echo "warning on your mobile device."
echo ""

# Get local IP address
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    IP=$(ipconfig getifaddr en0)
    if [ -z "$IP" ]; then
        IP=$(ipconfig getifaddr en1)
    fi
else
    # Linux
    IP=$(hostname -I | awk '{print $1}')
fi

echo "========================================"
echo "Your local IP: $IP"
echo "========================================"
echo ""
echo "On your phone, navigate to:"
echo "https://$IP:5173"
echo ""
echo "Then accept the security warning and"
echo "grant camera permissions when prompted."
echo ""
echo "Press Enter to start the server..."
read

cd frontend
VITE_HTTPS=true npm run dev
