import { OpenAI } from 'openai'; // Keep base client for potential direct use if needed
import { Anthropic } from '@anthropic-ai/sdk'; // Keep base client
import { GoogleGenerativeAI } from '@google/generative-ai'; // Keep base client

// Import AI SDK core functions and types (remove StreamingTextResponse)
import { streamText, Message as VercelChatMessage } from 'ai';

// Import provider adapter creation functions
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI as createGoogle } from '@ai-sdk/google'; // Alias for clarity

// Initialize provider adapters - Ensure API keys are set in Vercel environment variables
const openaiAdapter = process.env.OPENAI_API_KEY ? createOpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const anthropicAdapter = process.env.ANTHROPIC_API_KEY ? createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;
const googleAdapter = process.env.GOOGLE_API_KEY ? createGoogle({ apiKey: process.env.GOOGLE_API_KEY }) : null;

export const config = {
  runtime: 'edge', // Use edge runtime for Vercel AI SDK streaming
};

// Define the expected request body structure
interface RequestBody {
  messages: VercelChatMessage[]; // Expect an array of messages
  model: string; // e.g., "openai/gpt-4o", "anthropic/claude-3-7-sonnet-20250219", "google/gemini-2.5-pro-exp-03-25"
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

    const [providerName, modelName] = modelIdentifier.split('/');

    if (!providerName || !modelName) {
      return new Response(JSON.stringify({ error: 'Invalid model format. Expected "provider/modelName"' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    let providerAdapter: any = null; // Use 'any' for now, refine if possible
    let resolvedModelName = modelName; // Model name might need adjustment for some providers

    switch (providerName.toLowerCase()) {
      case 'openai':
        if (!openaiAdapter) {
          return new Response(JSON.stringify({ error: 'OpenAI provider not configured on server.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
        providerAdapter = openaiAdapter;
        resolvedModelName = modelName; // Use just the name part
        break;

      case 'anthropic':
         if (!anthropicAdapter) {
           return new Response(JSON.stringify({ error: 'Anthropic provider not configured on server.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
         }
         providerAdapter = anthropicAdapter;
         resolvedModelName = modelName; // Use just the name part
         break;

      case 'google':
        if (!googleAdapter) {
          return new Response(JSON.stringify({ error: 'Google provider not configured on server.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
        providerAdapter = googleAdapter;
        resolvedModelName = modelName; // Use just the name part, e.g., "gemini-2.5-pro-exp-03-25"
        break;

      default:
        return new Response(JSON.stringify({ error: `Unsupported provider: ${providerName}` }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Use streamText with the selected provider adapter instance and the resolved model name string
    const result = await streamText({
      model: providerAdapter(resolvedModelName), // Pass model name string to the adapter instance
      messages: messages,
      // Add other parameters like temperature, maxTokens if needed and supported by streamText/adapter
      // e.g., temperature: 0.7
    });

    // Respond with the stream using the correct method
    return result.toDataStreamResponse();

  } catch (error: any) {
    console.error('Error in /api/generate handler:', error);
    // Ensure a Response object is returned in case of errors
    const errorMessage = error.message || 'Unknown internal server error';
    return new Response(JSON.stringify({ error: `Internal Server Error: ${errorMessage}` }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
