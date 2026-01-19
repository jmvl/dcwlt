# Pull Request Analysis & Review

Comprehensively analyze and review a pull request $ARGUMENTS following systematic analysis, multi-agent review, and acceptance recommendation workflow.

## Usage

```bash
/pr <pull-request-url>
/pr <github-username>/<repo-name>/pull/<pr-number>
/pr #<pr-number>  # if working within the same repository
```

## Overview

This command provides a complete pull request analysis workflow that combines industry best practices research, architectural validation, frontend/backend code review, and systematic acceptance evaluation. It leverages specialized agents to provide comprehensive feedback before proposing acceptance or rejection.

## Steps

1. **Retrieve PR details**: Get full pull request information including description, changes, commits, and context
2. **Update PR status**: Add comment indicating review is in progress
3. **Research PR best practices**: Use context7 MCP to research code review and pull request best practices for the specific technology stack
4. **Analyze PR scope and impact**: Understand the changes, affected systems, and potential risks
5. **Validate PR requirements**: Check if PR meets basic requirements (description, tests, documentation, etc.)
6. **Architecture impact analysis**: Use system-architect agent to assess architectural implications and design coherence
7. **Frontend code review**: Use frontend-dev agent to review UI/UX changes, component structure, and client-side logic
8. **Backend code review**: Use senior-backend-engineer agent to review API changes, database operations, and server-side logic
9. **Security review**: Evaluate security implications and potential vulnerabilities
10. **Performance impact assessment**: Analyze potential performance implications of the changes
11. **Testing coverage analysis**: Review test coverage and quality of test implementations
12. **Documentation review**: Ensure adequate documentation for changes
13. **Dependency and compatibility check**: Verify dependencies and compatibility with existing systems
14. **Generate comprehensive review summary**: Compile all findings into a structured review
15. **Provide acceptance recommendation**: Recommend approval, changes needed, or rejection with detailed reasoning
16. **Post review comment**: Add comprehensive review comment to the PR with all findings and recommendation

## PR Analysis Protocol

### Initial Assessment
- **PR type**: Feature, bug fix, refactoring, hotfix, documentation
- **Scope of changes**: Lines changed, files affected, complexity level
- **Breaking changes**: API changes, schema changes, configuration changes
- **Risk level**: Low, medium, high based on impact and complexity
- **Urgency**: Critical, high, normal, low based on business priority

### PR Requirements Validation
- **Title quality**: Clear, descriptive, follows conventions
- **Description completeness**: Problem statement, solution, testing instructions
- **Linked issues**: Related tickets, bug reports, feature requests
- **Branch naming**: Follows established conventions
- **Commit quality**: Clear messages, logical organization, atomic commits
- **Size appropriateness**: Not too large for effective review

### Change Impact Analysis
- **Files affected**: Critical vs non-critical files, test coverage
- **System boundaries**: Which services/modules are impacted
- **Data flow changes**: How data flows through the system after changes
- **Configuration impact**: Environment variables, feature flags, deployment configs
- **Third-party dependencies**: New dependencies, version updates, security implications

## PR Research Protocol with Context7 MCP

### When to Use Context7 for PR Review
- **Code patterns**: Research best practices for specific coding patterns used in the PR
- **Framework features**: Look up proper usage of framework features being implemented
- **Security patterns**: Research security best practices for authentication, authorization, data handling
- **Performance optimization**: Find performance best practices for the technology stack
- **Testing strategies**: Research testing patterns and coverage recommendations

### PR Research Process
1. **Identify technologies involved**: Determine frameworks, libraries, and patterns used in the PR
2. **Resolve library IDs**: Use `resolve-library-id` for relevant technologies
3. **Research best practices**: Use `get-library-docs` with topics like "best practices", "code review", "patterns"
4. **Extract quality standards**: Focus on code quality, security, and performance standards
5. **Document research insights**: Include findings in the PR review summary

