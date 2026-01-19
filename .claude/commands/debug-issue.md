# Issue Debug & Investigation

Comprehensively debug and investigate a Linear, JIRA, or GitHub issue $ARGUMENTS following systematic root cause analysis and complete resolution workflow.

## Usage

```bash
/debug-issue VID-36
/debug-issue gh 123
/debug-issue JIRA ticket VID-36
/debug-issue [issue-identifier]
```

## Skills Integration

**MANDATORY**: Use the systematic-debugging skill from superpowers for this workflow.

```
Skill: systematic-debugging
```

This enforces the **Iron Law**: NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST.

## The Four-Phase Framework

You MUST complete each phase before proceeding to the next. Skipping phases leads to symptom fixes that mask underlying issues.

### Phase 1: Root Cause Investigation

**BEFORE attempting ANY fix:**

1. **Retrieve Issue Details**
   - Get full issue information from Linear/JIRA/GitHub
   - Extract reproduction steps, error reports, user impact
   - Update issue status to "In Progress"

2. **Read Error Messages Carefully**
   - Don't skip past errors or warnings
   - Read stack traces completely
   - Note line numbers, file paths, error codes

3. **Reproduce Consistently**
   - Can you trigger it reliably?
   - What are the exact steps?
   - If not reproducible → gather more data, don't guess

4. **Check Recent Changes**
   - Git diff, recent commits (past 72 hours)
   - New dependencies, config changes
   - Recent deployments

5. **Gather Evidence in Multi-Component Systems**
   ```
   For EACH component boundary:
     - Log what data enters component
     - Log what data exits component
     - Verify environment/config propagation
     - Check state at each layer

   Run once to gather evidence showing WHERE it breaks
   THEN analyze evidence to identify failing component
   ```

6. **Trace Data Flow** (Use root-cause-tracing skill for deep issues)
   - Where does bad value originate?
   - What called this with bad value?
   - Keep tracing up until you find the source
   - Fix at source, not at symptom

**Success Criteria**: You can explain WHAT is happening and WHY.

### Phase 2: Pattern Analysis

1. **Find Working Examples**
   - Locate similar working code in same codebase
   - What works that's similar to what's broken?

2. **Compare Against References**
   - If implementing pattern, read reference completely
   - Don't skim - read every line

3. **Identify Differences**
   - What's different between working and broken?
   - List every difference, however small

4. **Understand Dependencies**
   - What other components does this need?
   - What settings, config, environment?

**Success Criteria**: You can list specific differences between working and broken code.

### Phase 3: Hypothesis and Testing

1. **Form Single Hypothesis**
   - State clearly: "I think X is the root cause because Y"
   - Write it down in the issue comment
   - Be specific, not vague

2. **Test Minimally**
   - Make the SMALLEST possible change to test hypothesis
   - One variable at a time
   - Don't fix multiple things at once

3. **Verify Before Continuing**
   - Did it work? Yes → Phase 4
   - Didn't work? Form NEW hypothesis, return to Phase 1
   - DON'T add more fixes on top

**Success Criteria**: Hypothesis confirmed or new hypothesis formed.

### Phase 4: Implementation

1. **Create Failing Test Case**
   - Simplest possible reproduction
   - Automated test using TDD principles
   - MUST have before fixing

2. **Implement Single Fix**
   - Address the root cause identified
   - ONE change at a time
   - No "while I'm here" improvements

3. **Verify Fix**
   - Test passes now?
   - No other tests broken?
   - Issue actually resolved?

4. **If Fix Doesn't Work - COUNT YOUR ATTEMPTS**
   - If < 3 attempts: Return to Phase 1, re-analyze
   - **If ≥ 3 attempts: STOP - See Circuit Breaker below**

**Success Criteria**: Bug resolved, tests pass, no regressions.

## Circuit Breaker: 3+ Failed Fixes

**If you've tried 3+ fixes without success, STOP.**

This pattern indicates an architectural problem:
- Each fix reveals new shared state/coupling
- Fixes require "massive refactoring"
- Each fix creates new symptoms elsewhere

