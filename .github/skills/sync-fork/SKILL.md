---
name: sync-fork
description: Sync this fork with upstream markszulc/frescopa26 while keeping local config files and never pushing to upstream. Use when asked to sync, update, or pull in upstream changes.
---

# Sync fork with upstream

Run these steps in order and stop if any step fails.

1. Run `git status`. If the working tree is dirty, stop and tell me.
2. Confirm the `upstream` remote exists with `git remote -v`. If not, add it: `git remote add upstream https://github.com/markszulc/frescopa26.git`.
3. Confirm `git config merge.ours.driver` returns `true`. If not, set it.
4. Run `git fetch upstream`, then `git merge upstream/main`.
5. If the merge stops on conflicts, list the conflicted files and ask me before resolving anything. Do not use `-X ours` or `-X theirs`.
6. After a clean merge, run `git diff ORIG_HEAD HEAD --stat` and show me which files upstream changed. Flag any file listed in .gitattributes.
7. Push with `git push origin main`. Never push to or open a pull request against upstream.