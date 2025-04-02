# Spix Project Roadmap

This document outlines planned improvements and future directions for the Spix project.

## Phase 1: Core Refinements & Branding [COMPLETED]

1.  **Project Renaming:** [DONE]
    *   Verified project name updated in `package.json`, `index.html`, `Nav.tsx`, `README.md`.
2.  **Code Cleanup & Linting:** [DONE]
    *   Ran `npm run lint` - no errors reported.
    *   Reviewed component structure - deemed acceptable for now.

## Phase 2: Multi-Model Integration Backend [COMPLETED]

1.  **Backend API Route:** [DONE]
    *   Created `api/generate.ts` using Vercel's file-based routing convention.
2.  **Environment Variables:** [DONE - Conceptual]
    *   Backend logic implemented to read `process.env.PROVIDER_API_KEY`. Actual keys need configuration during deployment.
3.  **Provider Logic:** [DONE]
    *   Implemented logic in `api/generate.ts` to handle requests based on `model` parameter (e.g., "openai/gpt-4o").
    *   Uses respective SDKs (OpenAI, Anthropic, Google GenAI).
4.  **Initial Model Support:** [DONE]
    *   Added cases for OpenAI, Anthropic, and Google in `api/generate.ts`.

## Phase 3: Frontend Integration & Model Selection [COMPLETED]

1.  **Refactor Frontend API Call:** [DONE]
    *   Updated `src/pages/Result.tsx` to use the `useChat` hook pointing to `/api/generate`.
2.  **Model Selection UI:** [DONE]
    *   Added dropdown in `Result.tsx` allowing users to select the AI model.
    *   `useChat` hook updated to send the selected model to the backend.
3.  **Vercel AI SDK / Responses API (Optional):** [DONE - Vercel AI SDK Implemented]
    *   Implemented Vercel AI SDK (`ai` package) for streaming and chat management.

## Phase 4: Advanced Features & Deployment [PENDING]

1.  **Streaming Responses:** [DONE]
    *   Implemented streaming in `api/generate.ts` using Vercel AI SDK stream helpers.
    *   Frontend (`Result.tsx`) uses `useChat` hook which handles streaming display.
2.  **Conversation History:** [DONE]
    *   `useChat` hook manages history on the frontend.
    *   Backend (`api/generate.ts`) updated to accept and process message history for context.
3.  **Tool Use / Agents:** [PENDING]
    *   Explore integrating tools (like web search) or agentic capabilities using relevant SDKs.
4.  **Deployment:** [PENDING]
    *   Ensure all backend and frontend changes are correctly configured and deployed on Vercel, including server-side environment variables.
    *   **Action Item:** Define detailed deployment steps, success criteria, and benchmarks.
    *   **Action Item:** Investigate Cloud Run/Firebase deployment feasibility if required (differs from current Vercel focus).

## Known Issues / Next Steps

*   **TypeScript Errors in `api/generate.ts`:** Persistent errors related to module resolution (`openai`, `@anthropic-ai/sdk`, `ai` package utilities) in the Vercel Edge Runtime context within the current development environment. These need resolution before deployment validation.
    *   **Status:** Addressed via package updates, import path corrections, and tsconfig adjustments. Final validation pending deployment.
*   **Deployment Planning:** Detailed plans created in `doc/next_phase_prompt.md`.
*   **Explore Phase 4.3:** Once core functionality is stable and deployed, investigate Tool Use / Agents integration.
*   **Code Quality:** Addressed suggestions from code review (useEffect dependencies, initial query handling refactor, Dockerfile optimization).
