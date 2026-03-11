# Git Workflow Skill

**Purpose:** Master version control and collaboration  
**Impact:** Never lose code, collaborate smoothly

---

## Essential Git Commands

### Daily Workflow
```bash
# Check status
git status

# Add files
git add .                    # Add all changes
git add file.ts              # Add specific file

# Commit
git commit -m "Add user authentication"

# Push to remote
git push origin main

# Pull latest changes
git pull origin main

# View commit history
git log --oneline
git log --graph --oneline --all
```

---

## Branch Management

### Create & Switch Branches
```bash
# Create new branch
git branch feature/user-auth

# Switch to branch
git checkout feature/user-auth

# Create and switch in one command
git checkout -b feature/new-feature

# List branches
git branch                   # Local branches
git branch -r                # Remote branches
git branch -a                # All branches

# Delete branch
git branch -d feature/old-feature
git branch -D feature/force-delete
```

### Merge Branches
```bash
# Switch to main
git checkout main

# Merge feature branch
git merge feature/user-auth

# Delete merged branch
git branch -d feature/user-auth
```

---

## Branching Strategy

### Git Flow
```
main          (production-ready)
  │
  ├── develop (integration branch)
  │     │
  │     ├── feature/login
  │     ├── feature/dashboard
  │     └── feature/reports
  │
  └── hotfix/critical-bug
```

### Simple Workflow
```bash
# Start new feature
git checkout main
git pull
git checkout -b feature/new-feature

# Work on feature
git add .
git commit -m "Implement new feature"

# Push for review
git push origin feature/new-feature

# Create Pull Request on GitHub/GitLab

# After approval, merge to main
git checkout main
git merge feature/new-feature
git push origin main

# Clean up
git branch -d feature/new-feature
git push origin --delete feature/new-feature
```

---

## Commit Best Practices

### Good Commit Messages
```bash
# ✅ GOOD
git commit -m "Add user authentication with JWT"
git commit -m "Fix memory leak in data processing"
git commit -m "Update dependencies to latest versions"

# ❌ BAD
git commit -m "changes"
git commit -m "fix"
git commit -m "updates"
```

### Conventional Commits
```bash
# Format: <type>: <description>

git commit -m "feat: add user registration"
git commit -m "fix: resolve login redirect issue"
git commit -m "docs: update API documentation"
git commit -m "refactor: simplify authentication logic"
git commit -m "test: add unit tests for auth service"
git commit -m "chore: update dependencies"
```

---

## Undoing Changes

### Before Commit
```bash
# Discard changes in file
git checkout -- file.ts

# Unstage file
git reset HEAD file.ts

# Discard all changes
git reset --hard HEAD
```

### After Commit
```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Revert commit (creates new commit)
git revert abc123
```

### Fix Last Commit
```bash
# Add forgotten files to last commit
git add forgotten-file.ts
git commit --amend --no-edit

# Change commit message
git commit --amend -m "New message"
```

---

## Stashing Changes

### Save Work in Progress
```bash
# Stash current changes
git stash

# Stash with message
git stash save "WIP: user profile feature"

# List stashes
git stash list

# Apply latest stash
git stash apply

# Apply specific stash
git stash apply stash@{1}

# Apply and remove stash
git stash pop

# Delete stash
git stash drop stash@{0}
```

---

## Remote Repositories

### Setup Remote
```bash
# Add remote
git remote add origin https://github.com/user/repo.git

# View remotes
git remote -v

# Change remote URL
git remote set-url origin https://github.com/user/new-repo.git

# Remove remote
git remote remove origin
```

### Fetch & Pull
```bash
# Fetch changes (don't merge)
git fetch origin

# Pull changes (fetch + merge)
git pull origin main

# Pull with rebase
git pull --rebase origin main
```

---

## Resolving Conflicts

