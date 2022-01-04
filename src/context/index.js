import React from "react";
import { SocketContextProvider } from "./SocketContext";
import { AuthContextProvider } from "./UserContext";

function index({ children }) {
  return (
    <AuthContextProvider>
      <SocketContextProvider>{children}</SocketContextProvider>
    </AuthContextProvider>
  );
}

export default index;
