
import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import {
  Home,
  BookOpen,
  FlaskConical,
  Calculator,
  ArrowLeft,
} from "lucide-react";

// Main navigation links
const links = [
  {
    to: "/",
    label: "Home page",
    Icon: Home,
  },
  {
    to: "/protocols",
    label: "Protocol Library",
    Icon: BookOpen,
  },
  {
    to: "/sessions",
    label: "Smart Experimental Workflow",
    Icon: FlaskConical,
  },
  {
    to: "/calculator",
    label: "Scientific Calculator",
    Icon: Calculator,
  },
];

export function Layout() {
  const navigate = useNavigate();

  return (
    <div className="shell">
      {/* Sidebar navigation */}
      <aside className="sidebar">
        <NavLink to="/" className="brand">
          Bench<span>Flow</span>
        </NavLink>

        <nav aria-label="Main navigation">
          {links.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `navlink ${isActive ? "active" : ""}`
              }
            >
              <Icon size={19} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <p className="sidebar-foot">
          Offline-first · V1
        </p>
      </aside>

      {/* Main workspace */}
      <div className="workspace">
        <header className="topbar">
          <span>
            BenchFlow — Experimental Workflow Companion
          </span>

          <button
            type="button"
            className="ghost"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back
          </button>
        </header>

        <main className="main" id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
