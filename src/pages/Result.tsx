import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "../components/Button";

function generateUUID() {
    // Use const instead of let/var
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const Loader = () => {
    return (<div className="flex flex-col items-center h-50 justify-center space-y-2 py-10">
        <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-gray-900"></div>
    </div>)
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

// Using Chat Completions API but with gpt-4o model
async function callOpenAI(query: string): Promise<string> {
    const endpoint = "https://api.openai.com/v1/chat/completions";
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

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
            model: "gpt-4o", // Updated model
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

    if (!response.ok) {
        let errorData: { error?: { message?: string } } = {};
        try {
            errorData = await response.json();
        } catch (e) {
            errorData = { error: { message: `HTTP error! status: ${response.status} ${response.statusText}` } };
        }
        console.error("OpenAI API Error:", errorData);
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("OpenAI API Success Response:", data);

    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
        console.error("Invalid response structure from OpenAI API:", data);
        throw new Error("Received an invalid or empty response from the AI.");
    }
    return content; // Return the content string directly
}

export const Result = () => {

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get("query") ?? "";

    const [title, setTitle] = useState<string>("");
    const [result, setResult] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const loadResult = async (currentQuery: string) => {
        if (!currentQuery) {
            setError("No query provided.");
            setIsLoading(false); // Ensure loading stops if no query
            return;
        }
        setIsLoading(true);
        setError(null);
        setTitle(currentQuery);
        try {
            const resultContent = await callOpenAI(currentQuery);
            setResult(resultContent);

            // Save to localStorage
            try {
                const threads: Threads = JSON.parse(localStorage.getItem("threads") || "{}");
                const threadId = generateUUID();
                threads[threadId] = {
                    query: currentQuery,
                    result: resultContent,
                    createdAt: new Date().toISOString()
                };
                localStorage.setItem("threads", JSON.stringify(threads));
            } catch (storageError) {
                console.error("Failed to save result to localStorage:", storageError);
            }

        } catch (err: unknown) {
            console.error("Failed to load result:", err);
            const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred while fetching the result.";
            setError(errorMessage);
            setResult(""); // Clear result on error
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (query) {
            let foundInStorage = false;
            try {
                const threads: Threads = JSON.parse(localStorage.getItem("threads") || "{}");
                const existingThreadEntry = Object.entries(threads).find(([, threadData]) => threadData.query === query);

                if (existingThreadEntry) {
                    const [, existingThread] = existingThreadEntry;
                    setTitle(existingThread.query);
                    setResult(existingThread.result);
                    foundInStorage = true;
                    setIsLoading(false); // Not loading if found in storage
                    setError(null); // Clear any previous error
                }
            } catch (e) {
                console.error("Failed to load or parse threads from localStorage:", e);
                localStorage.setItem("threads", "{}"); // Reset if corrupted
            }

            if (!foundInStorage) {
                loadResult(query);
            }
        } else {
            // Handle case where there is no query param
            setTitle("No Query");
            setResult("");
            setError("No search query was provided in the URL.");
            setIsLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]); // Only re-run when query changes

    return (
        <section className="m-auto relative w-full min-h-screen items-start overflow-y-auto flex justify-center pb-40">
            <div className="flex justify-start p-10 md:p-20 flex-col items-start space-y-4 w-full max-w-3xl h-full">
                <header>
                    <span className="font-bold font-mono text-2xl md:text-4xl break-words">{title}</span>
                </header>
                {/* Removed Sources Section */}
                <div className="space-y-2 w-full">
                    <div className="flex text-teal-500 space-x-2 items-center pt-4">
                        <FontAwesomeIcon icon={["fas", "align-left"]} />
                        <span>Answer</span>
                    </div>
                    {isLoading && <Loader />}
                    {error && <div className="text-red-600 p-4 border border-red-300 rounded bg-red-50 my-4">Error: {error}</div>}
                    {!isLoading && !error && result && (
                        <div className="text-clip space-y-2 whitespace-pre-wrap text-gray-700">
                            {result}
                        </div>
                    )}
                    {!isLoading && !error && !result && (
                        <div className="text-gray-500">No result available.</div>
                    )}
                </div>
            </div>
            {/* Follow-up Input */}
            <div className="bg-white items-center bottom-10 fixed w-[90%] max-w-3xl p-1 rounded-full shadow-lg border border-gray-200">
                <div className="flex items-center justify-between rounded-full w-full p-1">
                    <input placeholder="Ask Follow-up..." className="flex-grow p-2 h-full border-none outline-none resize-none bg-transparent" />
                    <div className="max-w-max flex gap-2 items-center pr-1">
                        {/* <button className="text-sm text-gray-600 hover:text-black px-2">Copilot</button> */}
                        <Button icon={["fas", "arrow-up"]} rounded="full" />
                    </div>
                </div>
            </div>
        </section>
    );
}
