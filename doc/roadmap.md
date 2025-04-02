# Spix Project Roadmap

This document outlines planned improvements and future directions for the Spix project.

## Phase 1: Core Refinements & Branding [COMPLETED]

1.  **Project Renaming:** [DONE]
    *   Verified project name updated in `package.json`, `index.html`, `Nav.tsx`, `README.md`.
2.  **Code Cleanup & Linting:** [DONE]
    *   Ran `npm run lint` - no errors reported.
    *   Reviewed component structure - deemed acceptable for now.

## Phase 2: Multi-Model Integration Backend [REPLACED WITH GENKIT]

1.  **Backend API Route:** [DONE]
    *   Created `api/generate.ts` to act as entry point.
2.  **Environment Variables:** [DONE - Conceptual]
    *   Genkit plugins configured in `api/genkit.config.ts` read keys from environment variables (`GOOGLE_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`). Keys need configuration during deployment.
3.  **Provider Logic:** [DONE - Via Genkit]
    *   Created Genkit flow `api/flows/generateFlow.ts`.
    *   Flow selects appropriate Genkit model (`openaiModel`, `anthropicModel`, `googleAIModel`) based on input identifier.
4.  **Initial Model Support:** [DONE - Via Genkit]
    *   Configured plugins for OpenAI, Anthropic, and Google AI.

## Phase 3: Frontend Integration & Model Selection [COMPLETED]

1.  **Refactor Frontend API Call:** [DONE]
    *   Updated `src/pages/Result.tsx` to use the `useChat` hook pointing to `/api/generate`.
2.  **Model Selection UI:** [DONE]
    *   Added dropdown in `Result.tsx` allowing users to select the AI model.
    *   `useChat` hook updated to send the selected model to the backend.
3.  **Vercel AI SDK / Responses API (Optional):** [DONE - Vercel AI SDK Implemented]
    *   Implemented Vercel AI SDK (`ai` package) for streaming and chat management.

## Phase 4: Advanced Features & Deployment [IN PROGRESS]

1.  **Streaming Responses:** [BROKEN / PENDING RE-IMPLEMENTATION]
    *   Previous Vercel AI SDK streaming removed during Genkit refactor.
    *   Current Genkit backend (`api/generate.ts` using `runFlow`) does **not** stream.
    *   Frontend (`Result.tsx`) uses `useChat` hook which **expects** streaming.
    *   **Status:** Implemented streaming in `api/generate.ts` using Genkit's `generate` function with `streaming: true` and adapting the output to a `ReadableStream`.
2.  **Conversation History:** [DONE - Via Genkit]
    *   `useChat` hook manages history on the frontend.
    *   Genkit backend (`api/generate.ts`) accepts and processes message history.
3.  **Tool Use / Agents:** [PENDING]
    *   Explore integrating tools (like web search) or agentic capabilities using Genkit features.
4.  **Deployment:** [PENDING]
    *   Ensure Genkit backend and frontend changes are correctly configured for Vercel deployment.
    *   **Action Item:** Define detailed deployment steps, success criteria, and benchmarks (partially done in `next_phase_prompt.md`).
    *   **Action Item:** Investigate Cloud Run/Firebase deployment feasibility for Genkit backend if required.

## Known Issues / Next Steps

*   **TypeScript Errors:** [RESOLVED] Issues related to Genkit module resolution fixed with updated `tsconfig.json` structure (using project references).
*   **Deployment Planning:** Detailed plans created in `doc/next_phase_prompt.md`, updated for Genkit context.
*   **Explore Phase 4.3 (Genkit Tools):** Once core functionality is stable and deployed, investigate Genkit's tool/agent capabilities.
*   **Code Quality:** Addressed previous suggestions. Genkit implementation complete.
