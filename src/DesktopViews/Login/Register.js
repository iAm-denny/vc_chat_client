import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Input from "../../components/Input";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { createAvatar } from "@dicebear/avatars";
import * as style from "@dicebear/pixel-art";
import "./auth.css";

import { useMutation } from "@apollo/client";
import { CREATE_USER } from "../../graphql/user_queries";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const [createUser, { data, loading, error }] = useMutation(CREATE_USER);

  const submitHandle = (e) => {
    e.preventDefault();

    createUser({
      variables: {
        input: {
          email,
          password,
          username,
          profile_img: createAvatar(style, {
            seed: email,
          }),
        },
      },
    });

    return;
  };
  useEffect(() => {
    if (data && data.createUser.message == "success") {
      return navigate(`/check_otp?email=${email}`);
    }
    console.log("data", data);
    if (data && data.createUser.message == "user already exist") {
      toast.error("User already exist.");
    }
  }, [data]);

  const onChangeHandle = (e) => {
    if (e.target.id === "email") setEmail(e.target.value);
    if (e.target.id === "username") setUsername(e.target.value);
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
          <label htmlFor="username">Username</label>
          <Input
            type="username"
            id="username"
            class="password_input"
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
        {loading ? (
          <div style={{ fontSize: 13, color: "white", textAlign: "center" }}>
            Loading
          </div>
        ) : (
          <button className="reg_btn">Continue</button>
        )}
      </form>
      <Link to="/" className="no_account_link">
        Already have an account?
      </Link>
    </motion.div>
  );
}

export default Register;
