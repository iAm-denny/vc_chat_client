import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import Input from "../../components/Input";
import { motion } from "framer-motion";
import { useMutation } from "@apollo/client";
import { LOGIN_MUTATION } from "../../graphql/user_queries";
import { AuthContext } from "../../context/UserContext";

import "./auth.css";

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

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, { data, loading, error }] = useMutation(LOGIN_MUTATION);
  const { setIsLoggedIn } = useContext(AuthContext);
  const submitHandle = (e) => {
    e.preventDefault();

    login({
      variables: {
        input: {
          email,
          password,
        },
      },
    });
  };

  useEffect(() => {
    if (data && data.login.message == "success") {
      window.location.reload();
      setIsLoggedIn(true);
      localStorage.setItem("token", data.login.token);
    }
  }, [data]);

  const onChangeHandle = (e) => {
    if (e.target.id === "email") setEmail(e.target.value);
    if (e.target.id === "password") setPassword(e.target.value);
  };

  return (
    <motion.div
      className="auth_container"
      variants={containerVariants}
      initial="unactive"
      animate="active"
      exit="exit"
    >
      <form onSubmit={submitHandle}>
        <h2>Welcome back</h2>
        <div style={{ marginTop: 50 }}>
          <label htmlFor="email">Email</label>
          <Input
            type="text"
            id="email"
            class="email_input"
            onChange={onChangeHandle}
          />
        </div>
        <div style={{ marginTop: 20 }}>
          <label htmlFor="password">Password</label>
          <Input
            type="password"
            id="password"
            class="password_input"
            onChange={onChangeHandle}
          />
        </div>

        <button className="login_btn">Login</button>
      </form>
      <Link to="/register" className="no_account_link">
        Don't have an account?
      </Link>
    </motion.div>
  );
}

export default Login;
