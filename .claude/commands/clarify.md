---
description: Generate up to 5 targeted clarification questions for existing specs.
---

Given a feature name or spec file as an argument, do this:

1. Determine the target spec file path:
   - If argument contains `.md`, treat as direct file path
   - Otherwise, find spec file in `specs/{feature-name}/spec.md`
   - Validate file exists and is readable

2. Load and analyze the specification:
   - Read the entire spec content
   - Identify sections marked with [NEEDS CLARIFICATION]
   - Look for ambiguous requirements, undefined terms, or missing details
   - Check for inconsistencies between sections

3. Generate up to 5 targeted questions:
   - Focus on critical ambiguities that would block implementation
   - Prioritize business logic over technical implementation details
   - Format questions clearly for non-technical stakeholders
   - Include context for why each clarification is needed

4. Present questions in priority order:
   - Most critical blocking questions first
   - Include the relevant spec section for each question
   - Suggest potential answers or approaches where helpful

5. Report summary:
   - Number of clarifications needed
   - Readiness assessment for moving to planning phase
   - Recommended next steps

Note: This command helps identify and resolve spec ambiguities before implementation begins.