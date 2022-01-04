import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import Input from "../../components/Input";
import "./auth.css";
import { motion } from "framer-motion";
import { useMutation } from "@apollo/client";
import { CHECK_OTP } from "../../graphql/user_queries";
import { useLocation } from "react-router-dom";
import { AuthContext } from "../../context/UserContext";

const containerVariants = {
  unactive: {
    opacity: 0,
  },
  active: {
    opacity: 1,
    transition: { duration: 0.8 },
  },
  exit: {
    opacity: 0,
    transition: { ease: "easeInOut" },
  },
};

function CheckOtp() {
  const [otp, setOtp] = useState("");
  const [checkOtp, { data, loading, error }] = useMutation(CHECK_OTP);
  let { search } = useLocation();
  const query = new URLSearchParams(search);
  const email = query.get("email");
  const { setIsLoggedIn } = useContext(AuthContext);

  const submitHandle = (e) => {
    checkOtp({
      variables: {
        input: {
          otp_code: otp,
          email,
        },
      },
    });

    e.preventDefault();
  };

  useEffect(() => {
    if (data && data.checkOtp.message === "success") {
      localStorage.setItem("token", data.checkOtp.token);
      // setIsLoggedIn(true);
      window.location.href = "/";
    }
  }, [data]);

  return (
    <motion.div
      className="auth_container"
      style={{ display: "flex", flexDirection: "column" }}
      variants={containerVariants}
      initial="unactive"
      animate="active"
      exit="exit"
    >
      <form onSubmit={submitHandle} style={{ flex: 1 }}>
        <h2>Check your mail!</h2>
        <div style={{ marginTop: 30 }}>
          <label htmlFor="otp">OTP code</label>
          <Input
            type="text"
            id="otp"
            class="email_input"
            onChange={(e) => setOtp(e.target.value)}
          />
        </div>
      </form>
      {loading ? (
        <div style={{ fontSize: 13, color: "white", textAlign: "center" }}>
          Loading
        </div>
      ) : (
        <button className="login_btn" type="submit" onClick={submitHandle}>
          Create an account
        </button>
      )}

      <Link to="/register" className="no_account_link">
        Don't have an account?
      </Link>
    </motion.div>
  );
}

export default CheckOtp;
