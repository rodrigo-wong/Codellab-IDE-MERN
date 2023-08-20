import React, { createContext, useContext, useState } from "react";

// Create the context
const UserContext = createContext();

// Create a custom hook to use the context
export const useUserContext = () => {
  return useContext(UserContext);
};

// Create the context provider component
export const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [roomInfo, setRoomInfo] = useState();

  const values = {
    user,
    setUser,
    roomInfo,
    setRoomInfo
  };

  return <UserContext.Provider value={values}>{children}</UserContext.Provider>;
};

export default UserContextProvider;
