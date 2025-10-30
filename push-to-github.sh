#!/bin/bash

# News-AI GitHub Push Script
# This script will help you push your code to GitHub

echo "========================================="
echo "News-AI GitHub Push Helper"
echo "========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "README.md" ] || [ ! -f "SUMMARY.md" ]; then
    echo "❌ Error: Please run this script from the News AI project directory"
    exit 1
fi

echo "✅ Current directory is correct"
echo ""

# Check if remote is set
if git remote get-url origin > /dev/null 2>&1; then
    echo "✅ GitHub remote is already configured:"
    git remote get-url origin
else
    echo "Setting up GitHub remote..."
    git remote add origin https://github.com/sandrodevidze31-alt/NewsAI.git
    echo "✅ Remote added"
fi

echo ""
echo "========================================="
echo "Ready to push to GitHub!"
echo "========================================="
echo ""
echo "When prompted:"
echo "  Username: sandrodevidze31-alt"
echo "  Password: <your GitHub Personal Access Token>"
echo ""
echo "Don't have a token? Get one here:"
echo "👉 https://github.com/settings/tokens/new"
echo "   (Check 'repo' scope and generate)"
echo ""
read -p "Press Enter when you're ready to push..."

# Push to GitHub
echo ""
echo "Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================="
    echo "🎉 SUCCESS!"
    echo "========================================="
    echo ""
    echo "Your code is now on GitHub:"
    echo "👉 https://github.com/sandrodevidze31-alt/NewsAI"
    echo ""
    echo "Next steps:"
    echo "1. Visit your repository"
    echo "2. Create API accounts (see SETUP_ACCOUNTS.md)"
    echo "3. Follow QUICKSTART.md to get it running"
    echo ""
else
    echo ""
    echo "========================================="
    echo "❌ Push failed"
    echo "========================================="
    echo ""
    echo "Common solutions:"
    echo "1. Make sure you used your Personal Access Token (not password)"
    echo "2. Token must have 'repo' scope"
    echo "3. Try: git config --global credential.helper osxkeychain"
    echo "   Then run this script again"
    echo ""
fi