### Research Topics for PR Review
- **React/Next.js**: Component patterns, hooks usage, performance optimization, SSR best practices
- **TypeScript**: Type safety, interface design, generic usage, strict mode compliance
- **Node.js/FastAPI**: API design, error handling, async patterns, security practices
- **Database**: Query optimization, schema design, migration best practices, indexing
- **Testing**: Unit test patterns, integration testing, E2E testing, coverage standards
- **Security**: Input validation, authentication, authorization, data protection

## Architecture Review Protocol for PRs

### System-Architect Agent Analysis
Use the system-architect agent to evaluate architectural implications of the pull request:

#### Architectural Coherence Assessment
- **Design pattern consistency**: Ensure changes follow established architectural patterns
- **Service boundaries**: Verify proper separation of concerns and service responsibilities
- **Data model alignment**: Check alignment between database schema, API contracts, and frontend models
- **Integration integrity**: Validate that integrations maintain proper abstractions

#### System Impact Evaluation
- **Scalability implications**: Assess how changes affect system scalability and performance
- **Maintainability impact**: Evaluate long-term maintenance implications of the changes
- **Technical debt**: Identify any technical debt introduced or resolved by the changes
- **Future extensibility**: Consider how changes affect future development and extensibility

#### Cross-System Dependencies
- **Service interactions**: Analyze impact on microservice communication and dependencies
- **Data consistency**: Evaluate data consistency across different system components
- **API compatibility**: Assess backward/forward compatibility of API changes
- **Configuration coupling**: Review coupling between different configuration systems

#### Risk Assessment for PR
- **Deployment risks**: Identify potential deployment and rollback complications
- **Performance risks**: Assess potential performance degradation or bottlenecks
- **Security risks**: Evaluate security implications and potential vulnerabilities
- **Data integrity risks**: Consider risks to data consistency and integrity

### Architecture Review Deliverables
- **Architectural Impact Analysis**: Assessment of how changes affect overall system architecture
- **Design Pattern Compliance**: Verification that changes follow established patterns
- **Integration Verification**: Confirmation that all integrations remain sound
- **Risk Assessment**: Identification of architectural risks and mitigation strategies
- **Scalability Analysis**: Evaluation of scalability implications

## Agent-Specific Review Protocols

### Frontend Code Review (frontend-dev agent)
- **Component architecture**: Review component structure, props design, and reusability
- **State management**: Evaluate state handling, context usage, and data flow
- **Performance optimization**: Check for unnecessary re-renders, proper memoization, code splitting
- **Accessibility compliance**: Verify ARIA labels, keyboard navigation, screen reader support
- **Responsive design**: Test mobile responsiveness and cross-browser compatibility
- **UI/UX consistency**: Ensure design system compliance and user experience coherence

### Backend Code Review (senior-backend-engineer agent)  
- **API design**: Review endpoint structure, request/response formats, error handling
- **Database operations**: Evaluate query efficiency, transaction handling, data integrity
- **Business logic**: Assess logic correctness, edge case handling, validation
- **Security implementation**: Review authentication, authorization, input sanitization
- **Performance optimization**: Check for N+1 queries, caching, async operations
- **Error handling**: Verify comprehensive error handling and logging

### Security Review Checklist
- **Input validation**: Ensure all user inputs are properly sanitized and validated
- **Authentication/Authorization**: Verify proper access controls and permissions
- **Data exposure**: Check for sensitive data leaks in responses or logs
- **SQL injection prevention**: Review parameterized queries and ORM usage
- **XSS prevention**: Ensure output encoding and CSP headers
- **CORS configuration**: Verify cross-origin resource sharing settings
- **Dependency security**: Check for known vulnerabilities in dependencies

## PR Review Documentation Template

