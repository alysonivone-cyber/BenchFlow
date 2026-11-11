
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

import { cx } from "./ui";

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
    <div className="flex min-h-screen phone:block">
      {/* Sidebar navigation */}
      <aside className="flex w-[280px] flex-none flex-col gap-9 border-r border-line-side bg-white px-5 py-[30px] tablet:w-[225px] tablet:px-3 tablet:py-5 phone:w-full phone:gap-[10px] phone:border-r-0 phone:border-b phone:px-3 phone:py-3">
        <NavLink
          to="/"
          className="px-3 py-[6px] text-[2rem] font-[850] tracking-[-.06em] text-brand-navy phone:text-[1.4rem]"
        >
          Bench<span className="text-brand-sky">Flow</span>
        </NavLink>

        <nav
          aria-label="Main navigation"
          className="grid gap-3 phone:flex phone:gap-[7px] phone:overflow-x-auto"
        >
          {links.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                cx(
                  "flex items-center gap-3 rounded-[10px] border px-[13px] py-[15px] text-[.88rem] font-semibold transition duration-150 hover:border-nav-active-line hover:bg-nav-active hover:text-nav-active-ink phone:flex-none phone:px-[10px] phone:py-[10px] phone:text-[.74rem]",
                  isActive
                    ? "border-nav-active-line bg-nav-active text-nav-active-ink"
                    : "border-nav-line"
                )
              }
            >
              <Icon size={19} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <p className="mt-auto pl-3 text-[.8rem] text-foot phone:hidden">
          Offline-first · V1
        </p>
      </aside>

      {/* Main workspace */}
      <div className="min-w-0 flex-1">
        <header className="flex h-[65px] items-center justify-between border-b border-line-top bg-white px-[34px] text-[.84rem] text-topbar-ink phone:h-[46px] phone:justify-end phone:px-3">
          <span className="phone:hidden">
            BenchFlow — Experimental Workflow Companion
          </span>

          <button
            type="button"
            className="flex items-center gap-2 rounded-[9px] bg-ghost px-[14px] py-[10px] text-ghost-ink"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back
          </button>
        </header>

        <main
          className="mx-auto max-w-[1150px] px-9 pt-[45px] pb-20 tablet:px-5 tablet:pt-8 tablet:pb-8 phone:px-[14px] phone:pt-[22px] phone:pb-[60px]"
          id="main-content"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
