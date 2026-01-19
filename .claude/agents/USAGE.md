# DCWLT Agents - Usage Guide

**Autonomous specialist agents with separate context windows for complex development tasks.**

---

## Quick Reference

```
┌─────────────────────────────────────────────────────────────────┐
│                    DCWLT AGENT TEAM                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   "I need a page..."        →   Alex (PWA)    → feature-dev    │
│   "I need a mutation..."    →   Igor (Convex) → feature-dev    │
│   "I need token transfer..." →  Satoshi (Solana) → solana-*     │
│   "I need login setup..."   →   Priya (Auth)   → feature-dev    │
│   "I need Stripe..."        →   Sarah (Pay)    → feature-dev    │
│   "I need QR scanning..."   →   Quinn (Camera) → pwa-mobile-*   │
│   "I need to write tests..." →   Tara (QA)     → test-specialist│
│   "It's not working offline..." → Otto (PWA)   → pwa-mobile-*   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## How It Works

### Agents vs Skills

| Aspect | Agents | Skills |
|--------|--------|--------|
| **Context Window** | Separate (isolated) | Shared (main conversation) |
| **Autonomy** | Can work independently | Provides guidance |
| **Best For** | Complex multi-step tasks | Quick reference, patterns |
| **Tool Use** | Has own tool access | Used by main conversation |
| **Cost** | Uses more tokens | Lightweight |

**When to use which:**
- **Simple questions** → Use skills (instant, no token overhead)
- **Complex tasks** → Use agents (autonomous, isolated context)

---

## Launching Agents

### Method 1: Direct Launch

```
"Launch Alex to create the payment confirmation page"
"Ask Satoshi to implement token transfers"
"Have Tara write E2E tests for checkout"
```

### Method 2: Task Description (Auto-Match)

Just describe what you need - the right agent will respond:

```
"I need to add a Convex query for user balances" → Igor responds
"The QR scanner isn't working on mobile" → Quinn responds
"I need to set up Stripe webhooks" → Sarah responds
```

### Method 3: Manual Selection

```
"Use the pwa-mobile-ui-developer agent to fix the camera issue"
"Launch solana-express-backend-architect for the token transfer"
```

---

## Agent Mappings

| Specialist | Agent Type | Domain | Example Tasks |
|------------|-----------|--------|---------------|
| **Alex** | `feature-dev:code-architect` | Next.js PWA | Create pages, layouts, components |
| **Igor** | `feature-dev:code-architect` | Convex Backend | Schema, queries, mutations, actions |
| **Satoshi** | `solana-express-backend-architect` | Solana + Express | Token transfers, RPC, ATA creation |
| **Priya** | `feature-dev:code-architect` | Privy Auth | Login flows, wallet sync, routes |
| **Sarah** | `feature-dev:code-architect` | Stripe Payments | Checkout, webhooks, fulfillment |
| **Quinn** | `pwa-mobile-ui-developer` | Camera + QR | Scanner, URL parsing, permissions |
| **Tara** | `test-specialist` | Testing QA | E2E, load tests, coverage |
| **Otto** | `pwa-mobile-ui-developer` | PWA Offline | Service workers, caching, sync |

---

## Example Conversations

### Example 1: Creating a New Feature

```
You: "I need to add a transaction history page"

Claude: I'll launch Alex to design the transaction history page...

[Agent Alex runs independently with its own context]

Alex: I'll create the transaction history page:
1. Create app/(dashboard)/history/page.tsx
2. Add Convex query for transactions
3. Implement pagination
4. Style with Shadcn components
5. Add loading states

[Page created successfully]
```

### Example 2: Debugging an Issue

```
You: "The token transfer is failing"

Claude: I'll launch Satoshi to investigate...

[Agent Satoshi runs with its own context]

Satoshi: Investigating the token transfer failure...
1. Checking RPC connection
2. Verifying ATA exists
3. Validating transaction format
4. Checking treasury wallet balance

Found issue: Recipient ATA doesn't exist. Adding ATA creation...
```

### Example 3: Parallel Agents

```
You: "Set up Stripe top-up and write tests for it"

Claude: I'll launch both agents in parallel...

[Agent Sarah - Sets up Stripe]
[Agent Tara - Writes tests]

Both: Tasks completed successfully
```

---

## Skills Reference

Skills remain available for quick reference without launching agents:

```
"Alex, how do I structure a Next.js layout?"
→ Skill loaded with instant guidance (no agent launch)

"Satoshi, what's the Solana Pay URL format?"
→ Skill shows format immediately
```

**Access skills by name:**
- `alex` - Next.js PWA patterns
- `igor` - Convex backend patterns
- `satoshi` - Solana operations
- `priya` - Privy auth flows
- `sarah` - Stripe integration
- `quinn` - QR scanning
- `tara` - Testing strategies
- `otto` - PWA offline

---

## Best Practices

### DO ✅

- Use agents for complex multi-step tasks
- Use skills for quick reference questions
- Launch multiple agents in parallel for independent tasks
- Provide clear context when launching agents
- Check agent results before proceeding

### DON'T ❌

- Don't launch agents for simple questions (use skills)
- Don't forget agents have separate context (they won't see main conversation)
- Don't launch agents without clear tasks
- Don't assume agents know project context (provide it)

---

## Advanced Usage

### Parallel Execution

```
"Launch Alex to create the UI while Sarah sets up the backend"
```

### Sequential Execution

```
"Have Igor design the schema, then Alex build the UI"
```

### Handoff Between Agents

```
"Alex, design the component → Satoshi, integrate with blockchain → Tara, write tests"
```

---

## Monitoring Agent Work

When an agent is running:
- Check the agent's output for progress
- Review generated code before accepting
- Ask for clarification if needed
- Terminate and retry if going off-track

---

## Troubleshooting

**Agent not responding:**
- Check if task is clear enough
- Try using agent type directly
- Fall back to skill for guidance

**Agent going off-track:**
- Provide more specific requirements
- Refer to project context
- Use skill for patterns, then retry agent

**Context lost between agents:**
- Summarize previous agent's work
- Provide relevant files/commit references
- Use sequential execution with handoffs

---

## File Structure

```
.claude/
├── agents/                    # Agent documentation
│   ├── AGENTS.md             # Agent mappings
│   └── USAGE.md              # This file
└── skills/                    # Skills (quick reference)
    ├── alex/SKILL.md         # Next.js PWA patterns
    ├── igor/SKILL.md         # Convex patterns
    ├── satoshi/SKILL.md      # Solana patterns
    ├── priya/SKILL.md        # Privy patterns
    ├── sarah/SKILL.md        # Stripe patterns
    ├── quinn/SKILL.md        # QR patterns
    ├── tara/SKILL.md         # Testing patterns
    └── otto/SKILL.md         # PWA offline patterns
```
