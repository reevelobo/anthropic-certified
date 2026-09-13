# SS12 · The Web Search Tool

**Important Note:** Your organization must enable the Web Search tool in the settings console before using it. You can find this setting here:

https://console.anthropic.com/settings/privacy

Claude includes a built-in web search tool that lets it search the internet for current or specialized information to answer user questions. Unlike other tools where you need to provide the implementation, Claude handles the entire search process automatically. You only need to provide a simple schema to enable it.

[:material-notebook-outline: Open Jupyter Notebook](../../notebooks/16.web_search.ipynb){ .md-button .md-button--primary }

![alt text](image.png)

## Setting Up the Web Search Tool

To use the web search tool, create a schema object with these required fields:

```python
web_search_schema = {
    "type": "web_search_20250305",
    "name": "web_search",
    "max_uses": 5
}
```

The `max_uses` field limits how many searches Claude can perform. Claude might do follow-up searches based on initial results, so this prevents excessive API calls. A single search returns multiple results, but Claude may decide additional searches are needed.

## How the Response Works

When Claude uses the web search tool, the response contains several types of blocks:

- **Text blocks**: Claude's explanation of what it's doing
- **ServerToolUseBlock**: Shows the exact search query Claude used
- **WebSearchToolResultBlock**: Contains the search results
- **WebSearchResultBlock**: Individual search results with titles and URLs
- **Citation blocks**: Text that supports Claude's statements

![alt text](image-1.png)

The response structure lets you see exactly what Claude searched for and which sources it found.

Citations include the specific text Claude used to support its answers, along with the source URLs.

## Restricting Search Domains

You can limit searches to specific domains using the `allowed_domains` field. This is particularly useful when you want reliable, authoritative sources.

```python
web_search_schema = {
    "type": "web_search_20250305",
    "name": "web_search",
    "max_uses": 5,
    "allowed_domains": ["nih.gov"]
}
```

For example, when asking about medical or exercise advice, restricting searches to domains such as PubMed (`nih.gov`) helps ensure that responses are based on authoritative, evidence-based sources rather than arbitrary blog content.

![alt text](image-2.png)

## Rendering Search Results

The different block types in the response are designed for specific UI rendering:

- Render text blocks as regular content
- Display web search results as a list of sources at the top
- Show citations inline with the text, including:
  - Source domain
  - Page title
  - URL
  - Quoted text

![alt text](image-3.png)

This structure helps users understand how Claude arrived at its answers and provides transparency about the sources being used.

The citation format makes it clear which specific information came from which sources, building trust in the AI's responses.

## Practical Usage

The web search tool works best for:

- Current events and recent developments
- Specialized information not included in Claude's training data
- Fact-checking and locating authoritative sources
- Research tasks requiring up-to-date information

Simply include the schema in your tools array when making API calls, and Claude will automatically decide when a web search would help answer the user's question.