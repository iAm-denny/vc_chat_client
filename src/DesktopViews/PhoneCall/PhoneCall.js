import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./phonecall.css";
import { SocketContext } from "../../context/SocketContext";
import { AuthContext } from "../../context/UserContext";
import { ReactComponent as EndCallIcon } from "../../assets/end_call.svg";

function PhoneCall() {
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const {
    callAccepted,
    myVideo,
    userVideo,
    callEnded,
    stream,
    leaveCall,
    socket,
    END_POINT,
  } = useContext(SocketContext);
  const { selectUserForPhone } = useContext(AuthContext);
  const navigate = useNavigate();

  let interval;
  const countDownAction = () => {
    interval = setInterval(() => {
      clearInterval(interval);

      if (seconds === 59) {
        setMinutes(minutes + 1);
        setSeconds(0);
      } else {
        setSeconds(seconds + 1);
      }
    }, 1000);
  };

  useEffect(() => {
    countDownAction();
  }, [seconds]);

  useEffect(() => {
    if (socket) {
      socket.on("end_call", (data) => {
        if (data.message == "success") {
          leaveCall();
          navigate(-1);
          setTimeout(() => {
            window.location.reload();
          }, 300);
        }
      });
    }
  }, [socket, END_POINT]);

  return (
    <div className="phone">
      <div style={{ flex: 0.5 }}></div>

      {stream && (
        <video
          playsInline
          muted
          ref={myVideo}
          autoPlay
          style={{ opacity: 0, position: "absolute" }}
        />
      )}
      {callAccepted && !callEnded && (
        <video
          playsInline
          ref={userVideo}
          autoPlay
          style={{ opacity: 0, position: "absolute" }}
        />
      )}
      {/* {callAccepted && !callEnded ? (
        <button onClick={leaveCall}>Hang Up</button>
      ) : null} */}
      <div className="person">
        <div
          className="profile"
          dangerouslySetInnerHTML={{
            __html: selectUserForPhone.user
              ? selectUserForPhone.user.profile_img
              : selectUserForPhone.profile_img,
          }}
        ></div>
        <div className="name">
          {selectUserForPhone.user
            ? selectUserForPhone.user.username
            : selectUserForPhone.username}
        </div>
        <div className="count_down">
          {minutes < 10 ? <span>0{minutes}</span> : <span>{minutes}</span>}:
          {seconds < 10 ? <span>0{seconds}</span> : <span>{seconds}</span>}
        </div>
      </div>
      <div
        className="end_call"
        onClick={() => {
          leaveCall();
          navigate(-1);
          setTimeout(() => {
            window.location.reload();
          }, 300);
        }}
      >
        <EndCallIcon />
      </div>
    </div>
  );
}

export default PhoneCall;