**Action Required:**
1. Document all attempted fixes and their results
2. Question fundamentals: Is this pattern sound?
3. **Discuss with human partner before attempting more fixes**
4. Consider: refactor architecture vs. continue fixing symptoms

This is NOT a failed hypothesis - this is likely a wrong architecture.

## Red Flags - STOP and Return to Phase 1

If you catch yourself thinking:
- "Quick fix for now, investigate later"
- "Just try changing X and see if it works"
- "Add multiple changes, run tests"
- "It's probably X, let me fix that"
- "I don't fully understand but this might work"
- "Here are the main problems: [lists fixes without investigation]"
- Proposing solutions before tracing data flow

**ALL of these mean: STOP. Return to Phase 1.**

## Agent Assignment by Issue Type

### Frontend Issues → sophie-frontend agent
- UI rendering, component lifecycle issues
- Client-side state management bugs
- Performance problems (slow renders, memory leaks)
- User interaction bugs (forms, navigation)

### Backend Issues → igor-backend agent
- API endpoint failures, database query problems
- Server-side logic errors, data processing
- Authentication/authorization bugs
- Performance bottlenecks

### Database Issues → elena-database agent
- Query performance, RLS policies
- Data integrity, migrations
- N+1 problems, slow queries

### Architecture Issues → alex-architect agent
- Cross-system communication problems
- Data consistency across services
- Security vulnerabilities

### QA & Verification → david-qa agent
- Test failure analysis
- Regression testing
- End-to-end workflow verification

## Documentation Template

Add this to the issue when investigation is complete:

```markdown
## Investigation Summary
Brief description of the issue and its impact.

## Phase 1: Root Cause Investigation

### Evidence Gathered
- **Error Messages**: [exact errors, stack traces]
- **Reproduction**: [steps, success rate]
- **Recent Changes**: [relevant commits, deployments]
- **Data Flow Trace**: [where bad data originated]

### Root Cause Identified
- **Primary Cause**: [technical explanation]
- **Code Location**: [file:line]
- **When Introduced**: [commit/date if known]

## Phase 2: Pattern Analysis
- **Working Example**: [similar code that works]
- **Key Differences**: [what's different]

## Phase 3: Hypothesis
- **Hypothesis**: "X is the root cause because Y"
- **Test Result**: [confirmed/rejected]
- **Attempts Made**: [count - important for circuit breaker]

## Phase 4: Implementation

### Solution Applied
- [Detailed explanation of the fix]
- [Why this approach over alternatives]

### Files Changed
- [file:line - description of change]

### Testing Completed
- [ ] Unit tests added/updated
- [ ] Integration tests passed
- [ ] Manual testing validated
- [ ] No regressions introduced

### Rollback Plan
[Steps to quickly revert if issues arise]

## Operator Test Instructions
**Please validate:**
1. [Specific test step - expected result]
2. [Regression test - existing functionality works]

**Test Environment**: [staging/production/local]

## Prevention Measures
- [What prevents similar issues in future]
- [Monitoring/alerting improvements]
```

## Critical Requirements

- **MANDATORY**: Complete Phase 1 before proposing any fixes
- **MANDATORY**: Update issue status to "In Progress" before starting
- **MANDATORY**: Reproduce the issue before attempting fixes
- **MANDATORY**: Count fix attempts - stop at 3 and escalate
- **MANDATORY**: Document investigation findings in issue
- **MANDATORY**: Set issue to "In Review" when complete

## Tools & Infrastructure

### Debugging Tools
- Chrome DevTools MCP for frontend investigation
- Sequential-Thinking MCP for complex root cause analysis
- Sentry for error tracking and stack traces
- Railway/Vercel logs for deployment issues

### Commands
- `./docs/devops/restart-local.sh` - Reset local environment
- `npm run test` - Run frontend tests
- `cd backend && pytest` - Run backend tests

## Success Criteria

- [ ] Root cause identified and documented (not just symptoms)
- [ ] Fix addresses root cause, not symptom
- [ ] Automated test prevents regression
- [ ] No new bugs introduced
- [ ] Documentation complete in issue
- [ ] Issue moved to "In Review"
- [ ] Monitoring catches similar issues in future
