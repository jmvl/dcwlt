# Debug API Alignment Issue

Investigate and fix frontend/backend API misalignment for $ARGUMENTS

## Usage
```bash
/debug-api-alignment gh 123
/debug-api-alignment "video processing endpoint returns wrong shape"
```

## Workflow

### 1. Issue Context
- If gh issue provided: `gh issue view [number]` for context
- Identify affected endpoint(s) and data flow

### 2. Discover Actual Contracts

**Backend (FastAPI)**
- Check `/openapi.json` or `/docs` for declared contract
- Inspect actual Pydantic models in `/backend/app/schemas/`
- Trace endpoint implementation in `/backend/app/api/`
- Check actual DB queries and response transformations

**Frontend (Next.js)**
- Find API calls in `/src/api/` or hooks
- Check TypeScript interfaces/types used
- Inspect actual fetch/axios calls and response handling

### 3. Compare & Identify Mismatch

Create comparison table:
| Field | Backend Returns | Frontend Expects | Match |
|-------|----------------|------------------|-------|

Common mismatches:
- Field naming (snake_case vs camelCase)
- Nested vs flat structures
- Optional vs required fields
- Array vs single object
- Date formats

### 4. Root Cause
- Who diverged from original contract?
- Was there ever a shared contract?
- Recent changes that broke alignment?

### 5. Fix Strategy
- [ ] Update OpenAPI/Pydantic models (source of truth)
- [ ] Regenerate frontend types
- [ ] Fix transformer/adapter if needed
- [ ] Add response validation

### 6. Prevent Recurrence
- [ ] Add contract test (backend returns what OpenAPI says)
- [ ] Add type-safe fetch wrapper (frontend validates response)

## Output
Comment on GH issue with:
- Mismatch summary table
- Root cause
- Fix applied
- Prevention measure added