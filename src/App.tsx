
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
} from "react-router-dom";

import { Layout } from "./components/Layout";

import {
  ProtocolLibrary,
  ProtocolDetail,
  NewProtocol,
} from "./features/protocols/ProtocolPages";

import {
  SessionsPage,
  SessionDetail,
} from "./features/sessions/SessionPages";

import { CalculatorPage } from "./features/calculator/CalculatorPage";

// --------------------------------------------------
// HOME PAGE
// --------------------------------------------------

function Home() {
  return (
    <div className="home">
      <div className="home-icon">BF</div>

      <h1>Welcome to BenchFlow!</h1>

      <p>Your experiments start here.</p>

      <p className="muted">
        A focused companion for step-by-step experimental workflows.
      </p>

      <Link className="btn primary" to="/protocols">
        Explore Protocol Library →
      </Link>

      <p className="hint">
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
              <div className="panel">
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
