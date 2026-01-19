# GitHub Issue Creation

Create a structured GitHub issue with comprehensive technical and functional context for the application to be built.
The issue needs to have priorty, labels

## Usage

```bash
/create-ticket [feature/bug/enhancement description]
```

## Steps

1. **Analyze request**: Understand the feature/bug/enhancement being requested
2. **Determine issue type**: Classify as feature, bug, enhancement, or technical task
3. **Generate structured issue**: Create comprehensive GitHub issue with proper context
4. **Create GitHub issue**: Use GitHub API to create the issue with generated content
5. **Set appropriate labels**: Apply relevant labels based on issue type and technical area

## Issue Structure Template

### Title Format

- **Feature**: `[FEATURE] Brief descriptive title`
- **Bug**: `[BUG] Brief description of the problem`
- **Enhancement**: `[ENHANCEMENT] Brief description of improvement`
- **Technical**: `[TECH] Brief technical task description`

### Description Template

```markdown
## Summary

Brief 1-2 sentence description of what needs to be implemented/fixed.

## Problem Statement / User Need

- What problem does this solve?
- Why is this important?
- Who is the target user?

## User Stories

- As a [user type], I want [goal] so that [benefit]
- As a [user type], I want [goal] so that [benefit]

## Acceptance Criteria

- [ ] Specific measurable criteria 1
- [ ] Specific measurable criteria 2
- [ ] Specific measurable criteria 3

## Technical Requirements

### Frontend (Next.js)

- Components needed
- Pages/routes affected
- State management (Zustand)
- UI/UX considerations

### Backend (Server Actions)

- API endpoints/actions needed
- Data validation requirements
- Authentication/authorization needs

### Database (Supabase/Prisma)

- Schema changes required
- New tables/columns needed
- Migration requirements
- Indexing considerations

### Third-Party Integrations

- Supabase Auth integration needs
- External API requirements
- Webhook considerations

## Implementation Approach

1. High-level implementation strategy
2. Key technical decisions
3. Architecture considerations
4. Performance implications

## Testing Requirements

- [ ] Unit tests for core logic
- [ ] Integration tests for API endpoints
- [ ] E2E tests for user flows
- [ ] Manual testing scenarios

## Security Considerations

- Authentication/authorization requirements
- Input validation needs
- Data privacy concerns
- Potential security vulnerabilities

## Dependencies

- Related issues that must be completed first
- External dependencies
- Technical prerequisites

## Definition of Done

- [ ] Feature implemented and tested
- [ ] All acceptance criteria met
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] Security review completed
- [ ] Performance validated
- [ ] Deployed to staging
- [ ] Stakeholder approval received

## Additional Context

- Design mockups/wireframes
- Technical references
- Related discussions
- Business context
```

## Requirements

- **MANDATORY**: Use Linear API to create the actual issue after generating content
- **MANDATORY**: Apply appropriate labels based on technical area:
  - `frontend` - Next.js/React components and UI
  - `backend` - Server Actions and API logic
  - `database` - Supabase/Prisma schema and queries
  - `auth` - Supabase authentication integration
  - `ui/ux` - User interface and experience
  - `performance` - Performance optimization
  - `security` - Security-related changes
  - `bug` - Bug fixes
  - `enhancement` - Improvements to existing features
  - `feature` - New functionality
- Set appropriate priority based on business impact
- Assign to appropriate team member if specified
- Link to related issues when applicable
- Include relevant project/milestone assignment

## Technical Context Integration

### VidSnap Platform Specifics

- **Authentication**: Integrate with existing Supabase Auth setup using HTTP-only cookies and JWT tokens
- **Database**: Work with existing Prisma schema and Supabase configuration
- **UI**: Follow established design system with Tailwind CSS and Framer Motion
- **State**: Use Zustand for client-side state management
- **Testing**: Align with existing Jest/Playwright testing infrastructure

### Code Quality Standards

- Follow existing TypeScript configuration and ESLint rules
- Maintain consistency with current file structure and naming conventions
- Ensure mobile responsiveness and accessibility compliance
- Consider dark mode support in UI changes

### Performance Considerations

- Database query optimization with proper indexing
- Client-side code splitting and lazy loading
- Image optimization and caching strategies
- Real-time features performance impact

## Examples

### Feature Example

```text
Title: [FEATURE] Add bulk delete functionality for prompts
Priority: High
Labels: feature, frontend, backend, database
```

### Bug Example

```text
Title: [BUG] Search results not filtering by tags correctly
Priority: High
Labels: bug, frontend, database
```

### Enhancement Example

```text
Title: [ENHANCEMENT] Improve prompt editor auto-save performance
Priority: Medium
Labels: enhancement, frontend, performance
```

## Important Notes

- **Focus on single, well-defined features**: Don't create massive epic-style issues
- **Include business context**: Help developers understand the "why" behind the request
- **Be specific with acceptance criteria**: Make requirements testable and measurable
- **Consider edge cases**: Think through error states and boundary conditions
- **Plan for testing**: Include comprehensive testing requirements
- **Security first**: Always consider security implications of new features
- **Performance awareness**: Consider performance impact of proposed changes
- **User-centric approach**: Frame requirements from user perspective when possible
