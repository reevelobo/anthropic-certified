# SS01 · Overview of Claude Models

# Claude model family

|                      | Claude Opus | Claude Sonnet | Claude Haiku |
|----------------------|-------------|---------------|--------------|
| **Description** | Highest level of intelligence | Intelligent model that balances quality, speed, cost | Most cost-efficient and latency-optimized model |
| **Cost** | High | Medium | Low |
| **Comparative latency** | Moderate | Fast | Fastest |
| **Supports reasoning** | Yes | Yes | No |
| **Best used for** | • Advanced software development, especially large-scale architecting<br>• Long running tasks that require sustained focus<br>• Strategic planning with multi-step problem solving<br>• Tasks that could benefit from advanced reasoning | • Common coding tasks<br>• Document creation and editing<br>• Content marketing and copywriting<br>• Data analysis and visualization projects<br>• Image analysis<br>• Process automation | • Quick code completions and suggestions<br>• Content moderation and filtering<br>• Data extraction and categorization<br>• Language translation<br>• Q&A systems and knowledge retrieval<br>• Most high-volume, straightforward text processing tasks |

# Picking the right model

**Claude Opus**
- Highly intelligent
- More expensive
- Higher latency

**Claude Sonnet**
- Strong balance of intelligence, cost, and speed

**Claude Haiku**
- Moderate intelligence
- Low cost
- Highest speed




# Picking the right model
**Model spectrum**

```mermaid
flowchart LR
    A[Claude Opus<br/>Highly intelligent<br/>More expensive<br/>Higher latency]
    B[Claude Sonnet<br/>Strong balance of intelligence,<br/>cost, and speed]
    C[Claude Haiku<br/>Moderate intelligence<br/>Low cost<br/>Highest speed]

    A --> B --> C

Intelligence ←────────────────────────────────────────→ Cost / Speed

Claude Opus → Claude Sonnet → Claude Haiku