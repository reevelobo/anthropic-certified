# SS07 · Quiz on Prompt Engineering Techniques

# Transcription of Image Content

## Question

You want Claude to create a workout plan. Which opening line works better?

### Options

1. "Create a 30-minute workout plan for beginners"

2. "Do you know anything about exercise?"

3. "I was wondering about workouts and fitness stuff"

4. "What kind of workout should I do?"

---

# Correct Answer

✅ **"Create a 30-minute workout plan for beginners"**

---

# Technical Reasoning

## Why Option 1 Is Correct

### 1. Clear Task Specification

The prompt directly tells the AI:

- What to do: **Create a workout plan**
- Duration: **30 minutes**
- Audience: **Beginners**

This minimizes ambiguity and provides all critical task parameters up front.

**Prompt Engineering Principle:** Specific instructions generally produce more accurate and relevant outputs because the model has clear constraints to work within.

---

### 2. Action-Oriented Prompt

The prompt starts with a command:

> "Create a 30-minute workout plan for beginners"

This immediately initiates task execution.

The AI can begin generating the workout plan without needing additional clarification.

---

### 3. Contains Relevant Context

Good prompts include context that helps the model shape the response.

Here, the context includes:

- Fitness domain
- Workout duration
- User experience level

The model can tailor exercises, intensity, and pacing appropriately.

---

### 4. Reduces Follow-Up Questions

Because the request is specific, the AI does not need to determine:

- Whether the user wants cardio or strength training
- Whether the user is a beginner or advanced athlete
- How long the session should be

The prompt already answers some of the most important design constraints.

---

# Why the Other Options Are Weaker

## Option 2

> "Do you know anything about exercise?"

### Problems

- Asks about the AI's knowledge rather than the actual task.
- Does not request a workout plan.
- Creates an unnecessary conversational step.

### Likely Result

The AI will respond with something similar to:

> "Yes, I can help with exercise and fitness."

The user still needs to provide the actual request afterward.

---

## Option 3

> "I was wondering about workouts and fitness stuff"

### Problems

- Extremely vague.
- No explicit task.
- No duration.
- No fitness level.
- No desired outcome.

### Likely Result

The AI will need clarification before producing a useful answer.

---

## Option 4

> "What kind of workout should I do?"

### Problems

Although better than Options 2 and 3, it still lacks important context:

- Fitness level unknown.
- Session length unknown.
- Goals unknown.
- Available equipment unknown.

### Likely Result

The AI may either:
- Ask follow-up questions, or
- Make assumptions that may not match the user's needs.

---

# Prompt Engineering Principle Demonstrated

This question illustrates a core prompt-engineering best practice:

> **State the desired task clearly, provide necessary context, and include relevant constraints.**

A strong prompt typically contains:

1. **Task** — What should be done?
2. **Context** — What is the situation?
3. **Constraints** — Duration, audience, format, limits, etc.
4. **Desired Output** — What should the response look like?

Example:

```text
Create a 30-minute workout plan for beginners. Include a 5-minute warm-up, 20-minute workout, and 5-minute cool-down. Use only bodyweight exercises.

# Transcription of Image Content

## Question

Claude keeps missing sarcastic comments when analyzing social media posts. What's the best way to fix this?

### Options

1. Ask it to guess when something might be sarcastic

2. Provide examples showing sarcastic posts labeled as negative

3. Tell it to "be more careful about sarcasm"

4. Make the prompt longer with more instructions

---

# Correct Answer

✅ **Provide examples showing sarcastic posts labeled as negative**

---

# Technical Reasoning

## Why This Is the Correct Answer

This question tests a fundamental concept in prompt engineering and machine learning:

> **Models learn desired behavior more effectively from concrete examples than from vague instructions.**

When sarcasm is being missed, the problem is not necessarily a lack of instructions. The problem is that sarcasm often requires contextual pattern recognition.

By providing examples such as:

```text
Post: "Great, my flight got delayed another 5 hours."
Sentiment: Negative