### When Conflict Occurs
```bash
# 1. See conflicted files
git status

# 2. Open file and look for conflict markers
# <<<<<<< HEAD
# Your changes
# =======
# Their changes
# >>>>>>> branch-name

# 3. Edit file to resolve
# Remove markers, keep desired code

# 4. Mark as resolved
git add resolved-file.ts

# 5. Complete merge
git commit -m "Merge feature branch, resolve conflicts"
```

---

## Advanced Features

### Cherry Pick
```bash
# Apply specific commit from another branch
git cherry-pick abc123
```

### Rebase
```bash
# Rebase current branch onto main
git checkout feature-branch
git rebase main

# Interactive rebase (last 3 commits)
git rebase -i HEAD~3
```

### Tags
```bash
# Create tag
git tag v1.0.0

# Create annotated tag
git tag -a v1.0.0 -m "Release version 1.0.0"

# Push tags
git push origin v1.0.0
git push origin --tags

# List tags
git tag

# Delete tag
git tag -d v1.0.0
git push origin --delete v1.0.0
```

---

## Git Aliases

### Speed Up Workflow
```bash
# Add to ~/.gitconfig

[alias]
  st = status
  co = checkout
  br = branch
  ci = commit
  pl = pull
  ps = push
  last = log -1 HEAD
  unstage = reset HEAD --
  visual = log --graph --oneline --all
```

### Usage
```bash
git st              # Instead of git status
git co main         # Instead of git checkout main
git visual          # Pretty commit graph
```

---

## .gitignore

### Common Patterns
```gitignore
# Dependencies
node_modules/
vendor/

# Build outputs
dist/
build/
*.js.map

# Environment
.env
.env.local
.env.production

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Database
*.sqlite
*.db

# Uploads
uploads/
temp/
```

---

## GitHub Workflow

### Pull Request Process
```bash
# 1. Create feature branch
git checkout -b feature/awesome-feature

# 2. Make changes and commit
git add .
git commit -m "feat: add awesome feature"

# 3. Push to GitHub
git push origin feature/awesome-feature

# 4. Create Pull Request on GitHub
# - Add description
# - Request reviewers
# - Link related issues

# 5. Address review feedback
git add .
git commit -m "Address review comments"
git push origin feature/awesome-feature

# 6. Merge when approved
# (Usually done via GitHub UI)

# 7. Clean up local branch
git checkout main
git pull
git branch -d feature/awesome-feature
```

---

## Troubleshooting

### Common Issues

**Accidentally committed to main:**
```bash
# Move to new branch
git branch feature/new-branch
git reset --hard origin/main
git checkout feature/new-branch
```

**Pushed sensitive data:**
```bash
# Remove file from history
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch path/to/secret-file' \
  --prune-empty --tag-name-filter cat -- --all

# Force push
git push origin --force --all
```

**Wrong commit message:**
```bash
# Not pushed yet
git commit --amend -m "Correct message"

# Already pushed
git commit --amend -m "Correct message"
git push --force-with-lease
```

---

## Best Practices

### ✅ DO
- Commit often, push regularly
- Write clear commit messages
- Review changes before committing
- Use branches for features
- Pull before pushing
- Keep commits focused (one change per commit)
- Use .gitignore properly

### ❌ DON'T
- Commit sensitive data (.env files)
- Force push to main/shared branches
- Commit broken code
- Have huge commits (>1000 lines)
- Commit generated files
- Ignore merge conflicts

---

## Quick Reference

```bash
# Start new project
git init
git add .
git commit -m "Initial commit"
git remote add origin <url>
git push -u origin main

# Clone existing
git clone <url>
cd project
git checkout -b feature/my-feature

# Daily workflow
git status
git add .
git commit -m "Description"
git pull origin main
git push origin feature/my-feature

# Emergency rollback
git reset --hard HEAD~1
git push --force-with-lease
```

---

**Version control = peace of mind** 📦✨

---

_Git Workflow Skill by CLAWDY - 12 Feb 2026_
