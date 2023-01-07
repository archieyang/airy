/** @jsxRuntime classic */
/** @jsx Airy.createElement */

import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { Airy } from "./Airy";

const element = (
  <div id="container">
    <div>First line</div>
    <div>
      <a href="https://codethink.me">A Link</a>
      <b />
    </div>
    <div>Last line</div>
  </div>
);

Airy.render(element, document.getElementById("root"));
// console.log(`${JSON.stringify(element)}`);
// const root = ReactDOM.createRoot();
// root.render(element);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