Post: "Wonderful, another Monday morning traffic jam."
Sentiment: Negative

Post: "Just what I needed, my laptop crashed before the presentation."
Sentiment: Negative
```

the model can infer:

- Common sarcasm structures
- Positive surface wording hiding negative intent
- Contextual sentiment clues
- Linguistic patterns associated with irony

This approach is known as **few-shot prompting** or **example-based guidance**, which is one of the most effective techniques for improving task performance.

---

## Technical Background

Large Language Models do not truly "understand" sarcasm in the human sense.

Instead, they recognize statistical patterns learned during training.

Sarcasm is difficult because:

### Literal Meaning

```text
"Great, my computer just crashed."
```

Contains a positive word:

```text
Great
```

A simple sentiment analysis approach may incorrectly classify the sentence as positive.

### Intended Meaning

Humans recognize that:

- Computer crashes are undesirable.
- The positive word is being used ironically.
- The actual sentiment is negative.

Providing examples teaches the model which signals indicate sarcastic sentiment.

---

# Why the Other Answers Are Inferior

## Option 1

> Ask it to guess when something might be sarcastic

### Problems

- Encourages speculation.
- Increases false positives.
- Does not teach the model what sarcasm looks like.

### Technical Issue

Guessing introduces uncertainty rather than improving classification accuracy.

---

## Option 2

> Provide examples showing sarcastic posts labeled as negative

### Advantages

- Demonstrates desired output.
- Establishes decision boundaries.
- Reduces ambiguity.
- Improves pattern recognition.
- Uses few-shot learning principles.

### Technical Assessment

This is the strongest method because it directly addresses the failure mode with training-style examples.

---

## Option 3

> Tell it to "be more careful about sarcasm"

### Problems

This instruction is vague.

The model receives no information about:

- How sarcasm appears
- What cues to look for
- Which situations are commonly sarcastic

### Likely Result

Only marginal improvement, if any.

---

## Option 4

> Make the prompt longer with more instructions

### Problems

Longer prompts are not automatically better.

Additional instructions may:

- Increase complexity
- Introduce confusion
- Dilute important guidance

Without examples, the model still lacks concrete demonstrations of sarcastic language patterns.

### Prompt Engineering Principle

Quality and relevance of instructions matter more than prompt length.

---

# Prompt Engineering Principle Demonstrated

This question demonstrates a core AI prompting best practice:

> **Show, don't just tell.**

Example-driven prompts are often more effective than instruction-only prompts because they:

1. Provide clear behavioral patterns.
2. Reduce ambiguity.
3. Establish expected outputs.
4. Improve consistency.
5. Help the model handle edge cases such as sarcasm, irony, and nuanced sentiment.

---

# Example of an Improved Prompt

```text
Analyze the sentiment of social media posts.

Examples:

Post: "Great, my flight got canceled."
Sentiment: Negative

Post: "Wonderful, another software outage."
Sentiment: Negative

Post: "I love how my internet disconnects during meetings."
Sentiment: Negative

