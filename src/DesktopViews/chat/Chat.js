import React, { useState, useEffect, useContext, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ReactComponent as PhoneIcon } from "../../assets/phone_call.svg";
import { ReactComponent as NoMessage } from "../../assets/no_message.svg";
import { ReactComponent as NoFri } from "../../assets/no_fri.svg";
import { ReactComponent as SendMsg } from "../../assets/sent_msg.svg";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { FETCH_FRIENDS_LIST } from "../../graphql/user_queries";
import { SEND_MESSAGE, FETCH_MESSAGE } from "../../graphql/message_queries";
import "./chat.css";
import { AuthContext } from "../../context/UserContext";
import { SocketContext } from "../../context/SocketContext";
import moment from "moment";

const selectedPersonVairants = {
  active: {
    backgroundColor: "rgba(249, 170, 51, 0.2)",
    border: "1px solid #f9aa33",
  },
  unactive: { backgroundColor: "#4a6572", border: "none" },
};
const selectedTrainstion = {
  type: "spring",
  stiffness: 700,
  damping: 10,
};

const unreadMessageCountVariants = {
  active: {
    scale: 1,
  },
  unactive: {
    scale: 0,
  },
};

function Chat(props) {
  const [selectChatPersonId, setSelectChatPersonId] = useState(null);
  const [selectChatRoomId, setSelectChatRoomId] = useState(null);
  const [selectChatUsername, setSelectChatUsername] = useState("");

  const [unread, SetUnread] = useState(0);
  const [content, setContent] = useState("");
  const [messages, setMessages] = useState([]);
  const { FriendList, setFriendList, user, setSelectUserForPhone } =
    useContext(AuthContext);
  const [sortedMessage, setSortedMessage] = useState([]);
  const [
    getMessages,
    { data: messageList, loading: messageListLoader, error: messageListError },
  ] = useLazyQuery(FETCH_MESSAGE);
  const {
    socket,
    END_POINT,
    name,
    callAccepted,
    myVideo,
    userVideo,
    callEnded,
    stream,
    call,
    leaveCall,
    callUser,
    answerCall,
  } = useContext(SocketContext);
  const [
    sendMessage,
    { data: messageData, loading: messageLoader, error: messageError },
  ] = useMutation(SEND_MESSAGE);
  const [getFriList, { data, loading, error }] = useLazyQuery(
    FETCH_FRIENDS_LIST,
    {
      context: {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      },
    }
  );

  const messagesEndRef = useRef();

  useEffect(() => {
    getFriList();
  }, []);

  useEffect(() => {
    if (
      messageList &&
      messageList.getMessages &&
      messageList.getMessages.message == "success" &&
      messageList.getMessages.messages
    ) {
      generateItems(messageList.getMessages.messages);
    }
  }, [messageList]);
  useEffect(() => {
    if (data && data.FriendList.message == "success") {
      if (data.FriendList.users) {
        setFriendList(data.FriendList.users);
      }
    }
  }, [data]);

  const navigate = useNavigate();

  // props
  const { setShowNotiModal } = props;

  const getMessagesHandle = (usr) => {
    setMessages([]);
    getMessages({
      variables: {
        input: {
          receiver_id: usr.id,
          room_id: usr.room_id,
        },
      },
      context: {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      },
    });
    setSelectChatPersonId(usr.id);
    setSelectChatRoomId(usr.room_id);
    localStorage.setItem("room_id", usr.room_id);
    setSelectChatUsername(usr.username);
    setSelectUserForPhone(usr);
    scrollToBottom();
  };

  const individualPerson = (usr, index) => {
    return (
      <motion.div
        className="individual_container"
        key={usr.id}
        onClick={() => {
          getMessagesHandle(usr);
        }}
        initial={false}
        variants={selectedPersonVairants}
        animate={selectChatPersonId == usr.id ? "active" : "unactive"}
        transition={{ duration: 0.35 }}
        layout
      >
        <div className="person_info">
          {/* <div
            className="profile"
            style={{
              backgroundImage:
                "url(https://i.pinimg.com/564x/eb/a3/7b/eba37b304f19d2c6e01c44390950d216.jpg)",
            }}
          ></div> */}
          <div
            className="profile"
            dangerouslySetInnerHTML={{
              __html: usr.profile_img,
            }}
          ></div>
          <div>
            <div style={{ fontSize: 13 }}>{usr.username}</div>
            {/* <div style={{ fontSize: 12, color: "#82868D" }}>Last message</div> */}
          </div>
        </div>
        <motion.div
          variants={unreadMessageCountVariants}
          animate={unread > 0 ? "active" : "unactive"}
          className="unread_message"
        >
          {" "}
          {unread}
        </motion.div>
      </motion.div>
    );
  };

  const FriendListContianer = () => {
    return (
      <div className="chat_friend_list_container">
        <div style={{ width: "100%" }}>
          <input type="text" className="search_friends" />
        </div>

        {FriendList.map((_, index) => individualPerson(_, index))}
      </div>
    );
  };

  useEffect(() => {
    if (socket) {
      socket.on("send_message", (data) => {
        if (
          data.newData.receiver_id == user.id &&
          data.newData.room_id == localStorage.getItem("room_id")
        ) {
          setMessages([...data.messages]);
        }
      });
      socket.on("accpet_fri", (data) => {
        getFriList();
      });
    }
  }, [socket, END_POINT]);

  const submitHandle = (e) => {
    e.preventDefault();

    if (content.length > 0) {
      setContent("");
      setMessages([
        ...messages,
        {
          sender_id: user.id,
          message: content,
          room_id: selectChatRoomId,
        },
      ]);
      if (selectChatPersonId) {
        socket.emit("send_message", {
          data: {
            messageList: messages,
            newData: {
              receiver_id: selectChatPersonId,
              sender_id: user.id,
              message: content,
              room_id: selectChatRoomId,
            },
          },
        });
      }

      sendMessage({
        variables: {
          input: {
            receiver_id: selectChatPersonId,
            message: content,
            room_id: selectChatRoomId,
          },
        },
        context: {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        },
      });
    }
  };

  const scrollToBottom = () => {
    // this.messagesEndRef.current.scrollIntoView();
    if (messagesEndRef && messagesEndRef.current)
      messagesEndRef.current.scrollIntoView();
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const callHandle = () => {
    callUser(selectChatPersonId, user);

    navigate(`/vc/123456`);
  };

  const Chatting = () => {
    return (
      <div className="chatting_container">
        <div className="chat_header">
          <div className="chat_header_name">{selectChatUsername}</div>
          <div className="chat_header_icon" onClick={callHandle}>
            <PhoneIcon />
            {/* <img src={PhoneIcon} /> */}
          </div>
        </div>
        <div className="messages_container">
          {messages.map((_) => (
            <>
              {_.type == "day" ? (
                <div
                  style={{
                    width: "100%",

                    borderTop: "1px solid#72767D",
                    margin: "10px 0px",
                  }}
                >
                  <div
                    style={{
                      color: "#72767D",
                      fontWeight: "bold",
                      fontSize: 13,
                      textAlign: "center",
                      // opacity: 0.6,
                    }}
                  >
                    {moment(_.date).format("MMMM DD, YYYY")}
                  </div>
                </div>
              ) : _.sender_id == user.id ? (
                <div style={{ marginLeft: 80 }}>
                  <div className="meassage_sender_date">
                    {moment(_.createdAt).format("MMM DD, hh:mm a")}
                  </div>
                  <motion.p
                    className="meassage_sender"
                    initial={{ scale: 0, x: 10 }}
                    animate={{ scale: 1, x: 0 }}
                    transition={{ ease: "easeOut", duration: 0.5 }}
                  >
                    {_.message}
                  </motion.p>
                </div>
              ) : (
                <div style={{ width: "90%" }}>
                  <div className="meassage_receiver_date">
                    {moment(_.createdAt).format("MMM DD, hh:mm a")}
                  </div>
                  <motion.p
                    className="meassage_receiver"
                    initial={{ scale: 0, y: 10 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ ease: "easeOut", duration: 0.5 }}
                  >
                    {_.message}
                  </motion.p>
                </div>
              )}
            </>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div>
          <div className="chat_footer">
            <div>Icon</div>
            <form onSubmit={submitHandle}>
              <div>
                <input
                  type="text"
                  placeholder="Send a message"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
              <button
                style={{
                  background: "#f9aa33",
                  border: "none",
                  width: 40,
                  height: 40,
                  borderRadius: 50,
                  cursor: "pointer",
                }}
              >
                <SendMsg />
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const groupedDays = (messages) => {
    return (
      messages &&
      messages.reduce((acc, el, i) => {
        const messageDay = moment(el.createdAt).format("YYYY-MM-DD");

        if (acc[messageDay]) {
          return { ...acc, [messageDay]: acc[messageDay].concat([el]) };
        }
        return { ...acc, [messageDay]: [el] };
      }, {})
    );
  };

  const generateItems = (messages) => {
    if (
      messages == undefined ||
      messages.length < 0 ||
      messages == null ||
      messages == {}
    ) {
      return [];
    } else {
      var isNewShow = false;
      const days = groupedDays(messages);
      // console.log(JSON.stringify(days));

      const sortedDays = Object.keys(days).sort(
        (x, y) =>
          moment(y, "YYYY-MM-DD").unix() - moment(x, "YYYY-MM-DD").unix()
      );

      const items = sortedDays.reduce((acc, date) => {
        const sortedMessages = days[date].sort(
          (x, y) => new Date(x.createdAt) - new Date(y.createdAt)
        );
        let newArray = [...sortedMessages];

        newArray = newArray.map((ele, i) => {
          var isShow;
          if (ele.has_read && !isNewShow) {
            isShow = true;
            isNewShow = true;
          } else {
            isShow = false;
          }

          return { ...ele, isNew: isShow };
        });

        return acc.concat([{ type: "day", date, id: date }, ...newArray]);
      }, []);

      setMessages([...items]);
      return items;
    }
  };

  return (
    <div onClick={() => setShowNotiModal(false)}>
      {/* <button
        onClick={() => {
          SetUnread(unread + 1);
        }}
      >
      
        Click
      </button> */}

      {call.isReceivingCall && !callAccepted && (
        <div>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0,0,0,.4)",
              zIndex: 5,
            }}
          ></div>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 300,
              height: 300,
              backgroundColor: "#344955",
              zIndex: 6,
              borderRadius: 10,
              display: "flex",
              // justifyContent: "center",
              paddingTop: 50,
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                border: "1px solid #fff",
              }}
              dangerouslySetInnerHTML={{
                __html: call.user.profile_img,
              }}
            ></div>
            <div
              style={{
                color: "#fff",
                margin: "15px 0px",
              }}
            >
              <b>{call.user.username}</b> is calling you
            </div>
            <button onClick={answerCall}>Answer</button>
          </div>
        </div>
      )}

      <div className="chat_container">
        {FriendList.length == 0 ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              height: "88vh",
              flexDirection: "column",
            }}
          >
            <NoFri />
            <div
              style={{
                fontWeight: 600,
                fontSize: 16,
                color: "#BECAE4",
                marginTop: 8,
              }}
            >
              No Chat to added yet.
            </div>
          </div>
        ) : (
          <>
            {FriendListContianer()}
            {selectChatUsername ? (
              Chatting()
            ) : (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "80%",
                  height: "88vh",
                  flexDirection: "column",
                }}
              >
                <NoMessage />
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 16,
                    color: "#BECAE4",
                    marginTop: 8,
                  }}
                >
                  Select your friend to start conversation.
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Chat;
