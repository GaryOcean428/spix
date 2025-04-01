import { Nav } from './components/Nav'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Home } from './pages/Home';
import { Modal } from './components/Modal';
import { TokenResponse, useGoogleLogin } from '@react-oauth/google';
import { Button } from './components/Button';
import { useEffect, useState } from 'react';
import React from 'react';
import { Search } from './components/Search';
import { Result } from './pages/Result';
import { Library } from './pages/Library';
import { ProfileSetup } from './components/ProfileSetup';

// Define types/interfaces
interface User {
  name: string;
  avatar?: string; // Make avatar optional to handle potential undefined state during profile setup input change
}

interface AppContextValue {
  authType: "login" | "signup" | "";
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  isProfileSetup: boolean;
  setIsProfileSetup: React.Dispatch<React.SetStateAction<boolean>>;
  setAuthType: React.Dispatch<React.SetStateAction<"login" | "signup" | "">>;
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

interface AuthModalProps {
  onGoogleLoginSuccess: (res: TokenResponse) => Promise<void>;
  onGoogleLoginFailure: (error?: unknown) => void; // Use unknown instead of any
}

export const AppContext = React.createContext<AppContextValue | null>(null); // Use defined type, default to null


const AuthModal = ({ onGoogleLoginSuccess, onGoogleLoginFailure }: AuthModalProps) => { // Use defined props type

  const login = useGoogleLogin({
    onSuccess: onGoogleLoginSuccess,
    onError: onGoogleLoginFailure,
  })

  return (<div className="p-4">
    <span>Sign in or sign up to continue</span>
    <div className="flex flex-col items-center space-y-2 p-2">
      <Button onClick={() => login()} label="Continue with Google" icon={["fab", "google"]} />
      <Button label="Continue with Apple" icon={["fab", "apple"]} />
      <hr />
      <input placeholder="henry@example.com" className="rounded-xl border text-sm px-2 py-1 outline-none w-full hover:border-teal-500 transition duration-300 ease-in-out" />
      <Button label="Continue with Email" icon={["fas", "envelope"]} />
    </div>
  </div>)
}

const SearchModal = () => {
  return (<div className="p-4 w-full h-full">
    <Search />
  </div>)
}

function App() {

  const [authType, setAuthType] = useState<"login" | "signup" | "">("");

  const [showModal, setShowModal] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("isLoggedIn") == "true");

  const [showProfileSetup, setShowProfileSetup] = useState(false);

  const [isProfileSetup, setIsProfileSetup] = useState(localStorage.getItem("isProfileSetup") === "true"); // Use ===

  const [user, setUser] = useState<User | null>(null); // Use defined User type, default null

  useEffect(() => {

    const threads = JSON.parse(localStorage.getItem("threads") ?? "{}");
    if (Object.keys(threads).length == 0) {
      localStorage.setItem("threads", JSON.stringify({}));
    }

    window.addEventListener("keydown", (e) => {
      // ctrl + I
      if (e.ctrlKey && e.key == "i") {
        setShowModal(true);
        setAuthType("");
      }
    })

    return () => {
      window.removeEventListener("keydown", () => { });
    }

  }, []);

