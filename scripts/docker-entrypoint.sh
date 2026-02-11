#!/bin/sh
set -e

echo "🚀 Starting NestJS Messaging API..."

# Wait for DynamoDB to be ready (only in development)
if [ "$NODE_ENV" = "development" ]; then
  echo "⏳ Waiting for DynamoDB Local to be ready..."
  
  # Simple wait with timeout
  timeout=30
  elapsed=0
  
  until curl -s http://dynamodb-local:8000 > /dev/null 2>&1 || [ $elapsed -eq $timeout ]; do
    echo "⏳ Waiting for DynamoDB... ($elapsed/$timeout seconds)"
    sleep 2
    elapsed=$((elapsed + 2))
  done
  
  if [ $elapsed -eq $timeout ]; then
    echo "❌ DynamoDB Local did not start in time"
    exit 1
  fi
  
  echo "✅ DynamoDB Local is ready!"
  
  # Create tables
  echo "📦 Creating DynamoDB tables..."
  node scripts/create-dynamodb-tables.js
  
  if [ $? -eq 0 ]; then
    echo "✅ Tables created successfully!"
  else
    echo "⚠️  Failed to create tables, but continuing..."
  fi
fi

# Start the application
echo "🎉 Starting application..."
exec node dist/src/main.js