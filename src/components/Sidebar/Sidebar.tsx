import { Icon } from "../common/Icon";
import { Emblem } from "../common/Emblem";

import { navGroups } from "./navConfig";

import "./Sidebar.css";

export interface SidebarProps {
  open?: boolean;
  active?: string;
  onSelect?: (item: string) => void;
  onClose?: () => void;
}

export function Sidebar({
  open = false,
  active = "",
  onSelect = () => {},
  onClose = () => {},
}: SidebarProps) {
  const handleNavigation = (
    itemName: string,
    disabled?: boolean,
  ) => {
    if (disabled) {
      return;
    }

    onSelect(itemName);
  };

  return (
    <>
      {/* ────────────────────────────────────────────────────────
          Mobile backdrop
          ──────────────────────────────────────────────────────── */}

      <button
        type="button"
        className={`sidebar-scrim ${open ? "is-visible" : ""}`}
        aria-label="Close navigation"
        aria-hidden={!open}
        tabIndex={open ? 0 : -1}
        onClick={onClose}
      />

      {/* ────────────────────────────────────────────────────────
          Sidebar
          ──────────────────────────────────────────────────────── */}

      <aside
        className={`sidebar ${open ? "is-open" : ""}`}
        aria-label="SANDHAAN navigation"
      >
        {/* ──────────────────────────────────────────────────────
            Brand
            ────────────────────────────────────────────────────── */}

        <div className="sidebar-brand">
          <Emblem compact />

          <div className="sidebar-brand-text">
            <strong>SANDHAAN</strong>
            <span>INTELLIGENCE PLATFORM</span>
          </div>

          <button
            type="button"
            className="icon-button sidebar-close"
            onClick={onClose}
            aria-label="Close navigation"
            title="Close navigation"
          >
            <Icon name="close" />
          </button>
        </div>

        {/* ──────────────────────────────────────────────────────
            Primary navigation
            ────────────────────────────────────────────────────── */}

        <nav
          className="sidebar-nav"
          aria-label="Primary navigation"
        >
          {navGroups.map((group) => (
            <div
              className="nav-group"
              key={group.label}
            >
              <span className="nav-label">
                {group.label}
              </span>

              <div className="nav-group-items">
                {group.items.map((item) => {
                  const isActive =
                    active === item.name;

                  const isDisabled =
                    item.disabled === true;

                  return (
                    <button
                      key={item.name}
                      type="button"
                      className={[
                        "nav-item",
                        isActive ? "is-active" : "",
                        isDisabled ? "is-disabled" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      aria-current={
                        isActive ? "page" : undefined
                      }
                      aria-disabled={
                        isDisabled ? true : undefined
                      }
                      disabled={isDisabled}
                      title={
                        isDisabled
                          ? `${item.name} is not available yet`
                          : item.name
                      }
                      onClick={() =>
                        handleNavigation(
                          item.name,
                          item.disabled,
                        )
                      }
                    >
                      <Icon
                        name={item.icon}
                        size={17}
                      />

                      <span>{item.name}</span>

                      {isDisabled && (
                        <span className="nav-coming-soon">
                          SOON
                        </span>
                      )}

                      {isActive && !isDisabled && (
                        <i
                          className="nav-status"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* ──────────────────────────────────────────────────────
            Operational system status
            ────────────────────────────────────────────────────── */}

        <div className="sidebar-status">
          <div className="sidebar-status-indicator">
            <span aria-hidden="true" />
          </div>

          <div className="sidebar-status-copy">
            <span>SYSTEM STATUS</span>

            <strong>OPERATIONAL</strong>

            <small>
              Intelligence services available
            </small>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;