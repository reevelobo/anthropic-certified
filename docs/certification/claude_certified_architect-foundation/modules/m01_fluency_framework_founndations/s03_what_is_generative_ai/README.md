# What Is Generative AI

## Generative AI Fundamentals

### Introduction to Generative AI - Notes

## What Is Generative AI?

- **Generative AI** refers to artificial intelligence systems that can **create new content** rather than simply analyze existing data.
- Example:
  - **Traditional AI:** Classifies emails as spam or not spam.
  - **Generative AI:** Creates a brand-new email.
- This represents a shift from **analyzing and categorizing** information to **generating new content**.

---

## Large Language Models (LLMs)

- LLMs are a major type of generative AI.
- Examples include Anthropic's **Claude** models.
- They are called:
  - **Language Models** because they are trained to understand and generate human language.
  - **Large** because they contain **billions of parameters**.
- Parameters are mathematical values that influence how the model processes information, somewhat similar to neural connections in the human brain.

---

## Three Key Developments That Enabled Modern Generative AI

### 1. Algorithmic and Architectural Breakthroughs

- Neural networks have existed for decades.
- The introduction of the **Transformer Architecture** in **2017** was a major breakthrough.
- Transformers are effective at:
  - Processing sequences of text.
  - Maintaining relationships between words across long passages.
  - Understanding context and meaning.

---

### 2. Explosion of Digital Data

- Large language models learn from vast collections of text, including:
  - Websites
  - Books
  - Articles
  - Code repositories
  - Other digital content
- This diverse data helps models develop:
  - Broad knowledge
  - Language understanding
  - Conceptual relationships

---

### 3. Increased Computational Power

- Training modern AI models requires enormous computing resources.
- Important technologies include:
  - **GPUs (Graphics Processing Units)**
  - **TPUs (Tensor Processing Units)**
  - Distributed computing clusters
- These technologies make large-scale model training possible.

---

## Scaling Laws

- Researchers discovered that model performance improves predictably when:
  - Models become larger.
  - More data is used.
  - More computational power is available.

### Emergent Capabilities

As models scale, unexpected abilities emerge, including:

- Step-by-step reasoning
- Problem solving
- Adapting to unfamiliar tasks
- Learning from minimal instructions

These capabilities were not explicitly programmed into the models.

---

## How LLMs Learn: Pre-Training

### Pre-Training Process

- Models analyze billions of text examples.
- Their primary objective is to:
  - Predict the next word (or token) in a sequence.
- Through repeated prediction and correction, models learn:
  - Grammar
  - Language patterns
  - Facts and knowledge
  - Relationships between concepts

### Outcome

- The model builds a complex statistical representation of:
  - Language
  - Knowledge
  - Human communication patterns

---

## Fine-Tuning

After pre-training, models undergo **fine-tuning**.

### Purpose

Fine-tuning teaches models to:

- Follow instructions
- Generate useful responses
- Avoid harmful content
- Improve overall performance

### Techniques Used

#### Human Feedback

- Humans evaluate and rate model responses.
- Feedback helps improve model behavior.

#### Reinforcement Learning

- Rewards desirable outputs.
- Penalizes undesirable outputs.
- Encourages models to become:
  - Helpful
  - Honest
  - Harmless

---

## How Interaction Works

When a user interacts with an LLM:

1. The user provides a **prompt**.
2. The model reads the prompt.
3. The model generates a response based on learned patterns.

### Important Note

- LLMs do **not** retrieve pre-written answers from a database.
- They generate new responses dynamically based on probabilities learned during training.

---

## Context Window

### Definition

The **context window** is the amount of information a model can consider at one time.

It functions like the AI's **working memory**.

### What It Includes

- User prompts
- Previous AI responses
- Shared conversation information

### Limitations

- Models cannot access information outside the current context window.
- Additional tools may be required, such as:
  - Web search
  - Retrieval systems
  - External databases

---

## Three Characteristics That Make Modern Generative AI Powerful

### 1. Learning from Vast Amounts of Information

- Training on enormous datasets enables models to learn:
  - Complex language patterns
  - World knowledge
  - Conceptual relationships

---

### 2. In-Context Learning

- Models can adapt to new tasks using:
  - Instructions
  - Examples
  - Prompt guidance
- Additional training is often unnecessary.

---

### 3. Emergent Capabilities

- New abilities appear as models become larger.
- These capabilities can exceed what researchers initially expected.

---

## Key Takeaways

- Generative AI creates new content rather than simply analyzing data.
- LLMs rely on the Transformer architecture and billions of parameters.
- Three major factors enabled modern AI:
  1. Transformer-based breakthroughs
  2. Massive amounts of training data
  3. Increased computing power
- Models learn through next-word prediction during pre-training.
- Fine-tuning improves helpfulness, safety, and instruction

### Capabilities and Fundamentals

### What Generative AI Can and Cannot Do

Understanding the strengths and limitations of generative AI helps us use it more effectively. Like learning how a new colleague works best, knowing where AI excels and where it struggles allows for better collaboration.

---

### What LLMs Do Well

Modern Large Language Models (LLMs) are highly versatile and capable across a wide range of language tasks.

#### Language Generation and Communication

LLMs can:

- Draft emails that match a desired tone or style.
- Summarize long documents into concise key points.
- Translate text between languages.
- Explain complex topics in simple terms.
- Create content such as:
  - Articles
  - Reports
  - Poems
  - Brainstorming ideas
  - Marketing copy

#### Adaptability Across Tasks

One of the most remarkable capabilities of LLMs is their ability to switch between tasks without additional training.

Examples include:

- Writing creative content.
- Planning events.
- Explaining scientific concepts.
- Analyzing business trends.
- Assisting with coding tasks.

The same model can perform all of these tasks through natural conversation.

#### Conversational Memory

LLMs can maintain context throughout a conversation.

For example:

- A user mentions a project deadline early in the discussion.
- Later references "the deadline."
- The model can typically understand what is being referenced and continue the conversation accordingly.

#### Tool Use and External Knowledge

Many modern AI systems can connect to external tools, enabling them to:

- Search the web.
- Analyze files and documents.
- Access databases.
- Use software applications.

These capabilities significantly expand what AI can help accomplish.

---

### What LLMs Cannot Do Well

Despite their impressive abilities, LLMs have important limitations.

---

### 1. Knowledge Cutoff Limitations

LLMs are trained on data available up to a specific point in time.

#### Knowledge Cutoff

- Every model has a training cutoff date.
- Information after that date is not part of the model's built-in knowledge.
- Without external tools, the model cannot inherently know about newer events.

#### Example

A model trained through November 2024 would not automatically know about:

- Events occurring after November 2024.
- Newly published research.
- Recently released products.
- Current news.

To access current information, the model needs tools such as:

- Web search
- Databases
- Retrieval systems

---

### 2. Hallucinations

LLMs can sometimes generate information that sounds convincing but is incorrect.

#### What Is a Hallucination?

A hallucination occurs when a model:

- Produces inaccurate information.
- Invents facts, sources, dates, or details.
- States incorrect information confidently.

#### Why Hallucinations Happen

Because LLMs:

- Generate responses based on learned patterns.
- Do not verify every statement against a factual database.
- May combine information incorrectly.

#### Example

An AI might confidently provide:

- An incorrect citation.
- A nonexistent research paper.
- An inaccurate historical fact.

This is similar to a person confidently telling a story while getting some details wrong.

---

### 3. Context Window Constraints

LLMs have a limited amount of information they can consider at one time.

#### Context Window

The context window includes:

- User prompts
- AI responses
- Documents provided during the interaction

#### Limitation

Once the context window is exceeded:

- Older information may be dropped.
- The model may forget earlier details.
- Large documents may become difficult to process fully.

This is often handled on a first-in, first-out basis.

---

### 4. Non-Deterministic Behavior

Unlike traditional software, LLMs do not always provide identical outputs.

#### What This Means

If you ask the same question multiple times:

- The response may vary slightly.
- Different wording or examples may be produced.
- The overall answer may remain similar but not identical.

#### Why This Happens

LLMs generate text probabilistically.

They predict:

> "What is the most likely next word or token?"

rather than retrieving a fixed response.

#### Temperature

Developers can control response randomness through a setting called **temperature**.

- Lower temperature:
  - More predictable
  - More consistent

- Higher temperature:
  - More creative
  - More varied

---

### 5. Challenges with Complex Reasoning

Historically, LLMs have struggled with:

- Multi-step mathematics
- Formal logic problems
- Complex reasoning chains

Examples include:

- Mathematical proofs
- Advanced calculations
- Difficult logical puzzles

#### Recent Improvements

Newer reasoning-focused models:

- Break problems into steps.
- Perform extended reasoning.
- Produce more reliable results on complex tasks.

Significant progress continues in this area.

---

### 6. Limited Access to Data and Tools

Even highly capable models can only work with the information and tools available to them.

#### Example

Imagine a brilliant coworker who:

- Understands the problem perfectly.
- Cannot access the company's internal database.

Their ability to help is still limited.

Similarly, AI may be unable to complete a task if it lacks access to:

- Internal systems
- Proprietary databases
- Specialized software
- Required external tools

No amount of intelligence can compensate for missing information.

---

### Ongoing Improvements

Researchers are actively working to reduce current limitations.

Key approaches include:

#### Retrieval-Augmented Generation (RAG)

RAG allows models to:

- Access external knowledge sources.
- Retrieve current information.
- Ground responses in real documents.

#### Improved Tool Use

Modern systems are increasingly able to:

- Search the web.
- Analyze files.
- Use APIs.
- Interact with external applications.

#### Enhanced Reasoning

Researchers continue improving:

- Logical reasoning
- Mathematical problem solving
- Multi-step decision making

---

### The Human-AI Partnership

The most effective use of AI combines the strengths of humans and machines.

#### Human Strengths

Humans contribute:

- Critical thinking
- Judgment
- Creativity
- Domain expertise
- Ethical decision-making
- Contextual understanding

#### AI Strengths

AI contributes:

- Speed
- Scalability
- Pattern recognition
- Information processing
- Content generation
- Consistency in repetitive tasks

Together, these strengths create more effective outcomes than either working alone.

---

### Why AI Fluency Matters

Understanding both AI capabilities and limitations helps users:

- Choose appropriate use cases.
- Verify important information.
- Avoid overreliance on AI outputs.
- Improve productivity.
- Collaborate more effectively with AI systems.

As AI technology continues to evolve, ongoing learning and experimentation remain essential for staying current and discovering new possibilities.

---

### Key Takeaways

- LLMs excel at language generation, summarization, explanation, translation, and content creation.
- They can adapt to many different tasks without additional training.
- Modern models can maintain conversational context and use external tools.
- LLMs are limited by:
  - Knowledge cutoffs
  - Hallucinations
  - Context window constraints
  - Non-deterministic outputs
  - Reasoning challenges
  - Limited tool and data access
- Retrieval-Augmented Generation (RAG), tool use, and advanced reasoning models are helping overcome many current limitations.
- The most powerful applications combine human strengths such as judgment and creativity with AI strengths such as speed, scale, and pattern recognition.