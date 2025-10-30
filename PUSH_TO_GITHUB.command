#!/bin/bash

# Navigate to project directory
cd "$(dirname "$0")"

# Set up git credentials
git config credential.helper store

# Push to GitHub (will ask for username and token once)
git push -u origin main

# Check if successful
if [ $? -eq 0 ]; then
    osascript -e 'display dialog "✅ SUCCESS! Your code is now on GitHub!\n\nhttps://github.com/sandrodevidze31-alt/NewsAI" buttons {"OK"} default button "OK" with icon note'
else
    osascript -e 'display dialog "❌ Push failed. Please check your credentials." buttons {"OK"} default button "OK" with icon stop'
fi

# Keep window open
read -p "Press Enter to close..."
