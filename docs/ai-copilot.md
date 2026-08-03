# Think It AI Copilot & Conversational Knowledge Search (`docs/ai-copilot.md`)

> **Application:** Think It - Meeting Memory AI & Enterprise Organizational Intelligence Platform  
> **Module:** `src/server/copilot/`

---

## 1. Conversational RAG Architecture

```
User Question ("What decisions were made about Project Alpha?")
                           │
                           ▼
                 [ IntentClassifier ] ──► Classifies intent as 'SEARCH_DECISION'
                           │
                           ▼
             [ CopilotRetrievalService ] ──► Queries Knowledge Search Service & Vector Store
                           │
                           ▼
                 [ CitationBuilder ] ──► Builds grounded meeting source citations [1]
                           │
                           ▼
               [ CopilotAnswerService ] ──► Synthesizes grounded natural language answer via AIGateway
                           │
                           ▼
              [ Microsoft Teams Copilot ] ──► Delivered to User
```

---

## 2. Intent Classification Taxonomy

- `SEARCH_MEETING`: Natural language query seeking meeting metadata or overview.
- `SEARCH_DECISION`: Query targeting agreed key decisions.
- `SEARCH_ACTION_ITEM`: Query targeting assigned action items, deliverables, and assignees.
- `SEARCH_RISK`: Query targeting operational risks or obstacles.
- `SEARCH_PROJECT`: Project-level knowledge retrieval.
- `SEARCH_PERSON`: Participant-level action or decision retrieval.
- `SUMMARY_REQUEST`: Synthesis request across multiple meetings.

---

## 3. Registered Copilot REST Endpoints (`/api/copilot/*`)

- `POST /api/copilot/chat`: Accepts user natural language question and returns grounded answer with citations.
- `GET /api/copilot/conversations/:id`: Fetches multi-turn conversation session history.
- `DELETE /api/copilot/conversations/:id`: Clears active conversation context window.
- `GET /api/copilot/health`: Returns AI Copilot engine health status.
