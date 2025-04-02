import { runFlow } from 'genkit/flow';
import { generateFlow } from './flows/generateFlow'; // Updated path
import { initGenkit } from 'genkit'; // Import initGenkit
import config from './genkit.config'; // Updated path

// Initialize Genkit - This ensures plugins are loaded based on the config
initGenkit(config);

// Define the expected request body structure from the frontend (useChat hook)
interface RequestBody {
  messages: Array<{ // Structure from Vercel AI SDK Message
    role: 'user' | 'assistant' | 'system' | 'tool';
    content: string;
    // Add other fields if needed
  }>;
  model: string; // e.g., "openai/gpt-4o"
}

export default async function handler(req: Request) { // Use standard Request object for edge runtime
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const { messages, model: modelIdentifier } = (await req.json()) as RequestBody;

    if (!messages || messages.length === 0 || !modelIdentifier) {
      return new Response(JSON.stringify({ error: 'Missing messages or model in request body' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Prepare input for the Genkit flow
    const flowInput = {
      modelIdentifier: modelIdentifier,
      messages: messages, // Pass messages directly; flow input schema expects this structure
    };

    // Run the Genkit flow
    // Note: runFlow typically returns the full result, not a stream by default here.
    const flowResult = await runFlow(generateFlow, flowInput);

    // Return the result from the flow
    // The flow's output schema is { result: string }
    return new Response(JSON.stringify({ result: flowResult.result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in Vercel API handler invoking Genkit flow:', error);
    const errorMessage = error.message || 'Unknown internal server error';
    // Check if error has specific properties (e.g., from Zod validation)
    const details = error.details || error.cause;
    return new Response(JSON.stringify({
        error: `Internal Server Error: ${errorMessage}`,
        ...(details && { details: details }) // Include details if available
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

// Ensure Vercel Edge Runtime is configured (if not already in vercel.json or inferred)
// export const config = {
//   runtime: 'edge',
// };
// Note: Genkit might have compatibility issues with edge runtime depending on plugins.
// If issues arise, remove the edge config and deploy as a standard Node.js serverless function.
