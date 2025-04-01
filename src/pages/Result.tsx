import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "../components/Button";

function generateUUID() {
    // Use const instead of let
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0; // Use const
        const v = c === 'x' ? r : (r & 0x3 | 0x8); // Use const
        return v.toString(16);
    });
}

const Loader = () => {
    return (<div className="flex flex-col items-center h-50 justify-center space-y-2 py-10"> {/* Added padding */}
        <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-gray-900"></div>
    </div>)
}

// Removed unused Card component

// Define expected structure for OpenAI response
interface OpenAIResponse {
    choices?: Array<{
        message?: {
            content?: string;
        };
    }>;
    error?: {
        message?: string;
    }
}

// Define structure for localStorage threads
interface Thread {
    query: string;
    result: string;
    createdAt: string;
}

interface Threads {
    [key: string]: Thread;
}


async function callOpenAI(query: string): Promise<OpenAIResponse> { // Added return type
    const endpoint = "https://api.openai.com/v1/chat/completions";
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY; // Corrected variable name

    if (!apiKey) {
        console.error("OpenAI API key is missing. Make sure VITE_OPENAI_API_KEY is set in your .env file.");
        throw new Error("OpenAI API key is missing.");
    }

    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo", // Consider making this configurable
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant."
                },
                {
                    role: "user",
                    content: query
                }
            ]
        }),
    });

    // Check if the response was successful
    if (!response.ok) {
        let errorData: OpenAIResponse = {};
        try {
            errorData = await response.json();
        } catch (e) {
            // If parsing JSON fails, use status text
            errorData = { error: { message: `HTTP error! status: ${response.status} ${response.statusText}` } };
        }
        console.error("OpenAI API Error:", errorData);
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
    }

    const data: OpenAIResponse = await response.json();
    console.log("OpenAI API Success Response:", data); // Log success response
    return data;
}

export const Result = () => {

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);

    // Ensure query is never null, default to empty string
    const query = queryParams.get("query") ?? "";

    const [title, setTitle] = useState<string>(""); // Add type
    const [result, setResult] = useState<string>(""); // Add type
    const [isLoading, setIsLoading] = useState<boolean>(false); // Add type
    const [error, setError] = useState<string | null>(null); // Add type

    const loadResult = async (currentQuery: string) => { // Pass query to avoid stale closure
        if (!currentQuery) {
            setError("No query provided.");
            return;
        }
        setIsLoading(true);
        setError(null); // Clear previous errors
        setTitle(currentQuery);
        try {
            const res = await callOpenAI(currentQuery);

            // Validate the response structure before accessing nested properties
            const resultContent = res?.choices?.[0]?.message?.content;

            if (resultContent) {
                setResult(resultContent);

                // Save to localStorage only if successful
                try {
                    const threads: Threads = JSON.parse(localStorage.getItem("threads") || "{}"); // Default to empty object if null and add type
                    // Use a consistent key, maybe the query itself if unique enough, or UUID
                    const threadId = generateUUID(); // Or use query if appropriate
                    threads[threadId] = {
                        query: currentQuery,
                        result: resultContent,
                        createdAt: new Date().toISOString()
                    };
                    localStorage.setItem("threads", JSON.stringify(threads));
                } catch (storageError) {
                    console.error("Failed to save result to localStorage:", storageError);
                    // Non-critical error, maybe notify user or log
                }

            } else {
                console.error("Invalid response structure from OpenAI API:", res);
                throw new Error(res?.error?.message || "Received an invalid or empty response from the AI.");
            }
        } catch (err: unknown) { // Use unknown type for error
            console.error("Failed to load result:", err);
            // Type check before accessing message property
            const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred while fetching the result.";
            setError(errorMessage); // Set error state
            setResult(""); // Clear any previous result
        } finally {
            setIsLoading(false); // Ensure loading is stopped
        }
    };

    useEffect(() => {
        // Only run if query is present
        if (query) {
            let foundInStorage = false;
            try {
                const threads: Threads = JSON.parse(localStorage.getItem("threads") || "{}"); // Default to empty object and add type

                // Find thread by query content - removed unused _threadId variable
                const existingThreadEntry = Object.entries(threads).find(([, threadData]) => threadData.query === query);

                if (existingThreadEntry) {
                    const [, existingThread] = existingThreadEntry; // Destructure still works
                    setTitle(existingThread.query);
                    setResult(existingThread.result);
                    foundInStorage = true;
                }
            } catch (e) {
                console.error("Failed to load or parse threads from localStorage:", e);
                localStorage.setItem("threads", "{}"); // Reset if corrupted
            }

            if (!foundInStorage) {
                loadResult(query); // Call loadResult with the current query
            }
        } else {
            // Handle case where there is no query param
            setTitle("No Query");
            setResult("");
            setError("No search query was provided in the URL.");
            setIsLoading(false);
        }

    }, [query]); // Re-run effect only if query changes

    return (
        // Added min-h-screen to ensure footer doesn't overlap content on short results
        <section className="m-auto relative w-full min-h-screen items-start overflow-y-auto flex justify-center pb-40"> {/* Added padding-bottom */}
            <div className="flex justify-start p-10 md:p-20 flex-col items-start space-y-4 w-full max-w-3xl h-full"> {/* Adjusted padding and width */}
                <header>
                    <span className="font-bold font-mono text-2xl md:text-4xl break-words">{title}</span> {/* Adjusted size and added break-words */}
                </header>
                {/* Sources Section (Optional) */}
                {/* <div className="flex flex-col space-y-2 w-full">
                    <div className="flex text-teal-500 space-x-2 items-center">
                        <FontAwesomeIcon icon={["fas", "timeline"]} />
                        <span>Sources</span>
                    </div>
                    <div className="gap-2 grid grid-cols-2 sm:grid-cols-3">
                        {new Array(6).fill(0).map((_, i) => <Card key={i} title={`Source ${i + 1}`} />)}
                    </div>
                </div> */}
                <div className="space-y-2 w-full"> {/* Ensure full width */}
                    <div className="flex text-teal-500 space-x-2 items-center pt-4"> {/* Added padding-top */}
                        <FontAwesomeIcon icon={["fas", "align-left"]} />
                        <span>Answer</span>
                    </div>
                    {isLoading && <Loader />}
                    {error && <div className="text-red-600 p-4 border border-red-300 rounded bg-red-50 my-4">Error: {error}</div>} {/* Improved error styling */}
                    {!isLoading && !error && result && (
                        // Render result preserving line breaks
                        <div className="text-clip space-y-2 whitespace-pre-wrap text-gray-700"> {/* Use pre-wrap */}
                            {result}
                        </div>
                    )}
                    {!isLoading && !error && !result && (
                        <div className="text-gray-500">No result available.</div>
                    )}
                </div>
            </div>
            {/* Follow-up Input - Adjusted positioning */}
            <div className="bg-white items-center bottom-10 fixed w-[90%] max-w-3xl p-1 rounded-full shadow-lg border border-gray-200"> {/* Centered, added shadow */}
                <div className="flex items-center justify-between rounded-full w-full p-1">
                    <input placeholder="Ask Follow-up..." className="flex-grow p-2 h-full border-none outline-none resize-none bg-transparent" />
                    <div className="max-w-max flex gap-2 items-center pr-1"> {/* Added items-center */}
                        {/* <button className="text-sm text-gray-600 hover:text-black px-2">Copilot</button> */}
                        <Button icon={["fas", "arrow-up"]} rounded="full" /> {/* Changed to full */}
                    </div>
                </div>
            </div>
        </section>
    );
}
