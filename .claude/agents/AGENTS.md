# DCWLT Agent Team

**Specialist agents with autonomous context windows for the DCWLT project.**

---

## Agent Mapping

| Specialist | Agent Type | Expertise | When to Use |
|------------|-----------|-----------|-------------|
| **Alex** | `feature-dev:code-architect` | Next.js PWA Architecture | Designing PWA features, App Router structure, React components |
| **Igor** | `feature-dev:code-architect` | Convex Backend Design | Database schema, queries/mutations, real-time sync |
| **Satoshi** | `solana-express-backend-architect` | Solana + Express | SPL tokens, RPC operations, blockchain settlements |
| **Priya** | `feature-dev:code-architect` | Authentication Design | Privy integration, embedded wallets, auth flows |
| **Sarah** | `feature-dev:code-architect` | Payment Integration | Stripe Checkout, webhooks, top-up flows |
| **Quinn** | `pwa-mobile-ui-developer` | Camera + QR Scanning | HTML5 Camera API, QR parsing, Solana Pay URLs |
| **Tara** | `test-specialist` | Testing & QA | E2E tests, load testing, test coverage |
| **Otto** | `pwa-mobile-ui-developer` | PWA Offline | Service workers, caching, background sync |

---

## How to Use Agents

### Method 1: Direct Agent Launch

```
"Launch Alex to design the payment confirmation page"
"Have Satoshi review the token transfer code"
"Ask Tara to write E2E tests for the payment flow"
```

### Method 2: Task Description (Auto-Match)

Describe what you need - Claude will auto-select the right agent:

```
"I need to add Stripe checkout" → Sarah responds
"I need a Convex query for balances" → Igor responds
"I need to test the payment flow" → Tara responds
```

---

## Agent Context Windows

Each agent has its **own separate context window**, allowing:

- Autonomous multi-step work without cluttering main conversation
- Deep exploration of their domain
- Independent tool use
- Parallel agent execution

---

## Skills Remain for Quick Reference

The `.claude/skills/*/SKILL.md` files provide:
- Domain-specific patterns and code snippets
- Best practices for each specialist
- Quick reference during development

Skills are lightweight guidance; agents do the actual work.

---

## Launch Commands

```bash
# Launch specific agent
"Claude, launch [specialist] to [task]"

# Examples:
"Claude, launch Alex to create the dashboard page"
"Claude, launch Satoshi to fix the token transfer"
"Claude, launch Tara to write E2E tests"
```
