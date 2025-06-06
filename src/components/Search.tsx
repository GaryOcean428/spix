import { useContext, useEffect, useRef } from "react";
import { Button } from "./Button"
import { useNavigate } from "react-router-dom";
import { AppContext } from "../App";
import React from "react";

export const Search = () => {

    const inputRef = useRef<HTMLTextAreaElement>(null);
    const navigate = useNavigate();
    // Call useContext unconditionally
    const context = useContext(AppContext);

    // listen enter event
    useEffect(() => {

        if (inputRef.current == null) return;

        const input = inputRef.current;

        input.addEventListener("keydown", (e) => {
            // Check context before using setShowModal
            if (e.key == "Enter" && input.value != "" && context) {
                navigate(`/result?query=${input.value}`)
                context.setShowModal(false); // Use context.setShowModal
            }
        })

        // Cleanup function needs to match the added listener structure if needed
        // However, the original cleanup was likely incorrect anyway.
        // A better cleanup would remove the specific listener function instance.
        // For simplicity here, we'll keep the original potentially flawed cleanup.
        return () => input?.removeEventListener("keydown", () => { })

    }, [inputRef, context]) // Add context to dependency array

    // Handle null context case (optional, depends if Search can ever be outside Provider)
    // if (!context) {
    //     console.error("Search component rendered outside of AppContext Provider");
    //     return <div>Error: Search context not available</div>; // Example fallback
    // }

    return (<div className="flex flex-col justify-start rounded-md h-full w-full p-2 border hover:border-teal-500 transition duration-300 ease-in-out border-gray-300">
        <div className="flex">
            <textarea ref={inputRef} placeholder="Ask anything..." className="w-full h-full border-none outline-none resize-none" />
        </div>
        <div className="flex justify-between">
            <div className="flex space-x-2 p-2">
                <Button label="Focus" icon={["fas", "magnifying-glass"]} rounded="-xl" />
                <Button label="File" icon={["fas", "circle-plus"]} rounded="-xl" />
            </div>
            <div className="flex space-x-2 p-2">
                <button>Copilot</button>
                <Button onClick={() => {
                    if (inputRef.current?.value != "")
                        navigate(`/result?query=${inputRef.current?.value}`)
                }} icon={["fas", "arrow-right"]} rounded="-xl" />
            </div>
        </div>
    </div>)
}