Now classify the following post:
[INSERT POST]
```

This prompt gives the model concrete evidence of how sarcasm should be interpreted.

---

# Key Learning

When a model consistently misclassifies a specific pattern (such as sarcasm), the most effective remediation is often:

1. Provide representative examples.
2. Label them correctly.
3. Demonstrate the desired behavior through few-shot prompting.

This approach is typically more reliable than adding vague instructions or asking the model to "try harder."

---

# Final Answer

✅ **Provide examples showing sarcastic posts labeled as negative**

**Reason:** Example-based prompting (few-shot learning) teaches the model how sarcasm manifests in real text and is far more effective than vague instructions, longer prompts, or encouraging the model to guess.

# Transcription of Image Content

## Question

What is prompt engineering?

### Options

1. Training AI models on new datasets

2. Improving a prompt to get more reliable, higher-quality outputs

3. Programming AI models from scratch using code

4. Building the hardware infrastructure for AI systems

---

# Correct Answer

✅ **Improving a prompt to get more reliable, higher-quality outputs**

---

# Technical Reasoning

## Why This Is the Correct Answer

Prompt engineering is the practice of designing, refining, and optimizing prompts to improve the quality, accuracy, consistency, and usefulness of responses generated by AI models.

The key idea is:

> **Instead of changing the model itself, you change the instructions given to the model.**

Prompt engineering focuses on:

- Clear task specification
- Context provision
- Constraint definition
- Output formatting
- Example-driven guidance
- Iterative prompt refinement

The goal is to consistently obtain results that better match the user's intent.

---

## What Prompt Engineering Actually Involves

### Example 1: Weak Prompt

```text
Tell me about networking.
```

This prompt is extremely broad.

Possible issues:

- Scope is unclear.
- Audience is unknown.
- Technical depth is unknown.
- Desired output format is unspecified.

---

### Example 2: Engineered Prompt

```text
Explain the OSI model to an Infrastructure Specialist.

Provide:
- Layer-by-layer explanation
- Real-world examples
- Common troubleshooting scenarios
- A summary table
```

This prompt provides:

- Context
- Audience
- Required structure
- Output expectations

The resulting answer is typically more useful and consistent.

---

## Why Prompt Engineering Works

Large Language Models generate responses based on:

- The input prompt
- Training data patterns
- Context provided during inference

A prompt effectively acts as a specification for the task.

The more clearly the requirements are communicated, the more likely the model is to generate the desired output.

### Prompt = Task Specification

Think of a prompt as analogous to:

- A software requirements document
- A function definition
- A design specification

Poor specifications usually produce poor results.

Better specifications usually produce better results.

---

# Why the Other Answers Are Incorrect

## Option 1

> Training AI models on new datasets

### Why Incorrect

This is **model training** or **fine-tuning**, not prompt engineering.

Training involves:

- Collecting datasets
- Running optimization algorithms
- Updating model weights
- Consuming significant compute resources

Prompt engineering does not modify model parameters.

### Key Distinction

```text
Training = Change the model
Prompt Engineering = Change the instructions
```

---

## Option 3

> Programming AI models from scratch using code

### Why Incorrect

Building an AI model from scratch involves:

- Neural network architecture design
- Machine learning frameworks
- Training pipelines
- GPU infrastructure
- Model optimization

Prompt engineering happens after a model already exists.

Users can engineer prompts without writing any AI model code.

---

## Option 4

> Building the hardware infrastructure for AI systems

### Why Incorrect

This refers to infrastructure engineering such as:

- GPUs
- TPUs
- Servers
- Clusters
- Storage systems
- Networking systems

While these technologies support AI systems, they are unrelated to prompt engineering.

Prompt engineering focuses on interaction with AI, not hardware deployment.

---

# Prompt Engineering Techniques

## 1. Clear Instructions

Instead of:

```text
Write something about cloud computing.
```

Use:

```text
Explain cloud computing to a beginner in under 300 words.
```

---

## 2. Context Injection

Instead of:

```text
Create a report.
```

Use:

```text
Create an executive report for senior IT leadership about Azure migration risks.
```

---

## 3. Output Formatting

Instead of:

```text
Compare AWS and Azure.
```

Use:

```text
Compare AWS and Azure in a table with columns:
Service, AWS Offering, Azure Offering, Notes.
```

---

## 4. Few-Shot Prompting

Provide examples before asking the model to perform a task.

```text
Input: Great, another outage.
Sentiment: Negative

Input: Perfect, my laptop crashed.
Sentiment: Negative

