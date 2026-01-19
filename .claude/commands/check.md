# Check - Problem Investigation Orchestrator

Investigate problems and return root cause + fix plan for the DCWLT Android Wallet POC project.

## Usage

```bash
/check [problem-description]
```

**Examples:**

- `/check "Web3Auth login fails with EventEmitter bind error"`
- `/check "Top-up API returns 500 when transferring tokens"`
- `/check "QR scanner doesn't detect payment codes"`

## Process

### 0. Check Documentation & Interventions (30 seconds)

**Before deep investigation, check if relevant documentation exists.**

This saves time by leveraging existing troubleshooting guides, architecture documentation, and known fixes from interventions log.

**Documentation Quick Reference Map:**

| Issue Type                                                 | Check These Docs First                                                        |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **Architecture understanding** (system design, components) | `docs/architecture/system-architecture.md`, `docs/architecture/components.md` |
| **Setup/Build issues** (Solana, Android, dependencies)     | `docs/guides/setup-guide.md`                                                  |
| **API issues** (top-up, endpoints)                         | `docs/api/README.md`                                                          |
| **Security/Key issues** (wallet, cryptography)             | `docs/security/wallet-security.md`, `docs/security/cryptography-primer.md`    |
| **Sequence/Flow issues** (payment flow, data flow)         | `docs/diagrams/sequence-diagrams.md`                                          |
| **Known bugs and fixes**                                   | `docs/interventions.md` (CRITICAL - check first for recurring issues)         |
| **Implementation tasks**                                   | `docs/plans/2025-01-13-android-wallet-poc.md`                                 |
| **Project context**                                        | `CLAUDE.md` (project root)                                                    |

**Process:**

1. **Identify issue type** from error message or symptoms
2. **Check `docs/interventions.md` FIRST** - many Web3Auth and build issues already documented
3. **Check relevant doc** from the map above (if exists)
4. **If doc contains solution →** Apply it, skip to fix plan
5. **If doc is unclear →** Proceed to Phase 1 with context from doc
6. **If no relevant doc →** Proceed to Phase 1 normally

**Success:** This 30-second check can solve common issues instantly or provide valuable context for investigation.

### 1. Initial Assessment

Parse `$ARGUMENTS` to extract the problem description. Read `CLAUDE.md` first for project context.

Classify the issue type:

- **Mobile App**: React Native UI, components, navigation, Web3Auth integration, camera/QR
- **Backend**: Express API endpoints, top-up logic, Solana transactions
- **Blockchain**: Solana Devnet, SPL token operations, wallet addresses
- **Configuration**: Environment variables, constants, build configuration

### 2. Create Investigation Plan

Use `TodoWrite` to create task list:

```
1. [ ] Problem classification and scope determination
2. [ ] Evidence gathering (read relevant files, logs, error messages)
3. [ ] Check interventions.md for known fixes
4. [ ] Code investigation using available tools
5. [ ] Root cause identification
6. [ ] Fix plan generation
7. [ ] Final report with recommendations
```

### 3. Investigation Approach

**By Problem Type:**

| Issue Type        | Primary Investigation Area         | Key Files/Directories                                |
| ----------------- | ---------------------------------- | ---------------------------------------------------- |
| **Mobile App**    | React Native, Expo, Web3Auth       | `event-wallet/src/`, `event-wallet/App.tsx`          |
| **Backend**       | Express routes, Solana integration | `backend/src/`, `backend/server.ts`                  |
| **Blockchain**    | Token operations, wallet keys      | Check Solana CLI, TOKEN_ADDRESS in all .env files    |
| **Configuration** | Constants, environment files       | `event-wallet/src/config/constants.ts`, `.env` files |

### 4. Investigation Phases

#### Phase 1: Evidence Gathering

**MANDATORY:** Do NOT propose fixes until this phase is complete.

1. **Check Interventions Log First**

   - `docs/interventions.md` contains detailed bug fixes with root causes
   - Many Web3Auth, build, and dependency issues already documented
   - If found, apply the documented fix

2. **Read Error Messages Completely**

   - Don't skip past errors or warnings
   - Read stack traces end-to-end
   - Note line numbers, file paths, error codes
   - Copy exact error text for analysis

3. **Identify Affected Components**

   - Extract file paths and line numbers from errors
   - Map error to specific code locations
   - Determine which service is involved (event-wallet/backend/merchant)

4. **Check Recent Changes**

   - Run `git diff HEAD~3` to see recent commits
   - Check `progress.json` and `status.json` for project state
   - Look for configuration changes

5. **Trace Data Flow**
   - For each service boundary, log what data enters/exits
   - Find where bad data originates
   - Trace from symptom back to source

**Success Criteria:** You can explain WHAT is happening and WHERE it breaks.

#### Phase 2: Root Cause Analysis

1. **Use Sequential Thinking for Complex Issues**

   - Invoke `mcp__sequential-thinking__sequentialthinking` tool
   - Break down the problem into logical steps
   - Form hypotheses and test them systematically
   - Verify the root cause before proceeding

