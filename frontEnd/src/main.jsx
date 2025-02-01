import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom"; // Add Router here
import App from "./App";

ReactDOM.render(
  <Router>  {/* Router should be here */}
    <App />
  </Router>,
  document.getElementById("root")
);