Input: [New Text]
Sentiment:
```

This helps the model learn the desired pattern.

---

## 5. Constraint Definition

```text
Summarize this document in exactly 5 bullet points.
```

Constraints help control output quality and consistency.

---

# Real-World Benefits of Prompt Engineering

Effective prompt engineering can improve:

### Accuracy

The model better understands the intended task.

### Consistency

Outputs become more predictable.

### Efficiency

Fewer follow-up prompts are needed.

### Formatting

Results match desired structure.

### Task Performance

Complex workflows become easier to execute.

Examples:

- Content creation
- Code generation
- Data analysis
- Report writing
- Troubleshooting
- Knowledge extraction
- Customer support automation

---

# Core Principle

Prompt engineering is based on the idea that:

> **The quality of AI output is heavily influenced by the quality of the input prompt.**

A well-designed prompt can often improve results significantly without retraining, fine-tuning, or modifying the underlying AI model.

---

# Final Answer

✅ **Improving a prompt to get more reliable, higher-quality outputs**

**Reason:** Prompt engineering is the practice of designing and refining prompts to guide an AI model toward more accurate, consistent, and useful outputs without changing the model itself.


# Transcription of Image Content

## Question

"Providing sample input/output pairs to guide AI responses" describes which prompt engineering technique?

### Options

1. Being clear and direct

2. Iterative refinement

3. XML structuring

4. One-shot or multi-shot prompting

---

# Correct Answer

✅ **One-shot or multi-shot prompting**

---

# Technical Reasoning

## Why This Is the Correct Answer

The phrase:

> "Providing sample input/output pairs to guide AI responses"

directly describes **example-based prompting**, commonly known as:

- **One-shot prompting** (providing one example)
- **Few-shot prompting** (providing several examples)
- **Multi-shot prompting** (a broader term for providing multiple examples)

In this technique, the model is shown examples of:

```text
Input → Desired Output
```

before being asked to solve a new instance of the same task.

The examples help establish:

- Expected behavior
- Output format
- Classification rules
- Reasoning patterns
- Edge-case handling

This is one of the most effective prompt-engineering techniques for improving accuracy without changing the underlying model.

---

# Understanding One-Shot and Multi-Shot Prompting

## One-Shot Prompting

The model receives a single example.

### Example

```text
Input: Great, my laptop crashed.
Sentiment: Negative

Input: Wonderful, another network outage.
Sentiment:
```

The model learns from the single example that apparently positive words may indicate negative sentiment when used sarcastically.

---

## Few-Shot / Multi-Shot Prompting

The model receives multiple examples.

### Example

```text
Input: Great, my laptop crashed.
Sentiment: Negative

Input: Wonderful, another network outage.
Sentiment: Negative

Input: Perfect, my meeting was canceled at the last minute.
Sentiment: Negative

Input: Fantastic, the application failed again.
Sentiment:
```

Multiple examples provide stronger pattern recognition and typically improve consistency.

---

# Why Example-Based Prompting Works

Large Language Models operate by recognizing patterns in context.

When you provide examples, you effectively demonstrate:

1. What the task is.
2. How inputs should be interpreted.
3. What outputs should look like.
4. Which edge cases matter.
5. What decision logic to follow.

This reduces ambiguity because the model can infer the desired behavior from concrete demonstrations.

---

# Technical Perspective

Consider a classification task.

Without examples:

```text
Determine if the text is Positive or Negative.

Text:
Great, another production outage.
```

The model may struggle because:

- "Great" is generally positive.
- The sentence is actually sarcastic and negative.

With examples:

```text
Text: Great, my flight got canceled.
Label: Negative

Text: Wonderful, another system outage.
Label: Negative

Text: Great, another production outage.
Label:
```

The desired pattern becomes obvious.

This greatly improves classification reliability.

---

# Why the Other Answers Are Incorrect

## Option 1

> Being clear and direct

### Why Incorrect

Being clear and direct is a general prompt-writing best practice.

Example:

```text
Summarize this report in three bullet points.
```

This is clarity and specificity.

However, it does **not** involve providing example input/output pairs.

### Key Distinction

```text
Clear Instructions ≠ Example-Based Prompting
```

---

## Option 2

> Iterative refinement

### Why Incorrect

Iterative refinement means improving prompts through repeated testing and modification.

Example:

```text
Version 1:
Summarize this article.

