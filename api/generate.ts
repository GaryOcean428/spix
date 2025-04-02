import { initGenkit, ModelReference } from '@genkit-ai/core'; // Try core again
import { generate, MessageData } from '@genkit-ai/ai'; // AI functions/types
import config from './genkit.config'; // Genkit configuration
import { z } from 'zod'; // Input validation
import { Message as VercelChatMessage } from 'ai'; // Vercel AI SDK message type

// Import model provider factories as DEFAULT exports
import openaiModel from '@genkit-ai/openai';
import anthropicModel from '@genkit-ai/anthropic';
import googleAIModel from '@genkit-ai/googleai';

// Initialize Genkit
initGenkit(config);

// Define the expected request body structure for validation
const RequestBodySchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system', 'tool']),
      content: z.string(),
    })
  ),
  model: z.string(),
});

// Helper function to convert Vercel AI SDK message roles to Genkit roles
function toGenkitRole(role: 'user' | 'assistant' | 'system' | 'tool'): 'user' | 'model' | 'system' | 'tool' {
    if (role === 'assistant') return 'model';
    // Genkit uses 'tool' role for tool messages
    if (role === 'tool') return 'tool';
    if (role === 'user') return 'user';
    if (role === 'system') return 'system';
    // Fallback (shouldn't happen with schema validation)
    console.warn(`Unsupported role encountered in mapping: ${role}, defaulting to 'user'`);
    return 'user';
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const requestBody = await req.json();
    // Validate request body
    const validationResult = RequestBodySchema.safeParse(requestBody);
    if (!validationResult.success) {
        return new Response(JSON.stringify({ error: 'Invalid request body', details: validationResult.error.format() }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    const { messages, model: modelIdentifier } = validationResult.data;

    const [providerName, modelName] = modelIdentifier.split('/');
    if (!providerName || !modelName) {
      return new Response(JSON.stringify({ error: 'Invalid model format. Expected "provider/modelName"' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    let selectedModelProvider: any; // The imported provider factory

    // Select the Genkit model provider factory
    switch (providerName.toLowerCase()) {
      case 'openai':
        selectedModelProvider = openaiModel;
        break;
      case 'anthropic':
        selectedModelProvider = anthropicModel;
        break;
      case 'google':
        selectedModelProvider = googleAIModel;
        break;
      default:
        return new Response(JSON.stringify({ error: `Unsupported provider: ${providerName}` }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (!selectedModelProvider) {
        return new Response(JSON.stringify({ error: `Failed to find model provider for: ${providerName}` }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    // Construct the specific model reference
    const specificModelRef: ModelReference<any> = selectedModelProvider(modelName);

    // Prepare messages for Genkit
    const genkitMessages: MessageData[] = messages.map(msg => ({
        role: toGenkitRole(msg.role),
        content: [{ text: msg.content }],
    }));

    // Call generate with streaming option in an options object
    const generateResponseStream = await generate({ // Assume generate returns the stream directly
        model: specificModelRef,
        prompt: genkitMessages,
        streaming: true,
        // config: { temperature: 0.7 },
    });

    // Adapt Genkit's stream (assuming it's the direct response) to a Web ReadableStream
    const readableStream = new ReadableStream({
        async start(controller) {
            try {
                // Iterate directly over the response from generate
                for await (const chunk of generateResponseStream) {
                    const text = chunk.text();
                    if (text) {
                        controller.enqueue(new TextEncoder().encode(text));
                    }
                }
                controller.close();
            } catch (error: any) {
                console.error('Error reading from Genkit stream:', error);
                controller.error(new Error(`Error streaming from Genkit: ${error.message}`));
            }
        }
    });

    // Return the stream in a standard Response object
    return new Response(readableStream, {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });

  } catch (error: any) {
    console.error('Error in API handler:', error);
    const errorMessage = error.message || 'Unknown internal server error';
    const details = error.details || error.cause;
    return new Response(JSON.stringify({
        error: `Internal Server Error: ${errorMessage}`,
        ...(details && { details: details })
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

// export const config = {
//   runtime: 'edge', // Re-evaluate if edge is compatible with all Genkit plugins/features
// };
