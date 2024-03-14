import React from "react";
import { useUserContext } from "../context/UserContext";

const ThemeSwitch = ({isNav}) => {
    const {setColorScheme, darkMode, setDarkMode} = useUserContext();
  return (
    <div className="form-check form-switch">
      <div className="d-block">
        <input
          className="form-check-input"
          type="checkbox"
          role="switch"
          id="flexSwitchCheckDefault"
          checked = {darkMode}
          onChange={() => {
            setDarkMode(!darkMode);
            setColorScheme({
              backgroundColor: !darkMode ? " bg-dark" : " bg-light",
              textColor: !darkMode ? " text-light" : " text-dark",
            });
          }}
        />
      </div>
      <label
        className={
          "form-check-label d-flex align-items-center "
        }
        htmlFor="flexSwitchCheckDefault"
      >
        {darkMode ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill= "white"
            className="bi bi-moon-fill"
            viewBox="0 0 16 16"
            style={{ marginRight: "5px" }}
          >
            <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="25"
            height="25"
            fill={isNav? "white": "black"}
            className="bi bi-brightness-high-fill"
            viewBox="0 0 16 16"
            style={{ marginRight: "5px" }}
          >
            <path d="M12 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z" />
          </svg>
        )}
        <span className={(!isNav && darkMode) || isNav? "text-light button-text": "text-dark button-text"}>
        {darkMode ? "Dark Mode" : "Light Mode"}
        </span>

      </label>
    </div>
  );
};

export default ThemeSwitch;
