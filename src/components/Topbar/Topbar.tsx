import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/AuthContext";
import { routes } from "@/routes/routePaths";

import { Icon } from "../common/Icon";
import { Emblem } from "../common/Emblem";

import "./Topbar.css";

const datasets = [
  "All Datasets",
  "Persons",
  "Cases",
  "FIR Narratives",
  "Phones",
  "CDR",
  "Vehicles",
  "Locations",
  "Location Events",
  "Bank Accounts",
  "Transactions",
  "Case Entities",
  "Evidence",
];

export interface TopbarProps {
  onMenu?: () => void;
}

export function Topbar({ onMenu = () => {} }: TopbarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [dataset, setDataset] = useState("All Datasets");
  const [open, setOpen] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [currentTime, setCurrentTime] = useState(() => new Date());

  const barRef = useRef<HTMLElement>(null);

  const handleLogout = () => {
    setOpen(null);
    logout();
    navigate(routes.login);
  };

  /*
   * Close dropdowns when clicking outside the topbar.
   */
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!barRef.current?.contains(event.target as Node)) {
        setOpen(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  /*
   * Global clock.
   */
  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  /*
   * Global search submission.
   *
   * This currently only provides shell-level interaction.
   * Actual intelligence search will be connected through
   * the search feature/service layer later.
   */
  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return;
    }

    setSubmitted(true);

    window.setTimeout(() => {
      setSubmitted(false);
    }, 1800);
  };

  const toggleDropdown = (name: string) => {
    setOpen((current) => (current === name ? null : name));
  };

  const handleDatasetSelect = (value: string) => {
    setDataset(value);
    setOpen(null);
  };

  const dateLabel = new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(currentTime)
    .toUpperCase();

  const timeLabel = new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(currentTime);

  return (
    <header className="topbar" ref={barRef}>
      {/* ────────────────────────────────────────────────────────
          Mobile menu
          ──────────────────────────────────────────────────────── */}

      <button
        type="button"
        className="icon-button menu-button"
        onClick={onMenu}
        aria-label="Open navigation"
        title="Open navigation"
      >
        <Icon name="menu" />
      </button>

      {/* ────────────────────────────────────────────────────────
          Brand
          ──────────────────────────────────────────────────────── */}

      <div className="topbar-brand">
        <Emblem />

        <div className="brand-copy">
          <div>
            <strong>SANDHAAN</strong>

            <span>Criminal Network Intelligence Platform</span>
          </div>

          <p>Connect Facts. Reveal Networks. Enable Safer Bharat.</p>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────
          Universal intelligence search
          ──────────────────────────────────────────────────────── */}

      <form
        className="global-search"
        onSubmit={handleSearchSubmit}
        role="search"
      >
        <Icon name="search" size={17} />

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Search intelligence"
          placeholder="Search person, phone, vehicle, account, case ID..."
          autoComplete="off"
        />

        <span className="keycap" aria-hidden="true">
          ⌘ K
        </span>

        <button type="submit" className="search-button">
          {submitted ? "Queued" : "Search"}
        </button>
      </form>

      {/* ────────────────────────────────────────────────────────
          Dataset scope
          ──────────────────────────────────────────────────────── */}

      <div className="dropdown dataset-filter">
        <button
          type="button"
          className="dropdown-trigger"
          onClick={() => toggleDropdown("dataset")}
          aria-expanded={open === "dataset"}
          aria-haspopup="menu"
        >
          <span>{dataset}</span>

          <Icon name="chevron" size={14} />
        </button>

        {open === "dataset" && (
          <div className="dropdown-menu dataset-menu" role="menu">
            {datasets.map((item) => (
              <button
                type="button"
                role="menuitem"
                className={item === dataset ? "selected" : ""}
                onClick={() => handleDatasetSelect(item)}
                key={item}
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ────────────────────────────────────────────────────────
          Network status
          ──────────────────────────────────────────────────────── */}

      <div className="security-status">
        <Icon name="shield" size={18} />

        <div>
          <span>NETWORK STATUS</span>
          <strong>Secure Government Network</strong>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────
          Date / time
          ──────────────────────────────────────────────────────── */}

      <div className="date-time" aria-label="Current date and time">
        <span>{dateLabel}</span>
        <strong>{timeLabel}</strong>
      </div>

      {/* ────────────────────────────────────────────────────────
          Alerts / messages
          ──────────────────────────────────────────────────────── */}

      <div className="topbar-actions">
        <div className="dropdown">
          <button
            type="button"
            className="header-action"
            onClick={() => toggleDropdown("alerts")}
            aria-expanded={open === "alerts"}
            aria-haspopup="menu"
          >
            <span className="action-icon">
              <Icon name="bell" />

              <b>12</b>
            </span>

            <span>Alerts</span>
          </button>

          {open === "alerts" && (
            <div
              className="dropdown-menu notification-menu"
              role="menu"
            >
              <div className="menu-title">
                <span>Priority alerts</span>
                <span>12 OPEN</span>
              </div>

              <button type="button">
                <b>Case C019 activity spike</b>
                <small>6 minutes ago</small>
              </button>

              <button type="button">
                <b>New entity link requires review</b>
                <small>21 minutes ago</small>
              </button>

              <button type="button" className="view-action">
                <span>View all alerts</span>
                <Icon name="arrow" size={14} />
              </button>
            </div>
          )}
        </div>

        <button type="button" className="header-action">
          <Icon name="mail" />
          <span>Messages</span>
        </button>
      </div>

      {/* ────────────────────────────────────────────────────────
          Investigator profile
          ──────────────────────────────────────────────────────── */}

      <div className="dropdown profile-wrap">
        <button
          type="button"
          className="profile"
          onClick={() => toggleDropdown("profile")}
          aria-expanded={open === "profile"}
          aria-haspopup="menu"
        >
          <span className="avatar">
            {user?.displayName
              ? user.displayName
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
              : "IN"}
          </span>

          <span className="profile-copy">
            <strong>{user?.displayName || "Investigator"}</strong>
            <small>{user?.userId || "Level 3 Access"}</small>
          </span>

          <Icon name="chevron" size={14} />
        </button>

        {open === "profile" && (
          <div className="dropdown-menu profile-menu" role="menu">
            <div>
              <strong>{user?.displayName || "Investigator"}</strong>
              <small>{user?.userId || "INV-2026-081"} · {user?.role || "Active Officer"}</small>
            </div>

            {((user?.role || '').toUpperCase() === 'CYBER_CELL_ADMIN' ||
              (user?.role || '').toUpperCase() === 'ADMINISTRATOR') && (
              <button
                type="button"
                onClick={() => {
                  setOpen(null);
                  navigate(routes.admin.accessRequests);
                }}
                style={{ color: '#38bdf8', fontWeight: 600 }}
              >
                🛡 Cyber Cell Verification Center →
              </button>
            )}

            <button type="button" onClick={() => setOpen(null)}>Account Settings</button>
            <button type="button" onClick={() => setOpen(null)}>Security Clearance</button>
            <button
              type="button"
              id="topbar-logout-btn"
              onClick={handleLogout}
              style={{ color: "var(--color-danger, #ff6470)" }}
            >
              Lock Workspace / Sign Out →
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Topbar;
