# GH Issue Implementation

Implement GH issue $ARGUMENTS following complete development workflow with proper agent delegation and testing.

## Agent Pipeline

Follow this orchestration pipeline based on issue type:

```
Maya (research) → Alex (architecture) → Clara (design) → Sophie/Igor (implement) → David/Tester (validate)
```

## Workflow Steps

1. **Retrieve and analyze issue**: `gh issue view $ARGUMENTS --repo jmvl/vidsnap`
2. **Update status**: `gh issue edit $ARGUMENTS --add-label "status: in progress" --repo jmvl/vidsnap`
3. **Research and investigate**:
   - Use Context7 MCP for best practices and technology patterns
   - Study existing codebase patterns and architecture
   - For bugs: reproduce issue, check logs, analyze root cause
4. **Delegate to specialist agent** (use Task tool with subagent_type):
   - **Architecture** → `alex-architect` - System design, API contracts, PRDs
   - **UX/UI Design** → `clara-design` - Design specs, visual analysis
   - **Frontend** → `sophie-frontend` - Next.js, React, TypeScript, Tailwind
   - **Backend** → `igor-backend` - FastAPI, Python, Supabase
   - **Database** → `elena-database` - PostgreSQL, RLS, migrations, optimization
   - **N8N Workflows** → `roger-n8n-expert` - Workflow automation, webhooks
   - **Stripe** → `sergey-stripe` - Payment testing, webhook validation
   - **Testing** → `david-qa` - GitHub Issues-driven QA with Chrome DevTools
   - **Visual Testing** → `tester` - Screenshot-based verification
   - **DevOps** → `maxim-devops` - Vercel, Railway, deployment
   - **Documentation** → `rachel-docs` - Technical docs, API references
   - **Research** → `maya-product` - Market analysis, idea validation
5. **Implement and document**: Execute solution with GitHub Issue comments
6. **Test and verify**: Invoke `david-qa` or `tester` for comprehensive testing
7. **Complete**: Update docs, verify monitoring, mark "Done"

## Mandatory Requirements

- **Status Update**: Change to "In Progress" before starting
- **Research**: Use Context7 MCP for technology best practices
- **Codebase Study**: Analyze existing patterns before implementing
- **Specialist Delegation**: Route to appropriate agent based on issue type
- **Security Review**: Verify no vulnerabilities introduced
- **Rollback Plan**: Document revert strategy for production issues
- **Documentation**: Update technical docs when system design changes
- **Solution Explanation**: Explain solution clearly in both console and GitHub Issue comments
- **Stuck Protocol**: Agents MUST invoke `stuck` agent for ANY problem or uncertainty

## Bug Investigation Protocol

- **Logs**: Review frontend console, backend logs, database logs
- **Reproduction**: Follow exact steps to reproduce the problem
- **Network**: Check API calls, response codes, payload data
- **Database**: Verify data integrity and query performance
- **Monitoring**: Check Sentry for related errors
- **Flow Analysis**: Understand complete user journey and failure points

## Security Review Checklist

- Input validation and sanitization
- Authentication/authorization controls (use `useAuthStore` only)
- Data exposure prevention
- SQL injection protection (parameterized queries)
- XSS prevention and CSP headers
- CORS configuration
- Environment variable security (no secrets in code)

## Context7 Research Guide

### When to Research
- New features requiring best practices
- Performance optimization techniques
- Security implementation guidance
- Architecture decision patterns

### Research Process
1. Identify specific technology stack components
2. Use `mcp__context7__resolve-library-id` for Context7-compatible library ID
3. Use `mcp__context7__get-library-docs` with relevant topics
4. Extract patterns and recommendations
5. Document findings in GitHub Issue comment

### Research Topics by Type
- **Frontend**: React patterns, Next.js 15 App Router, TypeScript, Tailwind, shadcn/ui
- **Backend**: FastAPI patterns, Supabase integration, async/await, API design
- **Database**: PostgreSQL optimization, RLS policies, schema design, migrations
- **Testing**: Jest patterns, Playwright techniques, Chrome DevTools MCP
- **Performance**: Bundle optimization, caching, database indexing, N8N timeouts

## Agent Selection Guide

| Issue Type | Primary Agent | Secondary Agents |
|------------|---------------|------------------|
| New Feature | `alex-architect` | `sophie-frontend`, `igor-backend` |
| UI/UX Changes | `clara-design` | `sophie-frontend` |
| Frontend Bug | `sophie-frontend` | `tester` |
| Backend Bug | `igor-backend` | `david-qa` |
| Database Issue | `elena-database` | `igor-backend` |
| Payment/Stripe | `sergey-stripe` | `roger-n8n-expert` |
| N8N Workflow | `roger-n8n-expert` | `igor-backend` |
| Deployment | `maxim-devops` | - |
| Documentation | `rachel-docs` | - |
| Performance | `elena-database` | `sophie-frontend`, `igor-backend` |

## Documentation & Rollback Requirements

### Documentation Updates
- API changes → OpenAPI/Swagger documentation
- Architecture changes → system diagrams in `docs/architecture/`
- Database schema → migrations and schema docs
- Configuration → deployment documentation in `docs/runbooks/`

### Rollback Planning
- Define rollback triggers (performance degradation, critical bugs, security issues)
- Document database revert procedures
- Specify git commits/branches to revert
- Plan dependency rollback if needed
- Set up monitoring alerts for rollback triggers

## Quality Standards

- Add detailed GitHub Issue comments throughout implementation
- Test thoroughly before marking "Done"
- Verify no existing functionality breaks
- Include screenshots, logs, and evidence in updates
- Document technical decisions and trade-offs
- Create new GitHub Issues for discovered bugs
- Follow DRY/KISS principles from CLAUDE.md
- Files must be ≤500 lines
- **Explain solution thoroughly**: Provide clear explanation of what was found, why it occurred, and how it was fixed

## GitHub Issue Comment Template

```bash
gh issue comment $ARGUMENTS --repo jmvl/vidsnap --body "## [Phase] Complete

### Summary
[What was done]

### Changes Made
- [File/component]: [Description]

### Next Steps
- [What follows]

### Agent
Implemented by: [Agent Name] ([Agent Type])"
```

## Tools to Use

- Sequential-Thinking MCP (`mcp__sequential-thinking__sequentialthinking`)
- Context7 MCP (`mcp__context7__*`)
- Supabase MCP (`mcp__supabase__*`)
- Chrome DevTools MCP (`mcp__chrome-devtools__*`) for testing
- Perplexity MCP (`mcp__plugin_perplexity_perplexity__*`) for research
- N8N MCP (`mcp__n8n-mcp__*`) for workflow automation

## Performance Targets

- API Response: < 2s
- Page Load: < 3s
- Modal Interactions: < 100ms
- Status Updates: < 500ms
- Video Processing: < 5 minutes
