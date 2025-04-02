import { configureGenkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { defineDotprompt } from '@genkit-ai/dotprompt'; // Optional: If using dotprompts later
import { genkitEval, GenkitMetric } from '@genkit-ai/evaluator'; // Optional: For evaluation later
import { googleCloud } from '@genkit-ai/google-cloud'; // Optional: For GCP deployment tracing/logging
import { openai } from '@genkit-ai/openai'; // Import OpenAI plugin
import { anthropic } from '@genkit-ai/anthropic'; // Import Anthropic plugin

// Define model identifiers matching the frontend format
const GEMINI_PRO = 'google/gemini-2.5-pro-exp-03-25'; // Example, adjust if needed
const GPT_4O = 'openai/gpt-4o';
const CLAUDE_37_SONNET = 'anthropic/claude-3-7-sonnet-20250219';

export default configureGenkit({
  plugins: [
    // Configure Google AI plugin if API key is provided
    googleAI({
        // API key is read from GOOGLE_API_KEY env var by default
    }),
    // Configure OpenAI plugin if API key is provided
    openai({
        // API key is read from OPENAI_API_KEY env var by default
    }),
    // Configure Anthropic plugin if API key is provided
    anthropic({
        // API key is read from ANTHROPIC_API_KEY env var by default
    }),
    // Optional: Google Cloud plugin for tracing/logging if deploying to GCP later
    // googleCloud(),
    // Optional: Evaluator plugin
    // genkitEval({
    //   judge: geminiPro, // Use a model for evaluation
    //   metrics: [GenkitMetric.FAITHFULNESS, GenkitMetric.MALICIOUSNESS],
    //   embedder: textEmbeddingGecko, // Specify an embedder model
    // }),
  ],
  // Where to store flow state. Defaults to $GENKIT_HOME/state.json or /tmp/genkit-state.json
  flowStateStore: 'local', // Or 'googleCloud' if using GCP plugin
  // Where to store trace data. Defaults to $GENKIT_HOME/traces or /tmp/genkit-traces
  traceStore: 'local', // Or 'googleCloud' if using GCP plugin
  // Enable OpenTelemetry trace collection. Defaults to true
  enableTracingAndMetrics: true,
  // Log level. Defaults to 'info'
  logLevel: 'debug',
});
