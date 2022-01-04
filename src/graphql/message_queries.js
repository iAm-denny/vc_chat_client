import { gql } from "@apollo/client";

const SEND_MESSAGE = gql`
  mutation Mutation($input: SendMessage) {
    sendMessage(input: $input) {
      message
    }
  }
`;

const FETCH_MESSAGE = gql`
  query Query($input: InputMessage) {
    getMessages(input: $input) {
      message
      messages {
        receiver_id
        sender_id
        message
        createdAt
      }
    }
  }
`;

export { SEND_MESSAGE, FETCH_MESSAGE };
