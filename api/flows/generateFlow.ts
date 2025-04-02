import { defineFlow, runFlow } from 'genkit/flow';
import { generate } from 'genkit/ai';
import * as z from 'zod'; // For input/output validation
import {
  anthropicModel, // Assuming these are the correct exports from the plugins
  googleAIModel,
  openaiModel,
} from 'genkit/models';
import { MessageData } from 'genkit/ai/message'; // Import MessageData type

// Define input schema using Zod
const GenerateInputSchema = z.object({
  modelIdentifier: z.string(), // e.g., "openai/gpt-4o"
  messages: z.array(
    z.object({ // Define structure matching VercelChatMessage (or adapt if needed)
      role: z.enum(['user', 'assistant', 'system', 'tool']), // Adjust roles as needed
      content: z.string(),
      // Add other fields like 'tool_calls', 'tool_call_id' if necessary
    })
  ),
});

// Define output schema using Zod
const GenerateOutputSchema = z.object({
  result: z.string(),
});

// Define the Genkit flow
export const generateFlow = defineFlow(
  {
    name: 'generateFlow',
    inputSchema: GenerateInputSchema,
    outputSchema: GenerateOutputSchema,
  },
  async (input: z.infer<typeof GenerateInputSchema>) => { // Add type for input
    const { modelIdentifier, messages } = input;

    const [providerName, modelName] = modelIdentifier.split('/');

    if (!providerName || !modelName) {
      throw new Error('Invalid model format. Expected "provider/modelName"');
    }

    let selectedModel: any; // Use 'any' for now, refine later

    // Select the Genkit model object based on the provider
    switch (providerName.toLowerCase()) {
      case 'openai':
        // Assuming openaiModel is a function that takes the model name
        selectedModel = openaiModel(modelName);
        break;
      case 'anthropic':
        // Assuming anthropicModel is a function that takes the model name
        selectedModel = anthropicModel(modelName);
        break;
      case 'google':
        // Assuming googleAIModel is a function that takes the model name
        selectedModel = googleAIModel(modelName);
        break;
      default:
        throw new Error(`Unsupported provider: ${providerName}`);
    }

    if (!selectedModel) {
        throw new Error(`Failed to initialize model for provider: ${providerName}`);
    }

    // Prepare messages for Genkit (might need slight adaptation from VercelChatMessage)
    // Genkit's generate function expects an array of MessageData
    // Define the expected message structure based on GenerateInputSchema
    type InputMessage = z.infer<typeof GenerateInputSchema>['messages'][number];
    const genkitMessages: MessageData[] = messages.map((msg: InputMessage) => ({
        role: msg.role as 'user' | 'model' | 'system' | 'tool', // Cast role, ensure compatibility
        content: [{ text: msg.content }], // Genkit messages use content parts
        // Map other fields if necessary
    }));


    // Call the generate function
    const response = await generate({
      model: selectedModel,
      prompt: genkitMessages, // Pass the prepared messages
      // config: { temperature: 0.7 }, // Optional config
      // output: { format: 'text' } // Optional output format
    });

    // Extract the text result
    const resultText = response.text();

    return {
      result: resultText,
    };
  }
);

// Optional: Function to run the flow directly (for testing)
// async function testFlow() {
//   const result = await runFlow(generateFlow, {
//     modelIdentifier: 'openai/gpt-4o', // Example
//     messages: [{ role: 'user', content: 'Tell me a joke.' }],
//   });
//   console.log(result);
// }
// testFlow();
