# Effective Prompting Techniques 
### Effective Prompting: Applying the Description Competency

Prompting is one of the most practical skills when working with AI. At its core, prompting is simply the application of the **Description** competency: clearly communicating what you want, how you want it done, and how you want the AI to interact with you throughout the process.

Effective prompting is less about technical tricks and more about clear communication.

Think of it as giving instructions to a capable new colleague who is eager to help but needs enough context and guidance to perform the task successfully.

---

### What Is Prompt Engineering?

**Prompt Engineering** is the practice of designing effective instructions for AI systems.

It involves:

- Asking clear questions.
- Providing relevant context.
- Defining expectations.
- Guiding the AI toward the desired outcome.

Many prompt engineering principles are similar to effective human communication, including:

- Clarity
- Context
- Examples
- Explicit instructions

However, AI often requires greater specificity because it cannot naturally infer information the way humans can.

---

### Why Effective Prompting Matters

The quality of AI outputs often depends on the quality of your instructions.

Good prompts help AI understand:

- What you want.
- Why you want it.
- How the result should look.
- How it should approach the task.

Prompting is an iterative process that improves with experimentation and practice.

---

### Six Foundational Prompting Techniques

The video highlights six key techniques that significantly improve AI interactions:

1. Give AI context.
2. Show examples.
3. Specify output constraints.
4. Break tasks into steps.
5. Ask AI to think first.
6. Define role, style, or tone.

---

### 1. Give AI Context

#### Why It Matters

Context helps AI tailor responses to your specific needs, background, and goals.

Without context, the AI is forced to make assumptions.

---

### Example

#### Basic Prompt

> Tell me about climate change.

#### Improved Prompt

> Explain three major impacts of climate change on agriculture in tropical regions with examples from the past decade.

This version provides:

- A specific topic
- Geographic scope
- Timeframe
- Desired focus

---

### Adding Personal Context

The prompt becomes even stronger when additional background is included.

#### Enhanced Example

> Explain three major impacts of climate change on agriculture in tropical regions with examples from the past decade. I am preparing for a job interview at an agricultural research lab in Indonesia. I have a degree in ecology but limited knowledge of climate change. Provide a summary that helps me discuss the topic confidently during the interview.

Now the AI understands:

- The user's goal
- Existing knowledge level
- Intended use of the information
- Desired depth of explanation

---

### Key Idea

Provide context about:

- Who you are
- Why you're asking
- How you'll use the response
- Your existing knowledge level

---

### 2. Show Examples

#### Why It Matters

Sometimes examples communicate expectations better than explanations.

This technique is often called:

- Few-shot prompting
- Example-based prompting

---

### Example

#### Task

Convert technical language into plain English.

Instead of only describing the style, provide examples.

##### Example Inputs

Original:

> The quantum algorithm exhibits quadratic speedup.

Plain:

> The new method solves problems roughly twice as fast as previous methods.

---

Original:

> The interface leverages intuitive design paradigms.

Plain:

> The design is easy to understand and use.

---

### Benefits

Examples help the AI understand:

- Writing style
- Formatting expectations
- Tone
- Patterns to follow

The more representative the examples are, the better the AI can match your expectations.

---

### Key Idea

Whenever possible:

> Show the AI what good output looks like.

---

### 3. Specify Output Constraints

#### Why It Matters

Clearly defining requirements helps ensure the output matches your expectations.

AI performs better when specific constraints are provided.

---

### Constraints to Specify

#### Format

Examples:

- Markdown
- Table
- Executive summary
- Bullet points
- Presentation outline

---

#### Length

Examples:

- One paragraph
- 300 words
- One-page summary

---

#### Design Requirements

Examples:

- Color palette
- Layout structure
- Page sections
- User interface requirements

---

### Example

> Create a clean modern single-page art portfolio website with the following sections:
>
> - Hero
> - About Me
> - Skills
> - Portfolio Projects
> - Experience
> - Contact
>
> Include a responsive navigation bar with a mobile hamburger menu, a sunset color palette, and a dark/light mode toggle.

---

### Key Idea

The more clearly you define success, the easier it is for AI to produce useful output.

---

### 4. Break Complex Tasks into Steps

#### Why It Matters

Large or complicated requests often benefit from structured instructions.

