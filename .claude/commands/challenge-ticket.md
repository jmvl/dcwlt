# Challenge Ticket Analysis

Perform critical analysis of an existing JIRA ticket based on new evidence (debug logs, data, findings) to challenge assumptions, explore alternative hypotheses, and identify gaps in the current approach.

## Usage

```bash
/challenge-ticket VID-XXX
```

Then paste your new evidence (debug logs, error messages, data findings, etc.)

## Steps

1. **Read JIRA ticket**: Use `mcp__mcp-atlassian__jira_get_issue` to fetch the complete ticket including:
   - Current description and requirements
   - Acceptance criteria
   - All comments and discussion history
   - Current status and assignee
   - Original assumptions and approach

2. **Analyze new evidence**: Review the data/logs/findings provided by the user:
   - Extract key insights and patterns
   - Identify anomalies or unexpected behaviors
   - Note discrepancies with original assumptions
   - Look for new failure modes or edge cases

3. **Critical comparison**: Compare ticket assumptions vs. new evidence:
   - What assumptions are now challenged?
   - What new patterns emerge from the data?
   - Are there contradictions in the approach?
   - What was overlooked in the original analysis?

4. **Generate challenging questions**: Ask probing questions in these categories:

## Question Framework

### 1. Assumption Challenges
- **Original assumption**: [State the assumption from the ticket]
- **New evidence shows**: [What the data reveals]
- **Question**: Is the original assumption still valid given this evidence? Should we reconsider the approach?

### 2. Root Cause Analysis
- **Current hypothesis**: [What the ticket assumes is the problem]
- **Data suggests**: [What the logs/data actually indicate]
- **Questions**:
  - Could the root cause be different than assumed?
  - What alternative explanations fit this data?
  - Are we treating symptoms instead of the cause?

### 3. Scenario Exploration
- **Covered scenario**: [What the ticket addresses]
- **Missing scenario**: [What the evidence reveals wasn't considered]
- **Questions**:
  - What edge cases does this new data reveal?
  - What user flows were not anticipated?
  - What failure modes weren't accounted for?

### 4. Technical Approach
- **Proposed solution**: [Current approach in the ticket]
- **Data implications**: [What the evidence suggests about the approach]
- **Questions**:
  - Does the proposed solution actually address what the data shows?
  - Should we consider a different technical approach?
  - Are there architectural implications we missed?

### 5. Impact & Scope
- **Assumed impact**: [What the ticket assumes]
- **Actual impact**: [What the data suggests]
- **Questions**:
  - Is this problem bigger/smaller than we thought?
  - Are there other areas affected that we didn't consider?
  - Should the scope be adjusted?

### 6. Testing & Validation
- **Current test plan**: [From the ticket]
- **Data reveals**: [New testing needs]
- **Questions**:
  - What additional test scenarios should be added?
  - How can we validate against this new evidence?
  - What monitoring/logging should we add?

## Analysis Output Format

Present the analysis as:

```markdown
## 🔍 Critical Analysis: VID-XXX

### 📋 Original Ticket Summary
[Brief summary of ticket's current understanding]

### 🆕 New Evidence Summary
[Key findings from the provided data/logs]

### ⚠️ Challenges to Assumptions

#### Challenge 1: [Assumption Name]
- **Original belief**: ...
- **Evidence shows**: ...
- **Critical question**: ...

#### Challenge 2: [Assumption Name]
- **Original belief**: ...
- **Evidence shows**: ...
- **Critical question**: ...

### 🤔 Alternative Hypotheses

1. **Hypothesis A**: [Alternative explanation]
   - Supporting evidence: ...
   - Question: Could this be the actual root cause?

2. **Hypothesis B**: [Another possibility]
   - Supporting evidence: ...
   - Question: Should we investigate this angle?

### 🎯 Scenario Gaps

**Not considered in ticket**:
- Scenario X: [Description]
  - Question: How should we handle this case?
- Scenario Y: [Description]
  - Question: What's the user impact?

### 🔧 Technical Approach Review

**Current approach concerns**:
- Concern 1: [Issue with proposed solution]
  - Question: Should we pivot to [alternative]?
- Concern 2: [Another issue]
  - Question: Have we considered [alternative approach]?

### 📊 Impact Reassessment

**Findings**:
- The data suggests [scope/priority/urgency change]
- Questions:
  - Should we escalate/de-escalate priority?
  - Are there dependencies we missed?
  - Should we break this into multiple tickets?

### ✅ Recommended Next Steps

Based on this analysis, consider:
1. [Action item with rationale]
2. [Investigation needed]
3. [Ticket update required]
```

## Requirements

- **MANDATORY**: Use `mcp__mcp-atlassian__jira_get_issue` to read the actual ticket
- **MANDATORY**: Read ALL comments to understand the full context and evolution
- **Critical thinking**: Challenge assumptions, don't just accept them
- **Evidence-based**: Every question should be grounded in the new data
- **Actionable**: Questions should lead to concrete next steps
- **Hypothesis-driven**: Propose alternative explanations when data conflicts with assumptions

## Follow-up Actions

After the analysis, offer to:

1. **Update the ticket**: Add the analysis as a comment with new findings
2. **Create sub-tickets**: If multiple issues are uncovered
3. **Revise acceptance criteria**: Based on new understanding
4. **Escalate**: If this reveals a critical issue
5. **Request more data**: If questions need additional investigation

## Example Usage

```bash
# User runs command
/challenge-ticket VID-123

# User pastes evidence
[Long debug log showing unexpected authentication flow]
[Error messages indicating race condition]
[Performance metrics showing bottleneck]

# AI provides critical analysis with challenging questions about:
- Why authentication is failing in ways not anticipated
- Whether the root cause is actually a race condition
- If performance issues indicate architectural problems
- What scenarios the original ticket didn't account for
```

## Important Notes

- **Be skeptical**: The goal is to challenge, not confirm existing beliefs
- **Follow the data**: Let evidence guide the questions, not assumptions
- **Think systemically**: Consider ripple effects and interconnections
- **No sacred cows**: Everything is open to questioning based on evidence
- **Constructive criticism**: Frame challenges as opportunities to improve the solution
