---
description: Provide cross-artifact discrepancy and alignment reporting across specifications, plans, and implementation.
---

Given a feature name as an argument, do this:

1. Locate all related artifacts:
   - Spec file: `specs/{feature-name}/spec.md`
   - Plan file: `specs/{feature-name}/plan.md`
   - Tasks file: `specs/{feature-name}/tasks.md`
   - Implementation files (search for references in codebase)

2. Cross-reference analysis:
   - **Spec vs Plan**: Verify plan addresses all spec requirements
   - **Plan vs Tasks**: Confirm tasks implement all planned components
   - **Tasks vs Code**: Check if implementation matches task descriptions
   - **Spec vs Code**: Validate final implementation meets original requirements

3. Identify discrepancies:
   - Missing requirements in downstream artifacts
   - Extra functionality not specified upstream
   - Conflicting information between artifacts
   - Out-of-sync status indicators

4. Generate alignment report:
   - **Requirements Coverage**: % of spec requirements addressed in code
   - **Implementation Drift**: Code that doesn't match specs
   - **Artifact Consistency**: Alignment scores between documents
   - **Missing Artifacts**: Required files that don't exist

5. Provide recommendations:
   - Which artifacts need updates
   - Prioritized list of discrepancies to resolve
   - Suggestions for maintaining alignment
   - Next steps for bringing artifacts into sync

6. Report format:
   - Executive summary with key metrics
   - Detailed discrepancy list with severity levels
   - Actionable recommendations with file references
   - Alignment health score (0-100%)

Note: This command helps maintain consistency across the entire feature lifecycle from spec to implementation.