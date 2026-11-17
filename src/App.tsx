import {
  BrowserRouter,
  Routes,
  Route,
  Link,
} from "react-router-dom";

import { Layout } from "./components/Layout";

import logo from "./assets/benchflow-logo.png";

import { ProtocolLibrary } from "./features/protocols/ProtocolLibrary";
import { ProtocolDetail } from "./features/protocols/ProtocolDetail";
import { NewProtocol } from "./features/protocols/NewProtocol";

import {
  SessionsPage,
  SessionDetail,
} from "./features/sessions/SessionPages";

import { CalculatorPage } from "./features/calculator/CalculatorPage";

import {
  btn,
  hintText,
  mutedText,
  panel,
} from "./components/ui";

// --------------------------------------------------
// HOME PAGE
// --------------------------------------------------

function Home() {
  return (
    <div className="flex min-h-[65vh] flex-col items-center justify-center text-center">
      <img
        className="mb-4 h-auto w-[320px] max-w-full"
        src={logo}
        width={720}
        height={621}
        alt="BenchFlow — Experimental Workflow Companion"
      />

      <h1 className="text-[2.7rem] phone:text-[2rem]">Welcome to BenchFlow!</h1>

      <p>Your experiments start here.</p>

      <p className={`${mutedText} max-w-[450px]`}>
        A focused companion for step-by-step experimental workflows.
      </p>

      <Link className={btn("primary", "my-5")} to="/protocols">
        Explore Protocol Library →
      </Link>

      <p className={hintText}>
        Local-first · No account required · Demonstration protocols
      </p>
    </div>
  );
}

// --------------------------------------------------
// APPLICATION ROUTES
// --------------------------------------------------

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {/* Home page */}
          <Route index element={<Home />} />

          {/* Protocol Library */}
          <Route
            path="protocols"
            element={<ProtocolLibrary />}
          />

          {/* Create a new protocol */}
          <Route
            path="protocols/new"
            element={<NewProtocol />}
          />

          {/* Protocol details */}
          <Route
            path="protocols/:id"
            element={<ProtocolDetail />}
          />

          {/* Experimental sessions */}
          <Route
            path="sessions"
            element={<SessionsPage />}
          />

          {/* Session details and workflow */}
          <Route
            path="sessions/:id"
            element={<SessionDetail />}
          />

          {/* Scientific Calculator */}
          <Route
            path="calculator"
            element={<CalculatorPage />}
          />

          {/* Page not found */}
          <Route
            path="*"
            element={
              <div className={panel}>
                <h1>Page not found</h1>
                <Link to="/">Go home</Link>
              </div>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
