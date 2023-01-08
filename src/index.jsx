/** @jsxRuntime classic */
/** @jsx Airy.createElement */

import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { Airy } from "./Airy";

function App() {
  const [count, setCount] = Airy.useState(0);
  return (
    <div id="container">
      <div
        onClick={() => {
          setCount((c) => c + 1);
        }}
      >
        First line
      </div>
      <div>
        <a href="https://codethink.me">A Link with ${count}</a>
        <b />
      </div>
      <div>Last line</div>
    </div>
  );
}

const element = <App />;
Airy.render(element, document.getElementById("root"));
reportWebVitals();
