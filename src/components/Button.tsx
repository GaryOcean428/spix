import React, { FC } from "react"; // Added React import and combined FC
import { IconProp } from "@fortawesome/fontawesome-svg-core"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

interface ButtonProps {
    icon?: IconProp,
    label?: string,
    background?: boolean,
    onClick?: () => void,
    rounded?: string,
    type?: "button" | "submit" | "reset", // Add type prop
    disabled?: boolean // Add disabled prop while we're here
}

export const Button: FC<ButtonProps> = ({ icon, onClick = () => {}, background = true, rounded = "-md", label = "", type = "button", disabled = false }) => { // Destructure type and disabled
    // Add disabled styles
    const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200";
    const backgroundClass = background ? `bg-gray-100` : '';

    return (
        // Apply disabled styles to the outer div as well for visual consistency
        <div className={`flex items-center w-full rounded${rounded} px-2 py-1 space-x-2 transition duration-300 ease-in-out ${backgroundClass} ${disabledClasses}`}>
            {(icon && label !== "") && ( // Use !== for clarity
                <span className={disabled ? "text-gray-400" : ""}> {/* Dim icon if disabled */}
                    <FontAwesomeIcon icon={icon} />
                </span>
            )}
            {/* Pass type and disabled to the actual button element */}
            <button
                type={type}
                onClick={onClick}
                disabled={disabled}
                className={`font-bold border-transparent w-full text-left ${disabled ? "text-gray-500" : ""}`} // Ensure text alignment and disabled text color
            >
                {label === "" ? <FontAwesomeIcon icon={icon!} /> : label} {/* Use === for clarity */}
            </button>
        </div>
    );

}
