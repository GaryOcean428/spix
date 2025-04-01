# Spix Project Roadmap

This document outlines planned improvements and future directions for the Spix project.

## Phase 1: Core Refinements & Branding

1.  **Project Renaming:**
    *   Update project name in `package.json` from `perplexity_ai_react_clone` to `spix`.
    *   Update title in `index.html` from `Perplexity` to `Spix`.
    *   Update any internal branding references (e.g., header in `Nav.tsx`) to "Spix".
    *   Update `README.md` to reflect the new project name and purpose.
2.  **Code Cleanup & Linting:**
    *   Address any remaining ESLint/TypeScript warnings or errors.
    *   Review component structure for potential improvements.

## Phase 2: Multi-Model Integration Backend

1.  **Backend API Route:**
    *   Create a backend API route (e.g., `/api/generate`) to handle AI requests securely. This is necessary because API keys for different providers should not be exposed directly in the frontend.
    *   This route will act as a proxy between the Spix frontend and the various AI provider APIs.
2.  **Environment Variables:**
    *   Ensure all necessary API keys (OpenAI, Anthropic, Google GenAI, etc.) are configured as server-side environment variables (e.g., in Vercel project settings, not prefixed with `VITE_`).
3.  **Provider Logic:**
    *   Implement logic within the API route to:
        *   Accept a desired provider/model name as input (e.g., `openai/gpt-4o`, `anthropic/claude-3-7-sonnet-20250219`, `google/gemini-2.5-pro-exp-03-25`).
        *   Select the correct API key based on the provider.
        *   Format the request according to the specific provider's API requirements (e.g., different message structures, parameters).
        *   Call the appropriate provider's API.
        *   Standardize the response format returned to the frontend.
4.  **Initial Model Support:**
    *   Implement support for OpenAI (`gpt-4o`), Anthropic (`claude-3-7-sonnet-20250219`), and Google (`gemini-2.5-pro-exp-03-25`) via the backend route.

## Phase 3: Frontend Integration & Model Selection

1.  **Refactor Frontend API Call:**
    *   Update `src/pages/Result.tsx` (`callOpenAI` function) to call the new backend API route (`/api/generate`) instead of `api.openai.com` directly.
    *   Pass the desired model identifier to the backend route.
2.  **Model Selection UI (Optional):**
    *   Consider adding a UI element (e.g., a dropdown) to allow users to select which model they want to use for their query.
    *   Alternatively, implement automatic model selection logic based on criteria like query complexity (this is more advanced).
3.  **Vercel AI SDK / Responses API (Optional):**
    *   Evaluate migrating the backend API route to use the Vercel AI SDK or potentially the OpenAI Responses API (if library support becomes available or if using a different SDK) for features like streaming, better state management, and structured outputs.

## Phase 4: Advanced Features & Deployment

1.  **Streaming Responses:**
    *   Implement streaming support using the Vercel AI SDK or native provider capabilities via the backend route to display results progressively.
2.  **Conversation History:**
    *   Implement proper conversation history management, passing relevant context to the backend API route for multi-turn interactions.
3.  **Tool Use / Agents:**
    *   Explore integrating tools (like web search) or agentic capabilities using relevant SDKs (e.g., OpenAI Agents SDK, Vercel AI SDK tools).
4.  **Deployment:**
    *   Ensure all backend and frontend changes are correctly configured and deployed on Vercel, including server-side environment variables.
=======
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
    *   **Action Item:** Attempt further fixes (e.g., check package versions, simplify tsconfig, test alternative import strategies).
*   **Deployment Planning:** Define detailed steps for Vercel deployment, including environment variable setup, build configuration, and testing. Evaluate Cloud Run/Firebase if necessary.
*   **Explore Phase 4.3:** Once core functionality is stable and deployed, investigate Tool Use / Agents integration.

