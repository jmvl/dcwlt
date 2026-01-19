# GSD Class - Section by Section Narrative

## SECTION 1: Introduction (5 minutes)
### Hook the Audience & Set Agenda

---

### Opening Hook (2 minutes)

**Stand center stage. Make eye contact. Start with a question.**

---

"Raise your hand if this has ever happened to you..."

*(Pause, wait for hands)*

"You're working with Claude on a coding project. Everything's going great for the first twenty minutes. Claude understands your codebase, it's making great suggestions, you're in the flow. And then... something shifts."

*(Walk slowly across the stage)*

"Suddenly Claude starts suggesting functions that don't exist. It contradicts itself from ten minutes ago. It hallucinates entire files you never created. You find yourself saying, 'No, we already discussed this, it's in the context'—but it's like talking to someone with short-term memory loss."

*(Stop at center stage)*

"Here's the thing: You're not crazy. And Claude isn't broken either."

*(Click to first slide: Title - "Get Shit Done")*

"What you're experiencing is a fundamental limitation of how Large Language Models work. And today, I'm going to show you a system called GSD—Get Shit Done—that turns this limitation from a bug into a feature."

---

### What is GSD? (1 minute)

**Click to next slide**

---

"GSD stands for 'Get Shit Done.' It's an open source system created by a company called TÂCHES, designed specifically for Claude Code. It has over 3,000 stars on GitHub and 15,000+ installations."

"But here's what matters: GSD is a meta-prompting system. That means it's a system that helps you prompt AI systems more effectively."

"Let me say that differently: GSD is a tool that manages your AI's attention so you can build real software, not just toy projects."

*(Click to slide with one-liner)*

**The pitch:**
> "GSD manages Claude's context limitations through surgical task breakdown, atomic git commits, and verification-driven development."

"Don't worry if that doesn't make sense yet. By the end of this hour, it will."

---

### Agenda (1 minute)

**Click to agenda slide**

---

"Here's where we're going in the next hour:" *(point to each item)*

"**First**, we'll dive deep into WHY this happens. What is it about LLMs that causes them to... lose the plot? And understanding the 'why' is crucial because it tells us how to build systems that work within these constraints."

"**Second**, I'll show you GSD's four core philosophical pillars. This is the mental model—you need to understand this before you can use the tool effectively."

"**Third**, we'll look under the hood. GSD uses six state files to manage your project's memory. I'll explain what each one does and why it matters."

"**Fourth**, the practical stuff. Commands, workflows, how to actually USE this in your real projects."

"**Fifth**, a quick live demo. Seeing is believing."

"**Finally**, Q&A. I've anticipated some common questions, but I want to hear what YOU'RE curious about."

---

### What You'll Walk Away With (1 minute)

**Click to learning outcomes slide**

---

"By the end of this hour, you will be able to:"

*(count on fingers)*

"One: Explain WHY Claude degrades with large context. This isn't magic—it's understandable, predictable, and solvable."

"Two: Describe GSD's architecture. You'll understand how the pieces fit together."

"Three: Use the core commands. You'll be ready to start a project with GSD immediately after this class."

"Four: Avoid common mistakes. I'll show you the pitfalls people hit."

"And five: Decide if GSD is right for YOU. Not everyone needs it. I'll help you figure out if you're in that group."

*(Pause)*

"Sound good? Let's dive in."

---

## SECTION 2: The Problem (10 minutes)
### Context Degradation & The Theory Behind LLMs

---

### The Everyone-Knows-This Moment (1 minute)

**Click to slide: "Who has experienced...?"**

---

"Before we get technical, I want to establish something. We've all felt this."

*(Read from slide)*

"- Claude forgetting earlier context"

"- Claude contradicting itself from ten minutes ago"

"- Claude making up functions that don't exist"

"- Claude struggling with large refactors"

"How many of you have experienced at least one of these?"

*(Wait for hands)*

"Okay, keep your hands up. How many have experienced ALL of these?"

*(Some hands go down, most stay up)*

"Right. This is universal. And here's the important thing: **This is not your fault.** You're not 'prompting wrong.' You're not 'too vague.' You're running into a fundamental architectural constraint."

"Let me show you what's actually happening."

---

### The Attention Mechanism: A Simple Visual (2 minutes)

**Click to diagram: "How LLMs Read Context"**

---

*(Step to whiteboard or flipchart)*

