#!/bin/bash
# Auto-PR: stages, commits, and opens a PR after every Claude prompt.
# Requires GITHUB_TOKEN in environment (set in .claude/settings.local.json env section).

REPO="joelgabatin/abcmi-website"
BASE_BRANCH="main"

# ── 1. Nothing to do? ────────────────────────────────────────────────────────
if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
  exit 0
fi

# ── 2. Token check ───────────────────────────────────────────────────────────
if [ -z "$GITHUB_TOKEN" ]; then
  echo '{"systemMessage":"⚠️  Auto-PR skipped: add GITHUB_TOKEN to .claude/settings.local.json env section"}'
  exit 0
fi

# ── 3. Stage all changes ─────────────────────────────────────────────────────
git add -A

# ── 4. Build a commit message from changed files ─────────────────────────────
CHANGED_FILES=$(git diff --cached --name-only)
FILE_COUNT=$(echo "$CHANGED_FILES" | grep -c .)
FIRST_FILE=$(echo "$CHANGED_FILES" | head -1)

if [ "$FILE_COUNT" -le 1 ]; then
  COMMIT_MSG="Claude: update $FIRST_FILE"
else
  EXTRA=$(( FILE_COUNT - 1 ))
  COMMIT_MSG="Claude: update $FIRST_FILE and $EXTRA other file(s)"
fi

# ── 5. Create a timestamped feature branch ───────────────────────────────────
BRANCH="claude/auto-$(date +%Y%m%d-%H%M%S)"
git checkout -b "$BRANCH" 2>/dev/null

# ── 6. Commit ────────────────────────────────────────────────────────────────
git commit -m "$COMMIT_MSG" 2>/dev/null

# ── 7. Push ──────────────────────────────────────────────────────────────────
git push origin "$BRANCH" 2>/dev/null

if [ $? -ne 0 ]; then
  git checkout "$BASE_BRANCH" 2>/dev/null
  echo '{"systemMessage":"⚠️  Auto-PR: push failed. Check your git credentials."}'
  exit 0
fi

# ── 8. Build PR body ─────────────────────────────────────────────────────────
FILE_LIST=$(echo "$CHANGED_FILES" | sed 's/^/- /' | tr '\n' '\\n')
PR_BODY="Auto-created by Claude Code after prompt completion.\\n\\n**Changed files:**\\n${FILE_LIST}"

# ── 9. Create PR via GitHub REST API ─────────────────────────────────────────
RESPONSE=$(curl -s -X POST \
  "https://api.github.com/repos/$REPO/pulls" \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"$COMMIT_MSG\",\"body\":\"$PR_BODY\",\"head\":\"$BRANCH\",\"base\":\"$BASE_BRANCH\"}")

PR_URL=$(echo "$RESPONSE" | grep -o '"html_url":"[^"]*"' | grep 'pull' | head -1 | sed 's/"html_url":"//;s/"//')

# ── 10. Return to main ───────────────────────────────────────────────────────
git checkout "$BASE_BRANCH" 2>/dev/null

# ── 11. Report result ────────────────────────────────────────────────────────
if [ -n "$PR_URL" ]; then
  echo "{\"systemMessage\":\"✅ PR created: $PR_URL\"}"
else
  ERROR=$(echo "$RESPONSE" | grep -o '"message":"[^"]*"' | head -1 | sed 's/"message":"//;s/"//')
  echo "{\"systemMessage\":\"⚠️  Auto-PR: GitHub API error — $ERROR\"}"
fi