Version 2:
Summarize this article in five bullet points.

Version 3:
Summarize this article in five executive-level bullet points.
```

The prompt evolves through experimentation.

No example input/output pairs are required.

---

## Option 3

> XML structuring

### Why Incorrect

XML structuring is a method of organizing prompt content using tags.

Example:

```xml
<task>
Classify sentiment
</task>

<input>
Great, another outage.
</input>
```

XML may improve prompt organization, but it does not inherently provide example-based learning.

---

# Prompt Engineering Principle Demonstrated

This question highlights an important principle:

> **Models often perform better when shown examples than when given instructions alone.**

Instructions tell the model:

```text
What to do
```

Examples show the model:

```text
How to do it
```

This is why few-shot prompting is frequently used for:

- Classification
- Extraction
- Translation
- Summarization
- Formatting
- Sentiment analysis
- Structured data generation

---

# Comparison of Techniques

| Technique | Purpose |
|------------|----------|
| Being Clear and Direct | Reduce ambiguity through explicit instructions |
| Iterative Refinement | Improve prompts through repeated testing |
| XML Structuring | Organize prompt components with tags |
| One-Shot / Multi-Shot Prompting | Teach desired behavior using examples |

Only the last technique explicitly relies on sample input/output pairs.

---

# Example of One-Shot Prompting

```text
Translate English to French.

English: Hello
French: Bonjour

English: Good morning
French:
```

The example demonstrates the expected transformation.

---

# Example of Multi-Shot Prompting

```text
English: Hello
French: Bonjour

English: Good night
French: Bonne nuit

English: Thank you
French: Merci

English: Good morning
French:
```

Multiple examples strengthen the pattern being taught.

---

# Key Learning

Whenever a prompt contains:

```text
Example Input → Example Output
```

it is using a form of:

- One-shot prompting
- Few-shot prompting
- Multi-shot prompting

These examples guide the model toward the desired response pattern and often improve accuracy, consistency, and formatting.

---

# Final Answer

✅ **One-shot or multi-shot prompting**

**Reason:** Providing sample input/output pairs is the defining characteristic of one-shot and few-shot (multi-shot) prompting. The examples demonstrate the desired behavior, allowing the model to infer patterns and generate more accurate and consistent responses.

# Transcription of Image Content

## Question

What is the main purpose of using XML tags in prompts?

### Options

1. To reduce the token count of prompts

2. To increase the processing speed of AI models

3. To add structure and clarity, especially when including large amounts of content

4. To make prompts look more professional

---

# Correct Answer

✅ **To add structure and clarity, especially when including large amounts of content**

---

# Technical Reasoning

## Why This Is the Correct Answer

XML tags are commonly used in prompt engineering to create **clear structural boundaries** between different parts of a prompt.

They help separate:

- Instructions
- Context
- Reference material
- Examples
- Constraints
- Expected output formats

For example:

```xml
<task>
Analyze the following customer feedback.
</task>

<context>
The customer is discussing a recent software upgrade.
</context>

<feedback>
The update broke several workflows and caused downtime.
</feedback>

<output_format>
Provide:
1. Sentiment
2. Key Issues
3. Recommended Actions
</output_format>
```

The XML tags make it easier for the model to understand:

- What information is instructions
- What information is context
- What content should be analyzed
- How the answer should be structured

This is especially valuable when prompts become large or complex.

---

# How XML Improves Prompt Quality

## 1. Creates Explicit Sections

Without structure:

```text
Analyze the feedback below. The company recently released a software update.
The customer reported downtime. Summarize the issues and provide recommendations.
```

While understandable, the boundaries between instructions and data are unclear.

With XML:

```xml
<instructions>
Analyze the feedback.
</instructions>

<context>
Recent software update.
</context>

