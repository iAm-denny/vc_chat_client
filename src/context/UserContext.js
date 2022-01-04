import { useState, createContext } from "react";

export const AuthContext = createContext({});

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [FriendList, setFriendList] = useState([]);
  const [selectUserForPhone, setSelectUserForPhone] = useState({});

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isLoggedIn,
        setIsLoggedIn,
        FriendList,
        setFriendList,
        setSelectUserForPhone,
        selectUserForPhone,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
