import React, { createContext, useContext, useState } from "react";

// Create the context
const UserContext = createContext();

// Create a custom hook to use the context
export const useUserContext = () => {
  return useContext(UserContext);
};

// Create the context provider component
export const UserContextProvider = ({ children }) => {
  const [code, setCode] = useState("")
  const [user, setUser] = useState();
  const [roomInfo, setRoomInfo] = useState();
  const [currentCaret, setCurrentCaret] = useState(0);

  const values = {
    code,
    setCode,
    user,
    setUser,
    roomInfo,
    setRoomInfo,
    currentCaret,
    setCurrentCaret
  };

  return <UserContext.Provider value={values}>{children}</UserContext.Provider>;
};

export default UserContextProvider;