"Imagine you're reading a book. But you have a strange reading rule: **Every word you read, you have to keep in mind equally.**"

*(Draw a simple diagram)*

```
The | quick | brown | fox | jumps | over | the | lazy | dog
 ↓     ↓      ↓      ↓     ↓       ↓     ↓     ↓     ↓
[All words stay "active" in your working memory]
```

"When you start reading, all these words are fresh in your mind. You know exactly what 'the' refers to because it's right there."

"But imagine this book has 100,000 words. And you have to keep ALL of them equally active."

*(Draw more words, start to look messy)*

```
...words 45,000-55,000... | current word | ...words 95,000-105,000...
         [massive blur]           ↓                 [massive blur]
```

"Now when you encounter 'the'—which 'the' are we talking about? The one from word 3? Word 50,000? Word 98,000?"

*(Turn back to audience)*

"This is exactly how Large Language Models work. They use something called the **attention mechanism**. And attention has a cost."

**Click to next slide: "The Attention Mechanism"**

---

### Technical Explanation: Attention & Quadratic Complexity (3 minutes)

---

**Click to slide with technical diagram**

---

"Here's the technical reality, and I'll keep this accessible:" *(point to diagram)*

"Every token—that's roughly a word or part of a word—needs to 'pay attention' to every other token to understand context."

"Let me show you the math:"

*(Write formula on board)*

```
Attention Operations = N²

Where N = number of tokens
```

"This is quadratic complexity. Watch what happens:"

*(Build a table live)*

| Tokens | Attention Operations |
|--------|---------------------|
| 1,000 | 1,000,000 |
| 10,000 | 100,000,000 |
| 100,000 | 10,000,000,000 |
| 200,000 | 40,000,000,000 |

*(Point to the jump)*

"Do you see this? Going from 100k to 200k tokens doesn't double the work—it QUADRUPLES it."

"But here's the thing that really matters: **Quality degrades before quantity limits.**"

---

### The Quality Degradation Curve (2 minutes)

**Click to slide: Quality vs Context graph**

---

*(Display the graph you described earlier)*

```
Quality
    ↑
100%|  ╭──────╮
    | ╱        ╲
75% |╱          ╲
    |            ╲
50% |             ╲_________
    |
25% |                       ╲_________________
    |
    0%────┬────┬────┬────┬────┬────> Context Size
         50k 100k 150k 200k 250k 300k
```

"This graph is based on real measurements. Claude's creators have determined that:"

*(point to regions)*

"- **0-100k tokens**: Sweet spot. Claude is brilliant. This is where you want to be."

"- **100k-200k tokens**: Degradation zone. Claude starts losing coherence, making mistakes."

"- **200k+ tokens**: Danger zone. Hallucinations, contradictions, chaos."

*(Face audience)*

"Now here's the crucial insight: **The problem isn't the SIZE of your project. The problem is trying to fit your WHOLE project into ONE context window.**"

**Click to next slide**

---

### The Traditional Solutions (And Why They Fail) (2 minutes)

---

**Click to slide: "Traditional Approaches"**

---

"So when developers hit this problem, what do they try?"

*(Go through each)*

**Approach 1: "Just be more specific"**

"You think, 'I'll write incredibly detailed prompts.' Here's why this fails: More specific = more tokens = you hit the limit FASTER."

**Approach 2: "Use bigger context windows"**

"You think, 'I'll use the 200k token window.' But remember the graph: At 200k, you're already in the degradation zone. It's not a SOLUTION, it's just a bigger bucket that leaks."

**Approach 3: "Start new conversations"**

"You think, 'I'll just start fresh when it gets confused.' But now you've lost all the context from the previous conversation. You're manually managing state."

**Approach 4: "Copy-paste manually"**

"You think, 'I'll copy the important stuff into a new chat.' This is actually CLOSE to right, but it's error-prone, tedious, and doesn't scale."

*(Pause)*

"All of these are fighting against the grain. They're treating the constraint as a bug, not a feature."

**Click to next slide**

---

### The GSD Insight: Work WITH The Constraint (2 minutes)

---

**Click to slide: "The GSD Insight"**

---

"GSD was built on a different philosophy. Let me show you the key insight:"

*(Build this diagram step by step)*

