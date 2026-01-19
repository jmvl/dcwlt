📝 Commit the local changes to git.

- 🔧 Run `just precommit` (if a `justfile` exists and contains a `precommit` recipe)

- 🔍 **Dependency Check** (run before staging):
  - Run `git status` to see ALL changes (modified + untracked)
  - If package.json modified: Check if any new scripts reference untracked files
  - If import statements added: Verify imported files exist and are tracked
  - If config files modified: Check for any referenced untracked files
  - List all files that MUST be staged together to avoid broken references

- 📦 Stage changes using this priority order:
  1. **Critical dependencies first**: Any untracked files referenced by modified files
  2. **Modified files second**: Files you remember editing
  3. **Cross-check**: Ensure no modified file references an unstaged file

- Staging approach:
  - Use `git add <file1> <file2> ...` for individual files
  - Only stage changes related to the current task
  - Avoid `git add .` and `git add -A` (stages unrelated changes)
  - Exception: After dependency check, if multiple related files, you MAY use:
    - `git add components/` (for component changes + new component files)
    - `git add scripts/` (for script changes + new scripts)

- Use single quotes around file names containing `$` characters
  - Example: `git add 'app/routes/_protected.foo.$bar.tsx'`

- ✅ **Pre-commit validation**:
  - Run `git diff --cached --name-only` to see what's staged
  - Verify: No modified file references an unstaged/untracked file
  - If package.json staged: Confirm all referenced scripts are staged
  - If unsure, run: `git show --name-only` of previous commits to learn patterns

- 🐛 If the user's prompt was a compiler or linter error, create a `fixup` commit message.
- Otherwise:
- Commit messages should:
  - Start with a present-tense verb (Fix, Add, Implement, etc.)
  - Not include adjectives that sound like praise (comprehensive, best practices, essential)
  - Be concise (60-120 characters)
  - Be a single line
  - Sound like the title of the issue we resolved, and not include the implementation details we learned during implementation
  - End with a period.
  - Describe the intent of the original prompt
- Commit messages should not include a Claude attribution footer
  - Don't write: 🤖 Generated with [Claude Code](https://claude.ai/code)
  - Don't write: Co-Authored-By: Claude <noreply@anthropic.com>
- Echo exactly this: Ready to commit: `git commit --message "<message>"`
- 🚀 Run git commit without confirming again with the user.
- If pre-commit hooks fail, then there are now local changes
  - `git add` those changes and try again
  - Never use `git commit --no-verify`
