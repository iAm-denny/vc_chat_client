import { useState, createContext, useEffect, useContext, useRef } from "react";
import { useLocation } from "react-router-dom";
import io from "socket.io-client";
import { AuthContext } from "./UserContext";
import Peer from "simple-peer";
import { useNavigate } from "react-router-dom";
export const SocketContext = createContext({});

const END_POINT = "http://localhost:4000/";
export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [stream, setStream] = useState();
  const [name, setName] = useState("");
  const [call, setCall] = useState({});
  const [me, setMe] = useState("");
  const navigate = useNavigate();
  const myVideo = useRef();
  // other user
  const userVideo = useRef();
  const connectionRef = useRef();

  const { user, setSelectUserForPhone, selectUserForPhone } =
    useContext(AuthContext);
  let location = useLocation();
  let selected = location.pathname.split("/")[1];

  useEffect(() => {
    if (user) {
      setSocket(io.connect(END_POINT));
    }
  }, [selected, user]);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: false, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (myVideo.current && myVideo.current.srcObject) {
          myVideo.current.srcObject = currentStream;
        }
      });
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("connect", (id) => {
        socket.emit("storeClientInfo", { userid: user.id });
      });
      socket.on("me", (id) => setMe(id));
      socket.on("callUser", (data) => {
        const { from, user: callerName, signal } = data;
        setCall({ isReceivingCall: true, from, user: callerName, signal });
      });
    }
  }, [socket]);

  const answerCall = () => {
    setCallAccepted(true);

    const peer = new Peer({ initiator: false, trickle: false, stream });
    setSelectUserForPhone(call);
    peer.on("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: call.from });
    });

    peer.on("stream", (currentStream) => {
      if (userVideo.current && userVideo.current.srcObject) {
        userVideo.current.srcObject = currentStream;
      }
    });

    peer.signal(call.signal);

    connectionRef.current = peer;
    navigate("/vc/123");
  };
  const callUser = (id, username) => {
    const peer = new Peer({ initiator: true, trickle: false, stream });

    peer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: id,
        signalData: data,
        from: me,
        user: username,
      });
    });

    peer.on("stream", (currentStream) => {
      userVideo.current.srcObject = currentStream;
    });

    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);

      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);

    connectionRef.current.destroy();
    socket.emit("leave_call", {
      to_userId: selectUserForPhone.user
        ? selectUserForPhone.user.id
        : selectUserForPhone.id,
    });
    window.location.reload();
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        END_POINT,
        call,
        callAccepted,
        myVideo,
        userVideo,
        stream,
        name,
        setName,
        callEnded,
        me,
        callUser,
        leaveCall,
        answerCall,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
