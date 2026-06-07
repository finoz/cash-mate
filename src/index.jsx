import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import Numeri from "./Numeri";

const Page = window.location.pathname === "/numeri" ? Numeri : App;

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Page />
  </React.StrictMode>
);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js");
}
