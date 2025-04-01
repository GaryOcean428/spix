import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLocation } from "react-router-dom";
import { Button } from "../components/Button";
import { useChat } from 'ai/react'; // Import useChat

// Removed generateUUID as it's not used with useChat for now
// Removed Loader component as useChat provides isLoading state

// Removed Thread/Threads interfaces and fetchAIResult function

export const Result = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialQuery = queryParams.get("query") ?? "";

    const [title, setTitle] = useState<string>(initialQuery || "New Chat"); // Set initial title

    // Use the useChat hook
    const { messages, input, handleInputChange, handleSubmit, isLoading, error, setMessages } = useChat({
        api: '/api/generate', // Point to our backend route
        // We can add initialMessages or id later if needed for history
        // Send model in the body
        body: {
            // Default model, could be made dynamic later
            model: "openai/gpt-4o"
        },
        onError: (err) => {
            // Log error or display a user-friendly message
            console.error("Chat hook error:", err);
        }
    });

    // Effect to handle the initial query from URL params
    // This effect runs once when the component mounts or initialQuery changes.
    // It simulates the initial message exchange if an initialQuery exists.
    useEffect(() => {
        if (initialQuery && messages.length === 0 && !isLoading) {
            // Add the user's initial query as the first message
            // And trigger the API call by adding a placeholder assistant message
            // that the hook will then try to complete.
            // NOTE: This is a workaround. A cleaner way might involve modifying useChat
            // or using its `append` function carefully after initial load.
            setMessages([
                { id: 'initial-user', role: 'user', content: initialQuery },
                // Add a placeholder that handleSubmit would normally trigger
                // This signals the hook to start fetching the response for the user message
                { id: 'initial-assistant-placeholder', role: 'assistant', content: ''}
            ]);
            // We don't call handleSubmit here as setMessages triggers the flow
        }
        // Update title if query exists
        if (initialQuery) {
            setTitle(initialQuery);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialQuery]); // Rerun only if initialQuery changes

    // Filter out the placeholder message once the actual response starts streaming
    const displayedMessages = messages.filter(m => m.id !== 'initial-assistant-placeholder');

    return (
        <section className="m-auto relative w-full min-h-screen items-start overflow-y-auto flex justify-center pb-40">
            <div className="flex justify-start p-10 md:p-20 flex-col items-start space-y-4 w-full max-w-3xl h-full">
                <header>
                    {/* Display title based on initial query or fallback */}
                    <span className="font-bold font-mono text-2xl md:text-4xl break-words">{title}</span>
                </header>

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
                            Error: {error.message || "An unexpected error occurred."}
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