<customer_feedback>
The update caused downtime.
</customer_feedback>
```

The sections become unambiguous.

---

## 2. Reduces Instruction Confusion

One common prompt engineering problem is that models may confuse:

- Data
- Instructions
- Examples
- Expected outputs

For example:

```xml
<instructions>
Summarize the document.
</instructions>

<document>
Actual content here...
</document>
```

The model can more easily distinguish between:

- What to do
- What to analyze

---

## 3. Improves Maintainability

Large prompts often evolve over time.

XML provides a predictable structure:

```xml
<role>
Infrastructure Specialist
</role>

<objective>
Review architecture design
</objective>

<constraints>
Use Azure best practices
</constraints>

<reference_material>
...
</reference_material>
```

This makes prompts easier to:

- Read
- Modify
- Debug
- Reuse

---

## 4. Scales Well for Complex Workflows

Enterprise AI systems frequently use prompts containing:

- Policy documents
- Product specifications
- Code snippets
- User instructions
- Business rules

Organizing these elements with XML tags helps maintain clarity as prompt size grows.

---

# Why the Other Answers Are Incorrect

## Option 1

> To reduce the token count of prompts

### Why Incorrect

XML typically adds additional text:

```xml
<task>
</task>
```

Those tags consume tokens.

In many cases XML slightly increases token usage.

### Technical Assessment

```text
XML = Better organization
XML ≠ Token reduction
```

---

## Option 2

> To increase the processing speed of AI models

### Why Incorrect

XML tags do not directly make a model run faster.

Model inference speed depends primarily on:

- Model architecture
- Hardware
- Context length
- Computational resources

XML merely structures the content.

While better structure may improve response quality, it does not inherently increase inference speed.

---

## Option 3

> To add structure and clarity, especially when including large amounts of content

### Why Correct

This is exactly the primary purpose of XML tagging in prompts.

Benefits include:

- Clear separation of sections
- Reduced ambiguity
- Easier parsing by the model
- Better organization of large contexts
- Improved prompt maintainability

---

## Option 4

> To make prompts look more professional

### Why Incorrect

Although XML can make prompts appear more organized, appearance is not the goal.

Prompt engineering focuses on:

- Reliability
- Consistency
- Clarity
- Interpretability

Professional appearance is merely a side effect.

---

# Prompt Engineering Principle Demonstrated

This question demonstrates an important prompt-engineering principle:

> **Structure improves comprehension.**

When prompts contain multiple types of information, explicit labeling helps the model identify the role of each section.

Consider the difference:

### Unstructured

```text
Analyze this policy document. Here is the document.
...
Summarize findings.
```

### Structured

```xml
<task>
Analyze the policy document.
</task>

<document>
...
</document>

<output>
Summary of findings
</output>
```

The second version is easier for both humans and AI systems to interpret.

---

# Real-World Use Cases

XML-style tagging is particularly useful for:

## Enterprise Knowledge Systems

```xml
<policy>
...
</policy>

<question>
...
</question>
```

---

## Document Analysis

```xml
<document>
...
</document>

<analysis_requirements>
...
</analysis_requirements>
```

---

## Code Review

```xml
<source_code>
...
</source_code>

<review_criteria>
...
</review_criteria>
```

---

## Retrieval-Augmented Generation (RAG)

```xml
<context>
Retrieved documents
</context>

<query>
User question
</query>
```

This separation often improves the model's ability to use retrieved information appropriately.

---

# Key Learning

XML tags are a prompt-engineering technique used to:

- Organize information
- Separate instructions from data
- Improve readability
- Reduce ambiguity
- Handle large and complex prompts more effectively

They are not primarily intended to:

- Reduce tokens
- Increase processing speed
- Improve aesthetics

Their main value is **structure and clarity**.

---

# Final Answer

✅ **To add structure and clarity, especially when including large amounts of content**

**Reason:** XML tags help organize prompts into clearly defined sections, making it easier for AI models to distinguish instructions, context, examples, and data. This improves prompt clarity, maintainability, and reliability, particularly in large or complex prompts.