  const onGoogleLoginSuccess = async (res: TokenResponse) => {
    console.log("Google Login Success Response:", res); // Log the initial success response
    if (!res.access_token) {
      console.error("Google Login Success Response does not contain access_token");
      alert("Failed to complete login with Google. Please check console for details.");
      return;
    }
    if (authType == "login") {
      setShowModal(false);

      try {
        console.log("Attempting to fetch Google People API for login...");
        const response = await fetch('https://people.googleapis.com/v1/people/me?personFields=names,photos', {
          headers: {
            'Authorization': `Bearer ${res.access_token}`
          }
        });
        console.log("Google People API Response Status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Google People API Error Response:", errorText);
          throw new Error(`Google People API request failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log("Google People API Data:", data); // Log the fetched data

        // Basic check for expected data structure
        if (!data || !data.names || data.names.length === 0 || !data.photos || data.photos.length === 0) {
          console.error("Unexpected data structure from Google People API:", data);
          throw new Error("Received incomplete user data from Google People API");
        }

        // Use const as the object itself isn't reassigned here
        const userResult: User = {
          name: data.names[0].displayName,
          avatar: data.photos[0].url,
        };
        console.log("User object created (login):", userResult);

        setUser(userResult); // Set the user state with the fetched result

        // Removed duplicate setUser(user) call
        localStorage.setItem("user", JSON.stringify(userResult)); // Use userResult here

        localStorage.setItem("isProfileSetup", "true");
        localStorage.setItem("isLoggedIn", "true");

        setIsProfileSetup(true);
        setIsLoggedIn(true);
        console.log("Login successful, state updated.");
      } catch (e) {
        console.error("Error during Google login fetch/processing:", e); // Log the specific error
        alert("Failed to complete login with Google. Please check console for details.");
      }
    }
    if (authType == "signup") {
      setShowModal(false);
      try {
        console.log("Attempting to fetch Google People API for signup...");
        const response = await fetch('https://people.googleapis.com/v1/people/me?personFields=names,photos', {
          headers: {
            'Authorization': `Bearer ${res.access_token}`
          }
        });
        console.log("Google People API Response Status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Google People API Error Response:", errorText);
          throw new Error(`Google People API request failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log("Google People API Data:", data); // Log the fetched data

        // Basic check for expected data structure
        if (!data || !data.names || data.names.length === 0 || !data.photos || data.photos.length === 0) {
          console.error("Unexpected data structure from Google People API:", data);
          throw new Error("Received incomplete user data from Google People API");
        }

        // Use const as the object itself isn't reassigned here
        const userResult: User = {
          name: data.names[0].displayName,
          avatar: data.photos[0].url,
        };
        console.log("User object created (signup):", userResult);

        setUser(userResult); // Set the user state with the fetched result

        // Removed duplicate setUser(user) call
        localStorage.setItem("user", JSON.stringify(userResult)); // Use userResult here
        setShowProfileSetup(true);
        console.log("Signup successful, proceeding to profile setup.");

      } catch (e) {
        console.error("Error during Google signup fetch/processing:", e); // Log the specific error
        alert("Failed to complete signup with Google. Please check console for details.");
      }
    }
    // console.log(res); // Already logged at the start of the function
  }

  // Use unknown for better type safety if error structure isn't guaranteed
  const onGoogleLoginFailure = (error?: unknown) => {
    console.error("Google Login Failure Callback Triggered. Error:", error); // Log the specific error object
    alert("Failed to login with Google. Please check console for details.");
  }

  return (
    <AppContext.Provider value={{
      authType,
      isLoggedIn,
      setIsLoggedIn,
      isProfileSetup,
      setIsProfileSetup,
      setAuthType,
      showModal,
      setShowModal
    } as AppContextValue // Assert type for provider value
    }>
      <BrowserRouter>
        <section className="flex h-screen w-screen">
          <Modal title={authType != "" ? "Welcome" : ""} isOpen={showModal} closeModal={() => {
            setShowModal(false);
            setAuthType("");
          }}>
            {(authType == "login" || authType == "signup") && <AuthModal onGoogleLoginSuccess={onGoogleLoginSuccess} onGoogleLoginFailure={onGoogleLoginFailure} />}
            {authType == "" && <SearchModal />}
          </Modal>
          <ProfileSetup isOpen={showProfileSetup} closeModal={() => {
            setIsLoggedIn(true);
            setIsProfileSetup(true);
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("isProfileSetup", "true");
            localStorage.setItem("user", JSON.stringify(user));
            setShowProfileSetup(false);
          }}>
            <div className="space-y-2 p-5 flex flex-col">
              <span className="font-bold text-4xl p-5">Create your account</span>
              <div className="flex flex-col space-y-2">
                <span>Avatar</span>
                {/* Provide a fallback or handle missing avatar */}
                <img className="aspect-square rounded-full w-8" referrerPolicy="no-referrer" src={user?.avatar || '/vite.svg'} /> {/* Added fallback */}
              </div>
              <div className="flex flex-col space-y-2">
                <span>Username</span>
                <div className="bg-white p-2 rounded-lg border border-gray-200 hover:border-teal-500 transition ease-in-out duration-300 ">
                  <input onChange={(e) => {
                    // Ensure user is not null before spreading
                    if (user) {
                      setUser({ ...user, name: e.target.value });
                    }
                  }} className="w-full border-none outline-none" placeholder="Enter your username" value={user?.name || ''} /> {/* Handle potential null user */}
                </div>
              </div>
            </div>
          </ProfileSetup>
          <Nav />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/result" element={<Result />} />
              <Route path="/library" element={<Library />} />
            </Routes>
        </section>
      </BrowserRouter>
    </AppContext.Provider>
  )
}

export default App
