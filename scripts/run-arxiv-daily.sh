#!/bin/bash
# 每日 arXiv 论文推荐 — 本地 cron 脚本
# 使用本地已登录的 Claude Code agent，无需 API key
#
# crontab 示例 (每天下午4点运行):
#   0 16 * * * /Users/linzhihao/Library/Mobile\ Documents/com~apple~CloudDocs/myblog/mathieu0905.github.io/scripts/run-arxiv-daily.sh >> /tmp/arxiv-daily.log 2>&1

set -euo pipefail

# cron 环境 PATH 很精简，显式加上 node 和 claude 路径
export PATH="/Users/linzhihao/.nvm/versions/node/v22.18.0/bin:/Users/linzhihao/.local/bin:$PATH"

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_DIR"

echo ""
echo "=========================================="
echo "arXiv Daily Runner — $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================="

# Step 1: 检查是否已有今天的文章
TODAY=$(date +%Y-%m-%d)
POST_FILE="src/content/posts/arxiv-daily-${TODAY}.md"
if [ -f "$POST_FILE" ]; then
  echo "[skip] Today's post already exists: $POST_FILE"
  exit 0
fi

# Step 2: 拉取 arXiv 论文
echo "[1/4] Fetching arXiv papers..."
node scripts/daily-arxiv.mjs

# Step 3: 用 Claude Code agent 生成博客文章
echo "[2/4] Running Claude Code agent..."
claude -p "$(cat scripts/arxiv-agent-prompt.md)" \
  --allowedTools "Read,Write,Bash(rm .arxiv-today.txt)"

# Step 4: 清理临时文件
rm -f .arxiv-today.txt

# Step 5: 提交并推送
echo "[3/4] Committing..."
if [ -f "$POST_FILE" ]; then
  git add "$POST_FILE"
  git commit -m "docs: add daily arXiv paper recommendations ${TODAY}"
  echo "[4/4] Pushing..."
  git push
  echo "[done] Published: $POST_FILE"
else
  echo "[error] Claude agent did not create $POST_FILE"
  exit 1
fi
