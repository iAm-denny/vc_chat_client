import { gql } from "@apollo/client";

const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      message
    }
  }
`;

const CHECK_OTP = gql`
  mutation CheckOtp($input: CheckOtpInput!) {
    checkOtp(input: $input) {
      message
      token
    }
  }
`;

const LOGIN_MUTATION = gql`
  mutation Login($input: Login!) {
    login(input: $input) {
      message
      token
    }
  }
`;

const REQUEST_FRIEND = gql`
  mutation RequestFriend($requestFriendInput2: RequestFriend!) {
    requestFriend(input: $requestFriendInput2) {
      message
    }
  }
`;

const FETCH_USER_DETAIL = gql`
  query User {
    user {
      ... on User {
        email
        username
        profile_img
        tagline
        status
        id
      }
      ... on responsesMessage {
        message
        token
      }
    }
  }
`;

const GET_NOTIS = gql`
  query Getnotis {
    getnotis {
      id
      createdAt
      read
      receiver_id
      username
      profile_img
      user_id
    }
  }
`;

const RESPONSE_FRIEND = gql`
  mutation ResponseFriend($input: ResFriend!) {
    responseFriend(input: $input) {
      message
    }
  }
`;

const FETCH_FRIENDS_LIST = gql`
  query Query {
    FriendList {
      message
      users {
        email
        username
        profile_img
        id
        room_id
      }
    }
  }
`;

const UPDATE_NOTI = gql`
  mutation UpdateNoti {
    updateNoti {
      message
    }
  }
`;

export {
  CREATE_USER,
  CHECK_OTP,
  LOGIN_MUTATION,
  FETCH_USER_DETAIL,
  REQUEST_FRIEND,
  GET_NOTIS,
  RESPONSE_FRIEND,
  FETCH_FRIENDS_LIST,
  UPDATE_NOTI,
};
