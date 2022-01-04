import React, { useState, useContext, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import "./index.css";
import { useQuery } from "@apollo/client";
import {
  Chat,
  Login,
  PhoneCall,
  Register,
  CheckOtp,
  NotFound,
} from "./DesktopViews";
import DesktopNavigation from "./components/DesktopNavigation";
import { AnimatePresence } from "framer-motion";
import { FETCH_USER_DETAIL } from "./graphql/user_queries";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "./context/UserContext";

function App() {
  const [showNotiModal, setShowNotiModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { isLoggedIn, setIsLoggedIn, setUser } = useContext(AuthContext);
  const { loading, error, data } = useQuery(FETCH_USER_DETAIL, {
    context: {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    },
  });
  let location = useLocation();
  let selected = location.pathname.split("/")[1];

  const stateProps = {
    // noti
    showNotiModal: showNotiModal,
    setShowNotiModal: setShowNotiModal,
    // profile
    showProfileModal: showProfileModal,
    setShowProfileModal: setShowProfileModal,
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token !== null && token !== undefined) {
      if (data && data.user && !loading) {
        setIsLoggedIn(true);
        setUser(data.user);
      }
    }
  }, [selected, data, isLoggedIn]);

  return (
    <>
      {isLoggedIn ? (
        <DesktopNavigation stateProps={stateProps}>
          <Routes>
            <Route
              exact
              path="/"
              element={<Chat setShowNotiModal={setShowNotiModal} />}
            />
            <Route path="/vc/:id" element={<PhoneCall />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </DesktopNavigation>
      ) : (
        <AnimatePresence>
          <Routes location={location} key={location.key}>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/check_otp" element={<CheckOtp />} />
          </Routes>
        </AnimatePresence>
      )}
      <ToastContainer />
    </>
  );
}

export default App;
