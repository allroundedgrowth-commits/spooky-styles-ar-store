#!/bin/bash

# Spooky Wigs Store - Quick Start Script

echo "🎃 Starting Spooky Wigs Store..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start Docker containers
echo "1️⃣ Starting Docker containers..."
docker-compose up -d

# Wait for database to be ready
echo "2️⃣ Waiting for database to be ready..."
sleep 5

# Clear Redis cache
echo "3️⃣ Clearing Redis cache..."
docker exec spooky-styles-redis redis-cli FLUSHALL > /dev/null 2>&1

# Unlock admin account
echo "4️⃣ Unlocking admin account..."
docker exec spooky-styles-postgres psql -U spooky_user -d spooky_styles_db \
  -c "UPDATE users SET failed_login_attempts = 0, account_locked_until = NULL WHERE email = 'admin@spookystyles.com';" > /dev/null 2>&1

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Login Credentials:"
echo "   Admin: admin@spookystyles.com / admin123"
echo "   User:  test@example.com / password123"
echo ""
echo "🚀 Now run these commands in separate terminals:"
echo "   Terminal 1: npm run dev:backend"
echo "   Terminal 2: npm run dev:frontend"
echo ""
echo "🌐 Then open: http://localhost:5173"
echo ""
