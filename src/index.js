import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import ContextIndex from "./context";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";

const client = new ApolloClient({
  cache: new InMemoryCache(),
  uri: "http://localhost:4000/graphql",
  onError: (e) => {
    console.log("[ ERROR ]", e);
  },
});

ReactDOM.render(
  <BrowserRouter>
    <ApolloProvider client={client}>
      <ContextIndex>
        <App />
      </ContextIndex>
    </ApolloProvider>
  </BrowserRouter>,
  document.getElementById("root")
);
