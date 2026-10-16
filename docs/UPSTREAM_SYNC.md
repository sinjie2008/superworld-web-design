# Frontend upstream synchronization

Visual and approved standalone behavior belong to `codex/product-api-integration`. WordPress-specific code belongs to `codex/wordpress-elementor-foundation`. Never push, reset or force-push the source branch. The backend reference `plan/public-product-api-v1` is read-only and is not merged into this repository.

## Recorded baseline

| Checkpoint | Source SHA | Outcome |
|---|---|---|
| Initial foundation | `921e44e098419baa5a6f1b463355f44cb50617d1` | Latest source fetched. Remote target did not exist, so target was created from this exact commit. Existing local `work` branch was preserved. No merge conflicts. |

Backend contract inspected at `c10faf4b5314668f7695a9c138a8e9333bee469d`. The initial implementation adds `superworld-core/`, integration documents and a project-memory note. Original standalone application code, dependency declarations, lockfile and tracked Worker stay unchanged relative to the recorded source.

Migrated component adaptation: the series-table behavior from `src/app/product-pages.js` now has a WordPress-specific `PartsTable` implementation with per-root state, server-rendered dynamic fields and WordPress REST transport. It does not import the SPA router, global ProductPages registry or hardcoded product fields. Full seven-column production page layout and other original pages are not migrated. Future table/search/selection fixes must be compared with this component, not copied blindly. The shared marketing JS is inventoried in `JS_COMPONENT_MAP.md` for later migration.

Verification at this checkpoint: original production build, diagnostics exclusion and 20-route artifact/lifecycle/HTML validation pass in an external disposable copy; plugin PHP/JS/WordPress/browser outcomes are recorded in `TESTING.md`. No source branch write or backend edit was performed.

Final safe fetch: `origin/codex/product-api-integration` still points to the recorded SHA; incoming commit count is zero, so no merge/adaptation was needed during this implementation. Main review caught and fixed scoped shortcode navigation. Browser proof caught and fixed the WordPress-specific absent-ACF-revision case; neither change was applied to the standalone source branch.

## Next safe checkpoint

1. Finish agents' writes, review them and commit or explicitly preserve local work. Do not merge while affected files have uncommitted edits.
2. Check the current branch and fetch only the source ref. Record and review new commits and changed files:

   ```bash
   git switch codex/wordpress-elementor-foundation
   git status --short
   git fetch origin refs/heads/codex/product-api-integration:refs/remotes/origin/codex/product-api-integration
   git log --oneline 921e44e098419baa5a6f1b463355f44cb50617d1..origin/codex/product-api-integration
   git diff --stat 921e44e098419baa5a6f1b463355f44cb50617d1..origin/codex/product-api-integration
   git merge-base --is-ancestor 921e44e098419baa5a6f1b463355f44cb50617d1 origin/codex/product-api-integration
   ```

   An ancestry failure needs investigation rather than an automatic reset.
3. Once the working tree is clean, merge the inspected source ref into the **target** branch. Use `git merge --no-ff --no-commit origin/codex/product-api-integration` when there are new commits, inspect conflicts and changes, then adapt any migrated behavior. Preserve both approved visual changes and WordPress adaptations. Use `git merge --abort` if a decision remains unresolved; never resolve all files using blanket ours/theirs.
4. Compare changed selectors/field mappings against `superworld-core/`. Re-run the standalone production build/validation outside the checkout, plugin build and JS tests, PHP WordPress tests, and browser smoke. Re-run live API/editor acceptance when relevant and available. Do not equate offline tests with live regression coverage.
5. Only after tests and adaptations pass, append the new exact synchronized SHA, conflict resolutions, component adaptations and validation outcomes to this file. Commit the merge/adaptations and updated record, then push only `HEAD:refs/heads/codex/wordpress-elementor-foundation` without force.

For later runs replace the baseline in the commands with the last successfully verified checkpoint. No automatic merge daemon is installed; each checkpoint includes human-readable evidence and main-agent review.