```
┌─────────────────────────────────────────┐
│  ❌ WRONG APPROACH:                     │
│  "Fit everything in ONE context"       │
│                                         │
│  [100k token project] → [200k window]  │
│  Result: Degraded quality              │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  ✅ GSD APPROACH:                       │
│  "Break into FRESH contexts"           │
│                                         │
│  [Task 1: 50k] → [Fresh 200k context]  │
│  [Task 2: 50k] → [Fresh 200k context]  │
│  [Task 3: 50k] → [Fresh 200k context]  │
│  Result: Peak quality every time       │
└─────────────────────────────────────────┘
```

"See the difference?"

"In the wrong approach, you're trying to squeeze a 100k token project into a 200k window—and you're sharing that space with prompts, responses, everything. You end up in the degradation zone."

"In the GSD approach, each task gets a FRESH 200k context window. You're never near the limit. You're always in the sweet spot."

**Click to final slide for Section 2**

---

### Summary: The Problem Restated (1 minute)

---

**Click to summary slide**

---

"So let me restate the problem clearly:"

**1. LLMs use attention mechanisms that scale quadratically**
   - More tokens = exponentially more work

**2. Quality degrades BEFORE hard limits**
   - 200k window exists, but quality drops before you hit it
   - Sweet spot is 0-100k tokens

**3. Traditional solutions fight the constraint**
   - Being specific uses MORE tokens
   - Bigger windows just delay the problem
   - Starting over loses context

**4. GSD's insight: Work within the sweet spot**
   - Fresh context per task
   - Each task stays under 100k tokens
   - State files preserve what matters

*(Transition to next section)*

"Now that we understand the problem, let's look at GSD's solution. The four pillars that make this work."

**Click to Section 3 title slide**

---

## Teaching Notes for Sections 1-2

### Pacing Tips

**Section 1 (5 minutes):**
- Opening hook should feel personal
- Don't rush the hands-raising
- Make eye contact during agenda
- Energy should be high but authentic

**Section 2 (10 minutes):**
- This is the technical meat—slow down here
- The whiteboard diagrams are worth the time
- Make sure the quadratic complexity math lands
- The quality graph is your most important visual
- Save time for the GSD insight—it's the payoff

### Common Student Questions to Address

**"Why can't they just fix LLMs to handle more context?"**
- You can mention: Research is ongoing, but quadratic scaling is fundamental to attention mechanisms. "Fixing it" would require entirely new architectures.

**"I've had great 200k token conversations—what gives?"**
- Acknowledge: Simple conversations (storytelling, analysis) work fine at 200k. The problem is complex tasks with lots of code, many decisions, and interdependencies.

**"What about GPT-4 Turbo or Claude 3 with 1M tokens?"**
- Clarify: Token count isn't the issue—complexity is. Even with 1M tokens, if you have 100k tokens of code + decisions + prompts, attention is spread thin.

### Physical Aids

- **Whiteboard/flipchart**: For attention mechanism diagram
- **Pointer**: For highlighting graph regions
- **Remote**: For advancing slides while walking stage

### Transitions to Watch

**Section 1 → 2:**
"Let me show you WHY this happens."

**Section 2 → 3:**
"Now that we understand the problem, here's the solution."

---

## Slide Deck Outline (Sections 1-2)

**Slide 1: Title**
- "Get Shit Done (GSD)"
- "Managing AI Context Through Surgical Task Breakdown"
- Your name, date

**Slide 2: Opening Question**
- "Raise your hand if..."
- List the symptoms
- Space for audience interaction

**Slide 3: What is GSD?**
- Bullet points
- GitHub stats
- The one-liner pitch

**Slide 4: Agenda**
- 7 sections listed with times
- Learning outcomes

**Slide 5: Who Has Experienced...?**
- Checklist of symptoms
- "This is universal, not your fault"

**Slide 6: How LLMs Read Context**
- Simple diagram of attention
- Visual of "all words equally active"

**Slide 7: The Attention Mechanism**
- N² formula
- The math table
- Visual showing explosion

**Slide 8: Quality vs Context Size**
- The graph
- Sweet spot highlighted
- Danger zone marked

**Slide 9: Traditional Approaches**
- 4 approaches listed
- Why each fails

**Slide 10: The GSD Insight**
- Side-by-side comparison
- Wrong vs GSD approach
- Visual diagram

**Slide 11: Problem Summary**
- 4 numbered points
- Transition to solution

---

## End of Sections 1-2

*Continue to Sections 3-7 for full narrative...*