```markdown
# Pull Request Review Summary

## PR Overview
- **Title**: [PR Title]
- **Type**: [Feature/Bug Fix/Refactoring/Hotfix]
- **Risk Level**: [Low/Medium/High]
- **Lines Changed**: [+X/-Y lines across Z files]

## Requirements Validation
- [ ] **Title & Description**: Clear and comprehensive
- [ ] **Linked Issues**: Properly linked to related tickets
- [ ] **Branch Naming**: Follows conventions
- [ ] **Commit Quality**: Clear messages and atomic commits
- [ ] **PR Size**: Appropriate for effective review

## Code Quality Analysis

### Frontend Review (if applicable)
- **Component Design**: [Assessment of component architecture]
- **State Management**: [Evaluation of state handling]
- **Performance**: [Performance optimization review]
- **Accessibility**: [Accessibility compliance check]
- **UI/UX**: [User experience evaluation]

### Backend Review (if applicable)
- **API Design**: [Assessment of API structure and patterns]
- **Database Operations**: [Review of queries and data handling]
- **Business Logic**: [Evaluation of logic correctness]
- **Security**: [Security implementation review]
- **Performance**: [Performance optimization assessment]

### Architecture Review
- **Design Consistency**: [Adherence to architectural patterns]
- **System Impact**: [Assessment of changes on overall system]
- **Scalability**: [Scalability implications]
- **Maintainability**: [Long-term maintenance considerations]

## Security Assessment
- **Input Validation**: [Status of input sanitization]
- **Access Controls**: [Authentication/authorization review]
- **Data Protection**: [Sensitive data handling]
- **Vulnerability Check**: [Security vulnerability assessment]

## Testing & Documentation
- **Test Coverage**: [Analysis of test quality and coverage]
- **Documentation**: [Documentation completeness review]
- **Manual Testing**: [Manual testing requirements and results]

## Research Insights
- **Industry Best Practices**: [Key findings from research]
- **Framework Recommendations**: [Technology-specific guidance]
- **Common Pitfalls**: [Potential issues identified from research]

## Issues Identified
### Critical Issues
- [ ] [Issue 1 description and resolution required]
- [ ] [Issue 2 description and resolution required]

### Minor Issues  
- [ ] [Issue 1 description and suggested improvement]
- [ ] [Issue 2 description and suggested improvement]

### Suggestions
- [ ] [Suggestion 1 for improvement]
- [ ] [Suggestion 2 for enhancement]

## Overall Assessment

### Strengths
- [Positive aspects of the PR]
- [Well-implemented features]
- [Good practices followed]

### Areas for Improvement
- [Areas that could be enhanced]
- [Suggestions for better implementation]

## Recommendation

**Status**: [✅ APPROVE / ⚠️ APPROVE WITH COMMENTS / ❌ REQUEST CHANGES]

**Rationale**: [Detailed explanation of the recommendation]

**Next Steps**: [Required actions before merge, if any]

## Risk Assessment
- **Deployment Risk**: [Low/Medium/High - explanation]
- **Performance Risk**: [Low/Medium/High - explanation]  
- **Security Risk**: [Low/Medium/High - explanation]
- **Rollback Plan**: [Rollback strategy if issues arise]

---
*Review conducted with AI-assisted analysis including architectural validation, security assessment, and code quality evaluation.*
```

## Requirements

### Mandatory Steps
- **CRITICAL**: Research PR best practices using context7 MCP for the technology stack involved
- **CRITICAL**: Use system-architect agent for comprehensive architectural impact analysis
- **CRITICAL**: Use appropriate specialized agents (frontend-dev, senior-backend-engineer) based on PR content
- **CRITICAL**: Provide clear recommendation with detailed rationale
- **MANDATORY**: Post comprehensive review comment to the actual PR
- Perform thorough security review of all changes
- Analyze testing coverage and quality
- Evaluate documentation completeness

### Review Standards
- **Comprehensive**: Review all aspects of code quality, architecture, security, and performance
- **Research-based**: Ground review in industry best practices and framework-specific guidelines  
- **Multi-perspective**: Use specialized agents for different aspects (frontend, backend, architecture)
- **Actionable**: Provide specific, actionable feedback for improvements
- **Risk-aware**: Assess and communicate risks clearly

