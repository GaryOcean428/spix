import { useContext, useEffect, useState } from "react";
import { AppContext } from "../App";
import { Button } from "./Button"
import { useNavigate } from "react-router-dom";

type Profile = {
    name: string;
    avatar: string;
}

export const Nav = () => {

    const context = useContext(AppContext);
    const navigate = useNavigate();
    // Call hooks unconditionally at the top level
    const [profile, setProfile] = useState<Profile | null>(null); // Allow null initial state

    useEffect(() => {
        // Access context properties only if context is not null
        if (context?.isProfileSetup) {
            const userString = localStorage.getItem("user");
            if (userString) {
                try {
                    setProfile(JSON.parse(userString));
                } catch (e) {
                    console.error("Failed to parse user from localStorage:", e);
                    // Optionally clear corrupted data
                    // localStorage.removeItem("user");
                }
            }
        } else {
            setProfile(null); // Clear profile if not setup
        }
        // Depend on context?.isProfileSetup to re-run effect when context becomes available or changes
    }, [context?.isProfileSetup]);

    // Handle null context case within the return statement
    if (!context) {
        // This should ideally not happen if Nav is always within the Provider
        console.error("Nav component rendered outside of AppContext Provider");
        // Return a minimal fallback or null, ensuring no hooks were called conditionally before this point
        return <div className="h-full w-min bg-[#f3f3ee] p-2"></div>; // Example fallback
    }

    // Destructure context properties now that we know context is not null
    const { setShowModal, setAuthType, isLoggedIn, setIsLoggedIn, isProfileSetup, setIsProfileSetup } = context;

    return (
        <div className="h-full w-min bg-[#f3f3ee] p-2 flex flex-col justify-between">
            <nav className="space-y-2 p-4 ">
                <header className="flex space-y-2 flex-col">
                    <span>
                        Perplexity
                    </span>
                    <button onClick={() => {
                        setShowModal(true);
                    }} className="flex bg-white p-2 h-min w-full rounded-xl border text-xs hover:border-teal-500 transition duration-300 ease-in-out">
                        <span>
                            New thread
                        </span>
                        <span className="border px-1 mx-1 rounded">CTRL</span>
                        <span className="border px-1 rounded">I</span>
                    </button>
                </header>
                <ul className="space-y-2">
                    <li>
                        <Button background={false} onClick={() => navigate("/")} icon={["fas", "magnifying-glass"]} label="Home" />
                    </li>
                    <li>
                        <Button onClick={() => {
                            if (!isLoggedIn) {
                                if (!isProfileSetup) {
                                    setShowModal(true);
                                    setAuthType("signup");
                                } else {
                                    setShowModal(true);
                                    setAuthType("login");
                                }
                            } else {
                                navigate("/library")
                            }
                        }} background={false} icon={["fas", "book"]} label="Library" />
                    </li>
                    {isLoggedIn ? <li>
                        <Button background={false} icon={["fas", "circle-nodes"]} label="AI Profile" />
                    </li> : <li>
                        <Button background={false} onClick={() => {
                            setShowModal(true);
                            setAuthType("login");
                        }} icon={["fas", "right-to-bracket"]} label="Login" />
                    </li>}


                </ul>
                {!isLoggedIn && <button onClick={() => {
                    setShowModal(true);
                    setAuthType("signup");
                }} className="px-4 py-2 rounded-lg w-full bg-teal-600 hover:bg-teal-500 transition duration-300 ease-in-out text-white">
                    Sign Up
                </button>}

                {isLoggedIn && <button onClick={() => {
                    setIsLoggedIn(false);
                    setIsProfileSetup(false);
                    localStorage.setItem("isLoggedIn", "false");
                    localStorage.setItem("isProfileSetup", "false");
                    localStorage.setItem("user", "");
                }} className="px-4 py-2 rounded-lg w-full bg-rose-600 hover:bg-rose-500 transition duration-300 ease-in-out text-white">
                    Sign Out
                </button>}

            </nav>
            <div className="flex flex-col justify-center space-y-2">
                <div className="flex flex-col justify-center p-2 space-y-2">
                    <span className="font-bold text-md">
                        Try Pro
                    </span>
                    <span className="text-clip text-gray-400">
                        Upgrade to Claude-2 or GPT-4, boost your Copilot uses, and upload more files.
                    </span>
                    <div>
                        <button className="bg-gray-300 px-4 py-1 hover:text-gray-400 text-md transition duration-200 ease-in-out rounded-sm text-black">
                            Learn More
                        </button>
                    </div>
                </div>
                {/* Use isLoggedIn as well, profile might exist briefly before logout state updates */}
                {isLoggedIn && isProfileSetup && profile && <div className="flex space-x-3 p-2 items-center cursor-pointer rounded-md hover:bg-gray-200 transition ease-in-out duration-300">
                    <img className="aspect-square rounded-full w-8" referrerPolicy="no-referrer" src={profile.avatar || '/vite.svg'} /> {/* Added fallback */}
                    <span className="font-bold text-md">{profile.name}</span>
                </div>}
                <div className="py-2 space-y-4">

                    <hr className="border-t border-gray-300 border-b-0 border-l-0 border-r-0 h-0" />
                    <div className="flex space-x-2">
                        <Button background={false} label="Download" icon={["fas", "mobile-screen"]} />
                        <Button background={false} label="" icon={["fab", "x-twitter"]} />
                        <Button background={false} label="" icon={["fab", "discord"]} />
                    </div>
                </div>
            </div>
        </div>)
}
