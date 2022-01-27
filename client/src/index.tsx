import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import CssBaseline from "@material-ui/core/CssBaseline";
import App from "./components/BerbixVerifyFlow";
import APIOnlyApp from "./components/BerbixAPIOnly";
import Home from "./components/Home";

ReactDOM.render(
  <React.StrictMode>
    <Router>
    <CssBaseline />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/BerbixVerify" element={<App />} />
      <Route path="/BerbixAPIOnly" element={<APIOnlyApp />} />
    </Routes>
    </Router>
  </React.StrictMode>,
  document.getElementById("root")
);