### Documentation Standards
- **Structured**: Use consistent template format for all reviews
- **Evidence-based**: Include specific examples and references to code
- **Educational**: Explain the reasoning behind feedback and suggestions
- **Prioritized**: Clearly distinguish between critical issues, minor issues, and suggestions

## Security Considerations During PR Review

### Code Security Analysis
- **Injection vulnerabilities**: SQL injection, XSS, command injection
- **Authentication flaws**: Session management, token handling, password security
- **Authorization issues**: Access control, privilege escalation, IDOR
- **Data exposure**: Logging sensitive data, API response leaks, error messages
- **Cryptography**: Secure random generation, proper hashing, encryption usage

### Infrastructure Security
- **Configuration security**: Environment variables, secrets management
- **Dependency security**: Known vulnerabilities, license compliance
- **Network security**: HTTPS usage, CORS configuration, CSP headers
- **Deployment security**: Container security, access permissions

## Performance Review Guidelines

### Frontend Performance
- **Rendering optimization**: Avoid unnecessary re-renders, use React.memo appropriately
- **Code splitting**: Lazy loading, dynamic imports, bundle optimization
- **Asset optimization**: Image compression, lazy loading, CDN usage
- **Network optimization**: API call optimization, caching strategies

### Backend Performance  
- **Database performance**: Query optimization, indexing, connection pooling
- **API performance**: Response time optimization, pagination, caching
- **Resource utilization**: Memory usage, CPU utilization, async operations
- **Scalability**: Load handling, concurrent request management

## Common PR Anti-Patterns to Flag

### Code Quality Issues
- **Large monolithic PRs**: Too many changes in a single PR
- **Missing tests**: Inadequate test coverage for new functionality
- **Poor commit history**: Unclear commit messages, non-atomic commits
- **Hardcoded values**: Magic numbers, hardcoded URLs, configuration values

### Design Issues
- **Violation of SOLID principles**: Single responsibility, open/closed, dependency inversion
- **Tight coupling**: High interdependency between modules
- **Poor error handling**: Missing error cases, inappropriate exception handling
- **Inconsistent patterns**: Not following established codebase patterns

## Success Criteria

- **Thorough Analysis**: All aspects of the PR have been comprehensively reviewed
- **Multi-Agent Review**: Appropriate specialized agents have provided domain-specific feedback
- **Research-Informed**: Review incorporates industry best practices and framework guidelines
- **Clear Recommendation**: Definitive recommendation with supporting rationale
- **Actionable Feedback**: Specific, implementable suggestions for improvement
- **Risk Assessment**: Clear communication of risks and mitigation strategies
- **Documentation Complete**: Comprehensive review documentation added to PR

## Important Notes

- **Constructive Approach**: Focus on improving code quality while being supportive
- **Context Awareness**: Consider the urgency and business context of the PR
- **Knowledge Sharing**: Use reviews as opportunities to share knowledge and best practices
- **Consistency**: Apply consistent standards across all PR reviews
- **Continuous Learning**: Incorporate feedback from PR outcomes to improve future reviews
- **Team Collaboration**: Encourage discussion and learning through the review process
- **Balance**: Balance thoroughness with development velocity needs

## PR Review Best Practices Integration

Based on industry research, incorporate these best practices:

### Review Process Excellence
- **Small batch reviews**: Recommend splitting large PRs for better review quality
- **Response time standards**: Aim for timely reviews to maintain development flow
- **Constructive feedback**: Focus on code improvement rather than criticism
- **Learning opportunities**: Use reviews for knowledge transfer and mentoring

### Code Review Checklist Integration
- **Functionality verification**: Does the code do what it's supposed to do?
- **Logic correctness**: Is the logic sound and handle edge cases?
- **Error handling**: Are errors handled appropriately?
- **Readability**: Is the code easy to understand and maintain?
- **Performance implications**: Will this affect system performance?