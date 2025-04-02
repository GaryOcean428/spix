# Next Phase Plan: Deploy Genkit Backend

This document outlines the immediate next steps following the implementation of the Genkit backend.

## Priority 1: Implement Genkit Backend [DONE]

**Status:**
*   Installed `genkit` and provider plugins.
*   Created Genkit configuration (`api/genkit.config.ts`).
*   Implemented multi-provider logic directly in the Vercel API route (`api/generate.ts`) using Genkit's `generate` function.
*   Resolved TypeScript configuration issues using project references and appropriate settings in `tsconfig.json` and `api/tsconfig.json`.

**Next Step:** Final validation requires testing in a Vercel deployment environment. The Vite dev server currently returns a 404 for `/api/generate` because it's not configured to run the Genkit backend; Vercel deployment handles this automatically.

## Priority 2: Re-implement Streaming for Genkit Backend [DONE]

**Status:**
*   Refactored `api/generate.ts` to use `generate({ ..., streaming: true })`.
*   Adapted the output stream from Genkit's `generate` function into a standard Web `ReadableStream` suitable for the frontend's `useChat` hook.

## Priority 3: Deployment Planning & Execution (Vercel Focus) [Current Focus]

**Goal:** Deploy the Genkit-based application to Vercel and perform initial testing.

