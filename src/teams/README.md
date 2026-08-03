# Microsoft Teams Application Architecture (`src/teams/`)

> **Location:** Built directly inside the existing `PROJECTPLUGIN` codebase.  
> **Phase:** Phase 12 - AI Copilot & Conversational Knowledge Search Complete.

---

## 1. AI Copilot Architecture (`src/server/copilot/`)

```
src/server/copilot/
├── models/                         # copilot.models.ts
├── contracts/                      # copilot.contracts.ts
├── conversation/                   # ConversationManager.ts
├── intent/                         # IntentClassifier.ts
├── retrieval/                      # CopilotRetrievalService.ts
├── citations/                      # CitationBuilder.ts
├── generation/                     # CopilotAnswerService.ts
├── memory/                         # ConversationMemoryService.ts
├── logging/                        # CopilotLogger.ts
└── metrics/                        # CopilotMetrics.ts
```

---

## 2. Intent Classification Matrix

- `SEARCH_MEETING` / `SEARCH_DECISION` / `SEARCH_ACTION_ITEM` / `SEARCH_RISK` / `SEARCH_PROJECT` / `SEARCH_PERSON` / `SUMMARY_REQUEST`.

---

## 3. Registered AI Copilot Endpoints (`/api/copilot/*`)

- `POST /api/copilot/chat`: Accepts user natural language question and returns grounded answer with citations.
- `GET /api/copilot/conversations/:id`: Fetches multi-turn conversation session history.
- `DELETE /api/copilot/conversations/:id`: Clears active conversation context window.
- `GET /api/copilot/health`: Returns AI Copilot engine health status.
