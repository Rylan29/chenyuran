---
name: github-push
description: Commit and push the current repo to GitHub over SSH. Use when the user asks to publish, commit and push, deploy to GitHub, or sync code to a GitHub remote. Do not use for Gitee or other git hosts.
---

# GitHub Push

Commit the current repository state and push to GitHub. This skill handles the common Chinese-network failure mode where port 22 is blocked and SSH must fall back to `ssh.github.com:443`.

## Flow

1. **Environment probe** (PowerShell):
   ```powershell
   cd <repo-path>
   git rev-parse --is-inside-work-tree
   git status --short
   git remote -v
   git config user.name
   git config user.email
   ```
   Also probe network:
   ```powershell
   Test-NetConnection github.com -Port 22 -WarningAction SilentlyContinue | Select TcpTestSucceeded
   Test-NetConnection github.com -Port 443 -WarningAction SilentlyContinue | Select TcpTestSucceeded
   ```
   If 22 fails but 443 succeeds → SSH over 443 (see below).
   If both fail → report to user that GitHub is unreachable.

2. **SSH over 443 fallback** (once per machine):
   ```powershell
   git config --global url."ssh://git@ssh.github.com:443/".insteadOf "git@github.com:"
   ```
   This rewrites every `git@github.com:owner/repo.git` URL to `ssh://git@ssh.github.com:443/owner/repo.git` transparently. Verify with:
   ```powershell
   ssh -T -p 443 -i "$HOME/.ssh/id_ed25519" git@ssh.github.com
   # expected: Hi <username>! You've successfully authenticated
   ```

3. **Set remote**:
   - If `origin` points elsewhere (e.g. Gitee): `git remote set-url origin git@github.com:<owner>/<repo>.git`
   - If no remote: `git remote add origin git@github.com:<owner>/<repo>.git`
   - Confirm the target repo exists via `https://api.github.com/repos/<owner>/<repo>` before push.

4. **Stage + commit**:
   ```powershell
   git add -A
   git status --short        # show user what will be committed
   git commit -m "feat: <summary>"
   ```
   If nothing changed, skip commit and inform the user.

5. **Push**:
   ```powershell
   git push -u origin main   # or the current branch
   ```
   The `insteadOf` rewrite makes this go through `ssh.github.com:443` automatically.

6. **Verify**:
   ```powershell
   git log --oneline -1
   ```
   Return the commit hash and the GitHub repo URL.

## Common failures

| Symptom | Cause | Fix |
|---|---|---|
| `Bad owner or permissions on ~/.ssh/config` | Windows SSH config ACL is corrupted | Re-create `.ssh/config` fresh; do NOT try to patch-in GitHub entries — write the full file in one go via `Out-File -Encoding ASCII -Force` |
| `Connection refused` on port 22 | ISP/GFW block SSH | Set the `insteadOf` rewrite above — do NOT edit `.ssh/config` (it is fragile on Windows) |
| `Permission denied (publickey)` | Key not bound to GitHub | User must add the `.pub` key at https://github.com/settings/keys |
| `remote contains work that you do not have` | Remote had prior commits | `git pull --rebase origin main` then push |
| `credential` prompts on HTTPS remote | No SSH, using HTTPS | Either switch to SSH with this skill, or let GitHub CLI / Git Credential Manager handle it |

## Notes

- Do NOT print or echo any token, PAT, or private key content.
- The `insteadOf` rewrite is global and persistent; only run it once per machine.
- If `~/.ssh/config` is missing or corrupt, skip editing it entirely and rely on the `git config --global url.*.insteadOf` rewrite — this is more robust on Windows than manipulating file ACLs.
- When pushing to a **brand new** empty repo, `git push -u origin main` must be used (not just `git push`).
