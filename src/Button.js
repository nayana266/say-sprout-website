import React from "react";
import { useNavigate } from "react-router-dom";

function Button() {
    const navigate = useNavigate();  // Correct hook in React Router v6

    const handleClick = () => {
        navigate("/newpage");  // Use navigate to go to the new page
    };

    return (
        <button className="start-button" onClick={handleClick}>
            Start
        </button>
    );
}

export default Button;