2. **Code Investigation Tools**

   - Use Serena MCP tools for symbolic code navigation
   - `mcp__plugin_serena_serena__find_symbol` - Find specific functions/classes
   - `mcp__plugin_serena_serena__search_for_pattern` - Search for patterns across codebase
   - `mcp__plugin_serena_serena__read_file` - Read specific files
   - `mcp__plugin_serena_serena__get_symbols_overview` - Get file structure overview

3. **Cross-Component Investigation**

   - For issues involving multiple services, investigate each:
     - **Mobile** → Check React Native components, Web3Auth context, navigation
     - **Backend** → Check Express routes, Solana transaction code
     - **Blockchain** → Check Solana CLI, token addresses, wallet files

4. **Consolidate Findings**

   - List all evidence gathered
   - Identify causal chains
   - Determine root cause with confidence level

5. **Find Working Examples**
   - Search codebase for similar working code
   - Compare working vs broken implementations
   - Identify key differences

**Success Criteria:** You've identified the PRIMARY cause and can explain WHY it happens.

#### Phase 3: Fix Planning

1. **Design Solution**

   - Address the root cause (not symptoms)
   - Consider edge cases and implications
   - Follow POC principles from CLAUDE.md (Devnet only, no real money)

2. **Create Rollback Plan**

   - What if the fix doesn't work?
   - How to quickly revert?

3. **Recommend Testing Approach**
   - Manual testing steps for mobile app
   - Backend API testing (curl, Postman)
   - Blockchain verification (Solana CLI, explorer)

### 5. Output Format

After investigation, produce this report:

```markdown
## Investigation Summary

**Issue:** [Brief description of the problem]

**Impact:** [Which component affected and severity]

**Classification:** [Mobile/Backend/Blockchain/Configuration]

---

## Root Cause Analysis

### Primary Cause

[Technical explanation of what's happening and why]

### Evidence

- **Error Messages:** [Exact errors from logs/console]
- **Affected Components:** [file:line references]
- **Data Flow Trace:** [Where bad data originates]
- **Recent Changes:** [Commits/configuration changes]
- **Known Issues:** [Reference to interventions.md if applicable]

### Location

- **File:** [path/to/file]
- **Line:** [line number]
- **Function:** [functionName]

---

## Fix Plan

### 1. Immediate Action

[Step-by-step instructions to address the root cause]

### 2. Code Changes

- **File:** [path/to/file:line]
- **Change:** [Description of what to modify]
- **Reason:** [Why this fixes the root cause]

### 3. Testing

- [ ] Manual verification: [steps to test]
- [ ] Backend API test: [curl commands]
- [ ] Blockchain verification: [Solana CLI commands]
- [ ] Update interventions.md with fix details

### 4. Rollback Plan

[Steps to quickly revert if issues arise]

---

## Prevention

### Code Changes

- [What prevents similar issues in future]

### Documentation

- [Update interventions.md with this fix]
- [Update relevant docs if needed]
```

### 6. Update Interventions Log

After applying a fix, **always** update `docs/interventions.md` with:

- Timestamp
- Bug description
- Root cause
- Intervention applied
- Result verification
- Files modified

This creates a knowledgebase for future debugging.

## Key Principles

**NON-NEGOTIABLE:**

1. **Root Cause First** - NO fixes without investigation
2. **Evidence-Based** - Decisions backed by data/logs/code
3. **Check Interventions** - Always check interventions.md first for known issues
4. **Sequential Thinking** - Use for complex multi-step analysis
5. **Devnet Only** - Never suggest mainnet changes
6. **Read CLAUDE.md** - Always read project context first

## Tools & Capabilities

- **TodoWrite** - Task management
- **mcp**sequential-thinking**sequentialthinking** - Complex root cause analysis
- **mcp\_\_plugin_serena_serena\*** - Symbol-level code navigation and search
- **Read** - Read relevant files and error logs
- **Bash** - Run git commands, check logs, test fixes
- **mcp\_\_context7_context7** - Query library documentation (React Native, Expo, Solana)

## Project Reference

**Mobile (event-wallet/):**

- React Native + Expo + TypeScript
- Web3Auth for Gmail OAuth → Solana key derivation
- React Navigation for screens
- react-native-vision-camera for QR scanning

**Backend (backend/):**

- Express + TypeScript
- `/api/topup` endpoint for simulated Visa top-ups
- Solana web3.js for token transfers
- Bank wallet holds all Event Tokens

**Merchant (merchant/):**

- Express server
- QR code generation for payments
- Merchant wallet to receive payments

**Blockchain:**

- Solana Devnet (testnet only)
- SPL Token for Event Tokens
- Solana Pay URL format for QR codes

## Example Usage

```bash
# Web3Auth issue
/check "Web3Auth login hangs on loading screen"

# Backend API issue
/check "Top-up endpoint returns 500 error"

# Mobile app issue
/check "QR scanner crashes when opening camera"

# Configuration issue
/check "Invalid TOKEN_ADDRESS in constants.ts"
```

## Success Criteria

- [ ] Root cause identified (not just symptoms)
- [ ] Evidence documented (errors, logs, traces)
- [ ] Fix addresses root cause
- [ ] Rollback plan defined
- [ ] interventions.md updated with fix details
