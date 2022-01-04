import React, { useState, useEffect, useContext } from "react";
import { ReactComponent as NotificationIcon } from "../assets/notifcation.svg";
import "../App.css";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/UserContext";
import { SocketContext } from "../context/SocketContext";
import Input from "./Input";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import {
  REQUEST_FRIEND,
  GET_NOTIS,
  RESPONSE_FRIEND,
  FETCH_FRIENDS_LIST,
  UPDATE_NOTI,
} from "../graphql/user_queries";
import moment from "moment";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

const selectedPersonVairants = {
  active: {
    backgroundColor: "#f9aa33",
  },
  unactive: { backgroundColor: "none", border: "none" },
};

function DesktopNavigation(props) {
  const [notiList, setNotiList] = useState([]);
  const [username, setUsername] = useState("");
  const [tagline, setTagline] = useState("");
  const [
    getNotis,
    { data: notiItems, loading: notiLoading, error: notiError },
  ] = useLazyQuery(GET_NOTIS, {
    context: {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    },
  });

  const [responseFriend, { data: resFri }] = useMutation(RESPONSE_FRIEND);
  const [requestFriend, { data, loading, error }] = useMutation(REQUEST_FRIEND);
  const [updateNoti, { data: updateData }] = useMutation(UPDATE_NOTI);
  const { setIsLoggedIn, user, setFriendList } = useContext(AuthContext);
  const { socket, END_POINT } = useContext(SocketContext);
  const [fetchFriendList, { data: fetchFriData }] = useLazyQuery(
    FETCH_FRIENDS_LIST,
    {
      context: {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      },
    }
  );

  const [isNoti, setIsNoti] = useState(false);
  // console.log("state", states);
  // props
  const { children } = props;
  const {
    setShowNotiModal,
    showNotiModal,
    showProfileModal,
    setShowProfileModal,
  } = props.stateProps;
  let pathName = useLocation().pathname;

  const logoutHandle = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  useEffect(() => {
    if (socket) {
      socket.on("send_noti", (data) => {
        setIsNoti(data.notification);
      });
    }
  }, [socket, END_POINT, user]);
  useEffect(() => {
    getNotis();
  }, []);

  const addFriendHandle = () => {
    let taglineTxt;
    if (tagline.includes("#")) {
      taglineTxt = tagline.replaceAll("#", "");
    } else {
      taglineTxt = tagline;
    }
    requestFriend({
      variables: {
        requestFriendInput2: {
          username,
          tagline: taglineTxt,
        },
      },
      context: {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      },
    });
  };

  useEffect(() => {
    if (
      data &&
      data.requestFriend.message &&
      data.requestFriend.message == "success"
    ) {
      socket.emit("send_noti", {
        data: {
          sender_id: user.id,
          username,
          tagline,
        },
      });
      setUsername("");
      setTagline("");
      toast.info("Sent request.");
    }
    if (
      data &&
      data.requestFriend &&
      data.requestFriend.message == "not found"
    ) {
      toast.info("Not Found.");
    }
    if (
      data &&
      data.requestFriend &&
      data.requestFriend.message == "can't add self"
    ) {
      toast.info("Can't add self.");
    }
  }, [data]);

  const onChangeHandle = (e) => {
    if (e.target.id === "username") setUsername(e.target.value);
    if (e.target.id === "tagline") setTagline(e.target.value);
  };

  const notiClickHandle = (e) => {
    e.stopPropagation();
    setShowNotiModal(true);
    setShowProfileModal(false);
    setIsNoti(false);
    getNotis();
    updateNoti({
      context: {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      },
    });
  };

  useEffect(() => {
    if (notiItems && notiItems.getnotis) {
      setNotiList(notiItems.getnotis);
    }
  }, [notiItems]);

  const responseFriendHandle = (status, sender_id) => {
    responseFriend({
      variables: {
        input: {
          status,
          sender_id,
        },
      },
      context: {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      },
    });
    socket.emit("accpet_fri", {
      sender_id,
    });
    setNotiList(notiList.filter((n) => n.user_id != sender_id));
  };

  useEffect(() => {
    fetchFriendList();
  }, [resFri]);

  useEffect(() => {
    if (fetchFriData && fetchFriData.FriendList.message == "success") {
      if (fetchFriData.FriendList.users) {
        setFriendList(fetchFriData.FriendList.users);
      }
    }
  }, [fetchFriData]);

  return (
    <>
      {pathName.includes("vc") ? (
        <>{children}</>
      ) : (
        <div
          className="desktop_navigation_container"
          onClick={() => {
            setShowNotiModal(false);
            setShowProfileModal(false);
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingRight: 100,
            }}
          >
            <Link
              to="/"
              style={{
                fontSize: 25,
                color: "white",
                fontWeight: "bolder",
                cursor: "pointer",
                textDecoration: "none",
              }}
            >
              Vc chat
            </Link>
            <div style={{ display: "flex" }}>
              <Input
                type="text"
                id="username"
                class="search_name"
                placeholder="name"
                onChange={onChangeHandle}
                value={username}
              />
              <Input
                type="text"
                id="tagline"
                class="search_name"
                placeholder="TagLine"
                value={tagline}
                onChange={onChangeHandle}
              />
              <button
                onClick={addFriendHandle}
                style={{
                  background: "none",
                  border: "1px solid #82868d",
                  fontSize: "small",
                  color: "#82868d",
                  cursor: "pointer",
                  width: 100,
                }}
              >
                Add
              </button>
            </div>
            <div style={{ display: "flex" }}>
              <div className="bell_icon">
                <div onClick={notiClickHandle} className="bells">
                  <NotificationIcon />
                  {isNoti ? (
                    <motion.div
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        width: 8,
                        height: 8,
                        background: "#f9aa33",
                        borderRadius: 50,
                      }}
                      initial={false}
                      variants={selectedPersonVairants}
                      animate={isNoti ? "active" : "unactive"}
                      transition={{ duration: 0.35 }}
                    ></motion.div>
                  ) : notiList && notiList.some((n) => n.read == false) ? (
                    <motion.div
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        width: 8,
                        height: 8,
                        background: "#f9aa33",
                        borderRadius: 50,
                      }}
                      initial={false}
                      variants={selectedPersonVairants}
                      animate={isNoti ? "active" : "unactive"}
                      transition={{ duration: 0.35 }}
                    ></motion.div>
                  ) : null}
                </div>
                {showNotiModal && (
                  <div className="notifcation_items_list">
                    {notiList.map((_) => {
                      return (
                        <div
                          className="noti_item"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="person">
                            {/* <div
                              className="profile"
                              style={{
                                backgroundImage:
                                  "url(https://i.pinimg.com/564x/eb/a3/7b/eba37b304f19d2c6e01c44390950d216.jpg)",
                              }}
                            ></div> */}
                            <div
                              className="sender_profile"
                              dangerouslySetInnerHTML={{
                                __html: _.profile_img,
                              }}
                            ></div>
                            <div>
                              <div>{_.username} sent you a friend request.</div>
                              <div className="timestamp">
                                {moment(new Date(_.createdAt)).format(
                                  "MMM, D, YYYY | h:mm A"
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="btns">
                            <div
                              className="decline"
                              onClick={() =>
                                responseFriendHandle("decline", _.user_id)
                              }
                            >
                              Decline
                            </div>
                            <div
                              className="accpet"
                              onClick={() =>
                                responseFriendHandle("accpeted", _.user_id)
                              }
                            >
                              Accpet
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div>
                <div
                  className="profile_container"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowNotiModal(false);
                    setShowProfileModal(true);
                  }}
                  // style={{
                  //   backgroundImage:
                  //     "url(https://i.pinimg.com/564x/eb/a3/7b/eba37b304f19d2c6e01c44390950d216.jpg)",
                  // }}
                >
                  {user && (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: user.profile_img,
                      }}
                      style={{ width: 35 }}
                    ></div>
                  )}

                  <div style={{ marginLeft: 8 }}>
                    <div
                      style={{
                        color: "#fff",

                        fontSize: 14,
                      }}
                    >
                      {user && user.username}
                    </div>
                    <small
                      style={{
                        fontSize: 11,
                        color: "#99BBB1",
                        position: "relative",
                        top: -5,
                        letterSpacing: 1,
                      }}
                    >
                      #{user && user.tagline}
                    </small>
                  </div>
                </div>

                {showProfileModal && (
                  <div
                    className="settings"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* <div>Settings</div> */}
                    <div onClick={logoutHandle}>Logout</div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {children}
        </div>
      )}
    </>
  );
}

export default DesktopNavigation;
