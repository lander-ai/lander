import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { render } from "solid-js/web";
import { App } from "./app.component";
import "./index.css";
import "./polyfills";

dayjs.extend(utc);
dayjs.extend(timezone);

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got mispelled?"
  );
}

render(() => <App />, root as HTMLElement);