Breaking tasks into stages gives AI a clear process to follow.

---

### Example

Instead of:

> Analyze this quarterly sales data.

Use:

> Analyze this quarterly sales data by:
>
> 1. Identifying the top-performing products.
> 2. Comparing performance against the previous quarter.
> 3. Highlighting unusual trends.
> 4. Suggesting possible causes.
> 5. Recommending actions.

---

### Benefits

Breaking a task into steps:

- Improves organization.
- Reduces ambiguity.
- Produces more comprehensive responses.
- Increases consistency.

---

### Key Idea

For complex tasks:

> Explain both the destination and the route.

---

### 5. Ask AI to Think First

#### Why It Matters

For difficult questions, encouraging AI to reason through a problem before responding can improve answer quality.

---

### Example

> Before answering, think carefully through the problem. Consider relevant factors, constraints, and possible approaches before recommending the best solution.

---

### Benefits

This approach can:

- Improve reasoning quality.
- Produce more thoughtful responses.
- Reveal assumptions.
- Generate stronger recommendations.

---

### Important Principle

Reasoning should happen:

✅ Before the task is completed

Not:

❌ After the answer has already been generated

Giving AI space to think first often leads to better outcomes.

---

### 6. Define Role, Style, or Tone

#### Why It Matters

AI can adapt its communication style based on the role you assign.

Different situations benefit from different perspectives.

---

### Role-Based Prompting

#### Teacher Example

> Explain how rainbows form as an experienced science teacher speaking to a curious 10-year-old.

---

### Expert Example

> Act as a UX design expert and review this wireframe. Suggest three improvements focused on navigation and accessibility.

---

### Benefits

Role definitions help shape:

- Expertise level
- Perspective
- Communication style
- Depth of explanation

---

### Key Idea

Ask yourself:

> Who do I want the AI to act as?

---

### The Secret Weapon: Ask AI to Improve Your Prompt

When unsure how to phrase a request, ask the AI for help.

---

### Example

> I'm trying to achieve the following goal, but I'm not sure how to write an effective prompt. Can you help me craft a better prompt?

---

### Benefits

The AI can help:

- Clarify requirements.
- Improve structure.
- Add missing context.
- Suggest better wording.

---

### Prompting Is Iterative

Your first prompt will not always produce the best result.

That is normal.

Improvement comes through experimentation and refinement.

---

### Ways to Improve a Prompt

#### Add More Context

Provide:

- Goals
- Background information
- Intended audience

---

#### Add Examples

Show desired output styles.

---

#### Break Tasks into Steps

Guide the AI's process more explicitly.

---

#### Request Variations

Example:

> Give me three different versions.

---

#### Change Output Formats

Example:

> Present this as a checklist instead of paragraphs.

---

#### Check Confidence

For factual questions ask:

> How confident are you in this answer?

---

#### Start Fresh

If a conversation becomes confusing or off-track:

- Open a new chat.
- Rephrase the request.
- Try a different approach.

---

### Common Prompting Mistakes

#### Assuming AI Can Read Your Mind

Never assume important information is obvious.

Provide explicit details.

---

#### Overloading One Prompt

Avoid combining multiple unrelated tasks into a single request.

---

#### Being Too Vague

Clearly define:

- Goals
- Requirements
- Success criteria

---

#### Not Providing Feedback

If the first response is imperfect:

- Clarify expectations.
- Refine instructions.
- Continue the conversation.

---

### Best Practices for Effective Prompting

Successful prompts often include:

- A clear task overview.
- Relevant context.
- Output specifications.
- Examples when appropriate.
- Explicit constraints.
- Desired style or tone.

---

### Key Takeaways

- Prompting is the practical application of the **Description** competency.
- Effective prompting combines human communication skills with AI-specific techniques.
- The six core prompting techniques are:
  1. Give context.
  2. Show examples.
  3. Specify constraints.
  4. Break tasks into steps.
  5. Ask AI to think first.
  6. Define role, style, or tone.
- AI performs best when instructions are clear, specific, and detailed.
- Prompting is an iterative skill that improves through experimentation and practice.
- One of the most effective prompting techniques is simply asking AI to help improve your prompt.
- As AI systems evolve, specific techniques may change, but the principles of clear communication will remain valuable.