**Steps:**
1.  **Environment Variables:**
    *   Document required variables: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`.
    *   Instruct user on how to add these to Vercel project settings (Settings -> Environment Variables). Emphasize *not* prefixing with `VITE_`.
2.  **Build Configuration:**
    *   Verify `vercel.json` (if needed) or rely on Vercel's zero-config for Vite + API routes. Ensure the `api` directory is correctly identified.
    *   Confirm build command (`npm run build`) produces the necessary frontend assets (Vercel should detect this automatically).
3.  **Deployment Trigger:** User to configure Vercel deployment (e.g., via Git integration).
4.  **Post-Deployment Testing (User Task):**
    *   Verify deployment URL loads the application.
    *   Test basic query functionality with the default model (`openai/gpt-4o` - requires `OPENAI_API_KEY` to be set).
    *   Test with Anthropic and Google models by temporarily changing the default model identifier passed from `Result.tsx` to the backend (requires respective API keys to be set).
    *   Verify streaming works as expected.
    *   Check browser console and Vercel function logs for errors.

**Success Criteria ("What Success Looks Like"):**
*   Application successfully deploys to Vercel.
*   Users can submit queries and receive streaming responses from the backend API (`/api/generate`).
*   The application can successfully interact with at least one configured AI provider (e.g., OpenAI) using server-side environment variables.
*   No runtime errors in the browser console or Vercel function logs related to the core chat functionality when using a configured provider.

**Benchmarks (Post-Deployment):**
*   **Time to First Byte (TTFB) for API:** Measure response time for `/api/generate` (initial connection). Aim for < 500ms.
*   **Streaming Latency:** Subjective assessment of how quickly the response starts streaming. Should feel near-instantaneous after TTFB.
*   **Frontend Load Time:** Standard Vite build performance.

**Time-to-Live Estimation:**
*   **Resolving TS Errors:** [DONE - Pending Deployment Validation]
*   **Vercel Deployment & Initial Testing:** 0.5 - 1 hour (User task - assuming Vercel setup is straightforward).

## Priority 4: Alternative Deployment Investigation (Cloud Run / Firebase) - [Deferred - Detailed Plan Below]

**Goal:** Outline the steps, criteria, and estimates for deploying the Genkit-based Spix backend to Google Cloud (Cloud Run) and frontend to Firebase Hosting if Vercel is not used.

**Detailed Steps:**

**A. Frontend Deployment (Firebase Hosting):**
1.  **Firebase Project Setup:** Create a Firebase project via the Google Cloud Console.
2.  **Install Firebase CLI:** `npm install -g firebase-tools` (if not already installed).
3.  **Login:** `firebase login`.
4.  **Initialize Firebase:** Run `firebase init hosting` in the project root.
    *   Select the Firebase project created in step A.1.
    *   Configure `dist` as the public directory.
    *   Configure as a single-page app (rewrite all URLs to `/index.html`).
5.  **Build Frontend:** Run `npm run build`. This creates the static assets in the `dist` directory.
6.  **Deploy Frontend:** Run `firebase deploy --only hosting`.

**B. Backend Deployment (Cloud Run):**
1.  **Refactor API Handler:** The current `api/generate.ts` uses Vercel's Edge Runtime signature (`Request` -> `Response`). This needs adaptation.
    *   **Option B.1.1 (Node Server Wrapper):**
        *   Install a lightweight Node.js server framework (e.g., `npm install express cors`).
        *   Create a new server entry point (e.g., `server.ts` at the project root).
        *   Import the logic from `api/generate.ts` into an Express route handler (e.g., `/api/generate`).
        *   Adapt the handler signature (e.g., `(req, res) => {...}`).
        *   Handle streaming responses using Node.js streams (`res.write()`, `res.end()`) instead of Vercel's `StreamingTextResponse`. This requires significant changes to the response handling part of the logic.
        *   Enable CORS middleware (`app.use(cors())`).
    *   **Option B.1.2 (Cloud Functions Adapter):**
        *   Install `@google-cloud/functions-framework`.
        *   Rewrite `api/generate.ts` to match the Cloud Functions signature (e.g., `(req, res) => {...}`).
        *   Handle streaming responses as above.
        *   Configure `package.json` with a start script for the functions framework.
2.  **Containerize (Dockerfile):** Create a `Dockerfile` at the project root.
    *   Use a Node.js base image (e.g., `node:20-slim`).
    *   Copy `package.json`, `package-lock.json`.
    *   Run `npm install --production`.
    *   Copy the refactored backend code (e.g., `server.ts`, `api/generate.ts`, relevant `node_modules`).
    *   Copy `tsconfig.json` files if needed for runtime compilation (less ideal) or build JS files first.
    *   Expose the port the server listens on (e.g., `8080`).
    *   Set the `CMD` to start the server (e.g., `node server.js` if built, or `ts-node server.ts`).
3.  **Build & Push Docker Image:**
    *   Enable Google Cloud Artifact Registry.
    *   Build the image: `docker build -t gcr.io/[PROJECT_ID]/spix-backend:latest .`
    *   Push the image: `docker push gcr.io/[PROJECT_ID]/spix-backend:latest`
4.  **Deploy to Cloud Run:**
    *   Use `gcloud run deploy spix-backend --image=gcr.io/[PROJECT_ID]/spix-backend:latest --platform=managed --region=[REGION] --allow-unauthenticated`.
    *   Configure CPU, memory, scaling settings as needed.
5.  **Configure Environment Variables (Secrets):**
    *   Store API keys (`OPENAI_API_KEY`, etc.) in Google Secret Manager.
    *   Grant the Cloud Run service account access to these secrets.
    *   Mount secrets as environment variables in the Cloud Run service configuration.
6.  **CORS Configuration:** Ensure the backend server (Express) or Cloud Run service allows requests from the Firebase Hosting domain.

**C. Integration & Testing:**
1.  **Update Frontend API Endpoint:** Change the `api` endpoint in `src/pages/Result.tsx`'s `useChat` hook to point to the deployed Cloud Run service URL.
2.  **Testing:** Perform the same post-deployment tests as outlined for Vercel.

**Success Criteria ("What Success Looks Like"):**
*   Frontend successfully deployed and accessible via Firebase Hosting URL.
*   Backend successfully deployed and accessible via Cloud Run URL.
*   Frontend correctly calls the Cloud Run backend endpoint.
*   Users can submit queries and receive streaming responses via the Cloud Run backend.
*   Interaction with at least one AI provider using secrets from Secret Manager is successful.
*   No CORS errors or runtime errors in browser/Cloud Run logs.

**Benchmarks (Post-Deployment):**
*   **Frontend Load Time (Firebase):** Comparable to Vercel.
*   **Backend TTFB (Cloud Run):** Measure response time. Aim for < 800ms (may have cold starts).
*   **Streaming Latency:** Subjective assessment.
*   **Cloud Run Cold Start Time:** Measure if applicable (can vary significantly).

**Time-to-Live Estimation (Rough):**
*   **Refactoring Backend Handler:** 2 - 5 hours (depending on streaming implementation complexity).
*   **Containerization & Dockerfile:** 1 - 3 hours.
*   **GCP Setup (Artifact Registry, Cloud Run, Secrets):** 1 - 2 hours (assuming familiarity).
*   **Firebase Hosting Setup:** 0.5 hours.
*   **Deployment & Testing:** 1 - 2 hours.
*   **Total Estimated:** 5.5 - 12.5 hours (significantly more than Vercel due to manual setup and refactoring).

**Note:** This path requires significant refactoring of the backend API handler away from Vercel's specific runtime and utilities, introducing complexity and potential new bugs. Vercel remains the more straightforward path given the current implementation.

## Next Immediate Action

User to proceed with **Priority 3: Deployment Planning & Execution**, specifically configuring environment variables and triggering a deployment on Vercel.
