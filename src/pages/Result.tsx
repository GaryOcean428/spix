import React, { useEffect, useState } from "react"; // Re-added React import
// Removed unused FontAwesomeIcon import
import { useLocation } from "react-router-dom";
import { Button } from "../components/Button";
import { useChat } from 'ai/react'; // Import useChat

// Removed generateUUID as it's not used with useChat for now
// Removed Loader component as useChat provides isLoading state

// Removed Thread/Threads interfaces and fetchAIResult function

// Define the structure for available models
const availableModels = [
    { id: 'openai/gpt-4o', name: 'OpenAI GPT-4o' },
    { id: 'anthropic/claude-3-7-sonnet-20250219', name: 'Anthropic Claude 3.7 Sonnet' },
    { id: 'google/gemini-2.5-pro-exp-03-25', name: 'Google Gemini 2.5 Pro' },
    // Add more models here as supported by the backend
];

export const Result = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialQuery = queryParams.get("query") ?? "";

    const [title, setTitle] = useState<string>(initialQuery || "New Chat"); // Set initial title
    const [selectedModel, setSelectedModel] = useState<string>(availableModels[0].id); // State for selected model
    const initialQueryProcessed = React.useRef(false); // Ref to track if initial query was processed

    // Use the useChat hook, get append function
    const { messages, input, handleInputChange, handleSubmit, isLoading, error, setMessages, append } = useChat({
        api: '/api/generate', // Point to our backend route
        // Send model in the body dynamically
        body: {
            model: selectedModel // Use state variable for model
        },
        onError: (err) => {
            // Log error or display a user-friendly message
            console.error("Chat hook error:", err);
        }
    });

    // Effect to handle the initial query from URL params
    // This effect runs once when the component mounts or initialQuery changes.
    // It triggers the API call for the initial query using the append function.
    useEffect(() => {
        // Only process if there's an initial query, no messages yet, not loading, and not already processed
        if (initialQuery && messages.length === 0 && !isLoading && !initialQueryProcessed.current && append) {
            // Mark as processed to prevent re-triggering
            initialQueryProcessed.current = true;
            // Append the initial query as a user message, triggering the API call
            append({ role: 'user', content: initialQuery });
        }
        // Update title if query exists (can run independently)
        if (initialQuery) {
            setTitle(initialQuery);
        }
        // Dependencies: initialQuery, messages length (to detect when chat starts), isLoading, append, setTitle
    }, [initialQuery, messages.length, isLoading, append, setTitle]);

    // No need to filter placeholder messages anymore
    const displayedMessages = messages;

    return (
        <section className="m-auto relative w-full min-h-screen items-start overflow-y-auto flex justify-center pb-40">
            <div className="flex justify-start p-10 md:p-20 flex-col items-start space-y-4 w-full max-w-3xl h-full">
                <header>
                    {/* Display title based on initial query or fallback */}
                    <span className="font-bold font-mono text-2xl md:text-4xl break-words">{title}</span>
                </header>

                {/* Model Selection Dropdown */}
                <div className="w-full max-w-xs mt-4"> {/* Added margin-top */}
                    <label htmlFor="model-select" className="block text-sm font-medium text-gray-700 mb-1">
                        Select Model:
                    </label>
                    <select
                        id="model-select"
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
                        disabled={isLoading || messages.length > 0} // Disable after chat starts or while loading
                    >
                        {availableModels.map((model) => (
                            <option key={model.id} value={model.id}>
                                {model.name}
                            </option>
                        ))}
                    </select>
                    { (isLoading || messages.length > 0) && <p className="text-xs text-gray-500 mt-1">Model cannot be changed after conversation starts.</p>}
                </div>

                {/* Display chat messages */}
                <div className="space-y-4 w-full pt-4">
                    {displayedMessages.map((m) => (
                        <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-3 rounded-lg ${m.role === 'user' ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-800'}`}>
                                <span className="font-semibold capitalize">{m.role === 'assistant' ? 'Spix' : m.role}: </span>
                                <div className="mt-1 whitespace-pre-wrap">
                                    {m.content}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Display loading indicator */}
                    {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
                         <div className="flex justify-start">
                             <div className="p-3 rounded-lg bg-gray-100 text-gray-500 animate-pulse">
                                 Spix is thinking...
                             </div>
                         </div>
                    )}

                    {/* Display error message */}
                    {error && (
                        <div className="text-red-600 p-4 border border-red-300 rounded bg-red-50 my-4">
                    Error: {typeof error === 'object' && error.message ? error.message : error || "An unexpected error occurred."}
                        </div>
                    )}
                </div>
            </div>

            {/* Follow-up Input Form */}
            <div className="bg-white items-center bottom-10 fixed w-[90%] max-w-3xl p-1 rounded-full shadow-lg border border-gray-200">
                {/* Use the form provided by useChat */}
                <form onSubmit={handleSubmit} className="flex items-center justify-between rounded-full w-full p-1">
                    <input
                        placeholder="Ask Follow-up..."
                        value={input} // Bind input value
                        onChange={handleInputChange} // Bind change handler
                        className="flex-grow p-2 h-full border-none outline-none resize-none bg-transparent"
                    />
                    <div className="max-w-max flex gap-2 items-center pr-1">
                        <Button type="submit" icon={["fas", "arrow-up"]} rounded="full" disabled={isLoading} />
                    </div>
                </form>
            </div>
        </section>
    );
}
