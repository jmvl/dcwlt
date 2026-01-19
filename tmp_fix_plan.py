import re

with open('./@fix_plan.md', 'r') as f:
    content = f.read()

# Mark Task 16 as complete
content = re.sub(
    r'- \[ \] Task 16: Integrate top-up API with mobile app \(see TASK_15_16_COMPLETION\.patch\)',
    '- [x] Task 16: Integrate top-up API with mobile app (COMPLETE)',
    content
)

# Update the notes section
content = re.sub(
    r'- \[x\] API service implementation \(Task 16\) - code exists, needs DashboardScreen integration',
    '- [x] API service implementation (Task 16) - COMPLETE',
    content
)

# Update current focus
content = re.sub(
    r'\*\*Task 16 is the only code fix remaining\*\*\.',
    '**All code implementation is COMPLETE.**',
    content
)

content = re.sub(
    r'1\. \*\*Task 16\*\*: Apply DashboardScreen integration \(see TASK_15_16_COMPLETION\.patch\)',
    '1. All code implementation is COMPLETE',
    content
)

content = re.sub(
    r'\*\*TASK 16\*\*: DashboardScreen\.tsx integration required \(see TASK_15_16_COMPLETION\.patch\)',
    '',
    content
)

with open('./@fix_plan.md', 'w') as f:
    f.write(content)

print("Updated @fix_plan.md - Task 16 marked as COMPLETE")
