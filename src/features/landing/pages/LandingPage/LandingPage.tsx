import { FC, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/AuthContext";
import { routes } from "@/routes/routePaths";
import "./LandingPage.css";

interface SearchableItem {
  id: string;
  category: string;
  title: string;
  snippet: string;
  targetAnchor: string;
}

const SEARCH_DATABASE: SearchableItem[] = [
  {
    id: "s1",
    category: "Investigation Scenario",
    title: "SYN-09: Interstate Hawala & Money Laundering Syndicate",
    snippet: "₹145 Cr layered fund trail across 8 shell corporations and 27 current accounts.",
    targetAnchor: "#scenarios",
  },
  {
    id: "s2",
    category: "Investigation Scenario",
    title: "CYB-41: Multi-State Cyber Fraud & SIM Nexus",
    snippet: "380 burner SIM cards and 4,200 mule bank accounts geofenced across 3 states.",
    targetAnchor: "#scenarios",
  },
  {
    id: "s3",
    category: "Investigation Scenario",
    title: "NAR-18: Cross-Border Narcotics Supply Corridor",
    snippet: "Spatio-temporal correlation of synchronized CDR hops and FASTag checkpoint records.",
    targetAnchor: "#scenarios",
  },
  {
    id: "s4",
    category: "Core Module",
    title: "Multi-Hop Network Link Analysis",
    snippet: "Force-directed graph engine decomposing kingpins, proxy fronts, and covert intermediaries.",
    targetAnchor: "#capabilities",
  },
  {
    id: "s5",
    category: "Core Module",
    title: "Spatio-Temporal Mapping & Cell Tower Geofences",
    snippet: "Synchronized CDR pings, movement vectors, and safehouse cluster heatmaps.",
    targetAnchor: "#capabilities",
  },
  {
    id: "s6",
    category: "Core Module",
    title: "Forensic Evidence Vault & Custody Chain",
    snippet: "Immutable cryptographic ledger compliant with Indian Evidence Act Section 65B.",
    targetAnchor: "#capabilities",
  },
  {
    id: "s7",
    category: "Compliance & Security",
    title: "Indian Evidence Act Section 65B Certification",
    snippet: "Automated cryptographic certificate generation with tamper-evident digital docket hash.",
    targetAnchor: "#compliance",
  },
  {
    id: "s8",
    category: "Compliance & Security",
    title: "Level 1 to 5 Role-Based Clearance Matrix",
    snippet: "Strict hierarchical authorization protocol from Field Officer to National Oversight.",
    targetAnchor: "#compliance",
  },
  {
    id: "s9",
    category: "Workflow Engine",
    title: "Automated Entity Resolution & Deduplication",
    snippet: "Soundex, Levenshtein, and phonetic algorithms mapping aliases to Master Entity Dossiers.",
    targetAnchor: "#workflow",
  },
];

export const LandingPage: FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Search Modal State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Interactive Workstation Preview State
  const [activeTab, setActiveTab] = useState<"network" | "spatial" | "hawala" | "findings">("network");
  const [selectedNode, setSelectedNode] = useState<{
    id: string;
    label: string;
    role: string;
    risk: string;
    firs: string;
    phone: string;
    location: string;
  }>({
    id: "NODE-KP-01",
    label: "Farhan Qureshi (Alias 'Sultan')",
    role: "Syndicate Kingpin // Level 1 Target",
    risk: "CRITICAL (96/100)",
    firs: "FIR 412/2025, FIR 088/2026",
    phone: "+91 98112-98441 [IMEI: 864291048291]",
    location: "South Mumbai / Surat Transit",
  });

  // Global Keyboard Shortcut: ⌘K or Ctrl+K to open Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handlePrimaryAction = () => {
    if (isAuthenticated) {
      navigate(routes.dashboard);
    } else {
      navigate(routes.login);
    }
  };

  const filteredSearchResults = SEARCH_DATABASE.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.snippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="landing-viewport">
      <div className="landing-grid-overlay" aria-hidden="true" />

      {/* ============================================================
          Subtle Dossier Header / Navbar
          ============================================================ */}
      <header className="landing-topbar">
        <Link to="/" className="landing-brand">
          <span className="landing-brand-crest">SD</span>
          <div className="landing-brand-text">
            <span className="landing-brand-name">SANDHAAN</span>
            <span className="landing-brand-tag">
              National Crime Intelligence Grid // v2.4
            </span>
          </div>
        </Link>

        {/* Minimal Anchor Navigation */}
        <nav aria-label="Main Navigation">
          <ul className="landing-nav-links">
            <li className="nav-anchor-item">
              <a href="#overview">
                <span className="nav-anchor-prefix">//</span>Overview
              </a>
            </li>
            <li className="nav-anchor-item">
              <a href="#workflow">
                <span className="nav-anchor-prefix">//</span>Workflow
              </a>
            </li>
            <li className="nav-anchor-item">
              <a href="#preview">
                <span className="nav-anchor-prefix">//</span>Intel Preview
              </a>
            </li>
            <li className="nav-anchor-item">
              <a href="#scenarios">
                <span className="nav-anchor-prefix">//</span>Scenarios
              </a>
            </li>
            <li className="nav-anchor-item">
              <a href="#capabilities">
                <span className="nav-anchor-prefix">//</span>Capabilities
              </a>
            </li>
            <li className="nav-anchor-item">
              <a href="#compliance">
                <span className="nav-anchor-prefix">//</span>Sec 65B &amp; Security
              </a>
            </li>
            <li className="nav-anchor-item">
              <a href="#specs">
                <span className="nav-anchor-prefix">//</span>Specs
              </a>
            </li>
          </ul>
        </nav>

        {/* Right Controls */}
        <div className="landing-nav-actions">
          <button
            type="button"
            className="quick-search-trigger"
            onClick={() => setIsSearchOpen(true)}
            title="Search dossiers, capabilities and scenarios (Ctrl+K)"
          >
            <span>Quick Look</span>
            <kbd className="search-shortcut-kbd">⌘K</kbd>
          </button>

          <div className="landing-status-badge">
            <span className="status-dot" />
            <span>NEONDB LIVE FEED</span>
          </div>

          <div>
            {isAuthenticated ? (
              <Link to={routes.dashboard} className="landing-login-nav-btn">
                ACTIVE WORKSPACE ({user?.userId}) →
              </Link>
            ) : (
              <Link to={routes.login} className="landing-login-nav-btn">
                INVESTIGATOR ACCESS →
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ============================================================
          Quick Look Search Modal
          ============================================================ */}
      {isSearchOpen && (
        <div
          className="search-modal-backdrop"
          onClick={() => setIsSearchOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="search-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header">
              <span style={{ color: "var(--color-primary)" }}>🔍</span>
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dossiers, modules, legal acts, or syndicate scenarios..."
                className="search-modal-input"
              />
              <button
                type="button"
                className="search-close-btn"
                onClick={() => setIsSearchOpen(false)}
              >
                [ESC]
              </button>
            </div>

            <div className="search-results-list">
              {filteredSearchResults.length === 0 ? (
                <div style={{ padding: "20px", color: "var(--color-text-muted)", fontSize: "12px", textAlign: "center" }}>
                  No matching intelligence dossiers found. Try searching for "Hawala", "Graph", or "65B".
                </div>
              ) : (
                filteredSearchResults.map((item) => (
                  <a
                    key={item.id}
                    href={item.targetAnchor}
                    className="search-result-item"
                    onClick={() => setIsSearchOpen(false)}
                  >
                    <span className="result-item-badge">{item.category}</span>
                    <span className="result-item-title">{item.title}</span>
                    <span className="result-item-snippet">{item.snippet}</span>
                  </a>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          Main Content Container
          ============================================================ */}
      <main className="landing-content">
        {/* ============================================================
            HERO SECTION (#overview)
            ============================================================ */}
        <section id="overview" className="landing-hero" aria-labelledby="hero-title">
          <div className="hero-clearance-pill">
            <span>● RESTRICTED PROTOCOL // LAW ENFORCEMENT &amp; INTELLIGENCE AGENCIES</span>
            <span>|</span>
            <span>LEVEL 1–5 CLEARANCE MATRIX</span>
          </div>

          <h1 id="hero-title" className="hero-main-title">
            SANDHAAN
          </h1>

          <div className="hero-subtitle">
            Criminal Network Intelligence &amp; Investigation Platform
          </div>

          <div className="hero-motto">
            Connecting the Threads. Revealing the Network.
          </div>

          <p className="hero-description">
            A specialized national intelligence workstation engineered for Indian state police
            departments, central investigative bureaus, and enforcement agencies. Correlates
            unstructured FIR narratives, CDR cell hops, hawala financial layering, and biometric
            aliases into court-admissible syndicate dossiers in sub-second velocity.
          </p>

          <div className="hero-cta-group">
            <button
              type="button"
              id="experience-sandhaan-btn"
              className="btn-primary-experience"
              onClick={handlePrimaryAction}
            >
              {isAuthenticated ? "ENTER INVESTIGATION WORKSPACE →" : "EXPERIENCE SANDHAAN →"}
            </button>

            <a href="#preview" className="btn-secondary-overview">
              INTERACTIVE INTEL PREVIEW ↓
            </a>
          </div>
        </section>

        {/* Live Operational Metrics Telemetry */}
        <section className="landing-telemetry" aria-label="System Metrics">
          <div className="telemetry-item highlight-node">
            <span className="telemetry-value">10,000+</span>
            <span className="telemetry-label">Active Police FIR Dockets</span>
          </div>
          <div className="telemetry-item">
            <span className="telemetry-value">50,000+</span>
            <span className="telemetry-label">Correlated Entities &amp; Nodes</span>
          </div>
          <div className="telemetry-item">
            <span className="telemetry-value">&lt; 120ms</span>
            <span className="telemetry-label">NeonDB Graph Traversal Latency</span>
          </div>
          <div className="telemetry-item">
            <span className="telemetry-value">SEC 65B</span>
            <span className="telemetry-label">Cryptographic Evidence Hash</span>
          </div>
        </section>

        {/* ============================================================
            OPERATIONAL WORKFLOW (#workflow)
            ============================================================ */}
        <section id="workflow" className="landing-section">
          <div className="section-dossier-header">
            <div>
              <span className="section-tag-prefix">// ARCHITECTURE &amp; METHODOLOGY</span>
              <h2 className="section-main-title">End-to-End Investigation Pipeline</h2>
            </div>
            <span className="section-header-meta">FROM HETEROGENEOUS INGESTION TO JUDICIAL EVIDENCE</span>
          </div>

          <div className="workflow-pipeline-grid">
            <div className="workflow-step-card">
              <div className="step-card-header">
                <span className="step-number-tag">PHASE 01</span>
                <span className="step-stage-label">Multi-Source Ingestion</span>
              </div>
              <h3 className="step-card-title">Heterogeneous Data Ingestion</h3>
              <p className="step-card-desc">
                Ingests structured and unstructured data: First Information Reports (FIRs),
                Call Detail Records (CDR), bank statements, vehicle RTO registries, and seized digital media.
              </p>
              <div className="step-tags-list">
                <span className="step-tag">CCTNS Sync</span>
                <span className="step-tag">Telecom CDRs</span>
                <span className="step-tag">Bank Formats</span>
              </div>
            </div>

            <div className="workflow-step-card">
              <div className="step-card-header">
                <span className="step-number-tag">PHASE 02</span>
                <span className="step-stage-label">Resolution &amp; NLP</span>
              </div>
              <h3 className="step-card-title">Entity Resolution Engine</h3>
              <p className="step-card-desc">
                Executes probabilistic fuzzy cross-matching, phonetic Indian name normalization
                (Soundex/Metaphone), and phone/IMEI clustering to merge aliases into a single Master Subject.
              </p>
              <div className="step-tags-list">
                <span className="step-tag">Alias Disambiguation</span>
                <span className="step-tag">IMEI Grouping</span>
                <span className="step-tag">Fuzzy Match</span>
              </div>
            </div>

            <div className="workflow-step-card">
              <div className="step-card-header">
                <span className="step-number-tag">PHASE 03</span>
                <span className="step-stage-label">Graph Traversal</span>
              </div>
              <h3 className="step-card-title">Multi-Hop Link Analysis</h3>
              <p className="step-card-desc">
                Unrolls multi-tier syndicate relationships up to 6 degrees of separation. Uncovers
                hidden kingpins, cash couriers, shell corporation directors, and frequent burner SIM swaps.
              </p>
              <div className="step-tags-list">
                <span className="step-tag">Force-Directed Graph</span>
                <span className="step-tag">Hawala Layering</span>
                <span className="step-tag">Anomaly Flags</span>
              </div>
            </div>

            <div className="workflow-step-card">
              <div className="step-card-header">
                <span className="step-number-tag">PHASE 04</span>
                <span className="step-stage-label">Judicial Filing</span>
              </div>
              <h3 className="step-card-title">Court-Ready Evidence Vault</h3>
              <p className="step-card-desc">
                Compiles court-admissible dossiers certified under Section 65B of the Indian Evidence Act.
                Generates SHA-256 cryptographic chain-of-custody seals for formal charge-sheets.
              </p>
              <div className="step-tags-list">
                <span className="step-tag">Section 65B Certificate</span>
                <span className="step-tag">SHA-256 Stamp</span>
                <span className="step-tag">Charge-Sheet Dossier</span>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            INTERACTIVE INTELLIGENCE WORKSTATION PREVIEW (#preview)
            ============================================================ */}
        <section id="preview" className="landing-section">
          <div className="section-dossier-header">
            <div>
              <span className="section-tag-prefix">// LIVE WORKSTATION SIMULATION</span>
              <h2 className="section-main-title">Interactive Intelligence Preview</h2>
            </div>
            <span className="section-header-meta">CLICK TABS TO INTERACT WITH SYNTHETIC DOSSIER DATA</span>
          </div>

          <div className="intel-terminal-wrapper">
            {/* Terminal Window Header */}
            <div className="terminal-control-bar">
              <div className="terminal-title-block">
                <div className="terminal-lights">
                  <span className="light-dot red" />
                  <span className="light-dot yellow" />
                  <span className="light-dot green" />
                </div>
                <span className="terminal-heading">
                  SANDHAAN WORKSTATION // DOCKET #MH-CR-2026-9041 [CONFIDENTIAL]
                </span>
              </div>

              {/* Tab Switcher */}
              <div className="terminal-tab-buttons" role="tablist">
                <button
                  type="button"
                  className={`term-tab-btn ${activeTab === "network" ? "active" : ""}`}
                  onClick={() => setActiveTab("network")}
                  role="tab"
                  aria-selected={activeTab === "network"}
                >
                  [ 01. Network Graph ]
                </button>
                <button
                  type="button"
                  className={`term-tab-btn ${activeTab === "spatial" ? "active" : ""}`}
                  onClick={() => setActiveTab("spatial")}
                  role="tab"
                  aria-selected={activeTab === "spatial"}
                >
                  [ 02. Spatio-Temporal CDR ]
                </button>
                <button
                  type="button"
                  className={`term-tab-btn ${activeTab === "hawala" ? "active" : ""}`}
                  onClick={() => setActiveTab("hawala")}
                  role="tab"
                  aria-selected={activeTab === "hawala"}
                >
                  [ 03. Hawala Money Flow ]
                </button>
                <button
                  type="button"
                  className={`term-tab-btn ${activeTab === "findings" ? "active" : ""}`}
                  onClick={() => setActiveTab("findings")}
                  role="tab"
                  aria-selected={activeTab === "findings"}
                >
                  [ 04. Automated Findings ]
                </button>
              </div>
            </div>

            {/* Terminal Screen Body */}
            <div className="terminal-screen-body">
              {activeTab === "network" && (
                <div className="term-view-layout">
                  <div className="term-visual-canvas">
                    <span className="canvas-watermark">SANDHAAN GRAPH ENGINE // 4 NODES LINKED</span>
                    <div className="graph-mock-container">
                      <div className="graph-mock-level">
                        <div
                          className={`mock-node-card kingpin ${selectedNode.id === "NODE-KP-01" ? "selected" : ""}`}
                          onClick={() =>
                            setSelectedNode({
                              id: "NODE-KP-01",
                              label: "Farhan Qureshi (Alias 'Sultan')",
                              role: "Syndicate Kingpin // Level 1 Target",
                              risk: "CRITICAL (96/100)",
                              firs: "FIR 412/2025, FIR 088/2026",
                              phone: "+91 98112-98441 [IMEI: 864291048291]",
                              location: "South Mumbai / Surat Transit",
                            })
                          }
                        >
                          <span className="mock-node-type">👑 PRIMARY TARGET</span>
                          <span className="mock-node-name">Farhan Qureshi ('Sultan')</span>
                          <span className="mock-node-meta">Risk: 96/100 · 8 Linked FIRs</span>
                        </div>
                      </div>

                      <div style={{ color: "var(--color-primary)", fontSize: "14px", fontFamily: "var(--font-data)" }}>
                        │&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│
                        <br />
                        ├── [Layered Wire Transfer] ──┤
                      </div>

                      <div className="graph-mock-level">
                        <div
                          className={`mock-node-card ${selectedNode.id === "NODE-CO-02" ? "selected" : ""}`}
                          onClick={() =>
                            setSelectedNode({
                              id: "NODE-CO-02",
                              label: "Apex Global Impex Pvt Ltd",
                              role: "Shell Corporate Entity // Layering Conduit",
                              risk: "HIGH (84/100)",
                              firs: "ED Hawala ECIR 19/2025",
                              phone: "Dormant Landline: 022-2849102",
                              location: "Nariman Point, Mumbai",
                            })
                          }
                        >
                          <span className="mock-node-type">🏢 SHELL ENTITY</span>
                          <span className="mock-node-name">Apex Global Impex</span>
                          <span className="mock-node-meta">₹14.2 Cr Inflow · Zero GST</span>
                        </div>

                        <div
                          className={`mock-node-card ${selectedNode.id === "NODE-ML-03" ? "selected" : ""}`}
                          onClick={() =>
                            setSelectedNode({
                              id: "NODE-ML-03",
                              label: "Rakesh Sharma (Money Mule Coordinator)",
                              role: "Cash Courier & Courier Ring Handler",
                              risk: "HIGH (82/100)",
                              firs: "FIR 114/2026 Crime Branch",
                              phone: "+91 94220-11849 [Burner SIM]",
                              location: "Diamond Bourse, Surat",
                            })
                          }
                        >
                          <span className="mock-node-type">👤 COURIER OPERATIVE</span>
                          <span className="mock-node-name">Rakesh Sharma</span>
                          <span className="mock-node-meta">32 Encrypted Calls / Wk</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Node Inspector Pane */}
                  <div className="term-inspector-pane">
                    <span className="inspector-pane-title">Subject Intelligence Dossier</span>
                    <div className="inspector-row">
                      <span className="inspector-label">Identity / Alias</span>
                      <strong className="inspector-val">{selectedNode.label}</strong>
                    </div>
                    <div className="inspector-row">
                      <span className="inspector-label">Role Classification</span>
                      <span className="inspector-val">{selectedNode.role}</span>
                    </div>
                    <div className="inspector-row">
                      <span className="inspector-label">Threat Severity</span>
                      <span className="inspector-alert-pill">⚠ {selectedNode.risk}</span>
                    </div>
                    <div className="inspector-row">
                      <span className="inspector-label">Active Police FIRs</span>
                      <span className="inspector-val">{selectedNode.firs}</span>
                    </div>
                    <div className="inspector-row">
                      <span className="inspector-label">Intercept / Telephony</span>
                      <span className="inspector-val" style={{ fontFamily: "var(--font-data)" }}>
                        {selectedNode.phone}
                      </span>
                    </div>
                    <div className="inspector-row">
                      <span className="inspector-label">Last Sighted Geolocation</span>
                      <span className="inspector-val">{selectedNode.location}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "spatial" && (
                <div className="term-view-layout">
                  <div className="term-visual-canvas">
                    <span className="canvas-watermark">TELECOM CDR TRACKING // SPATIAL HOPS</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px", background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
                        <span style={{ color: "var(--color-primary)", fontFamily: "var(--font-data)", fontSize: "11px" }}>02:14:22 IST</span>
                        <span style={{ color: "#ffffff", fontSize: "13px" }}>Cell Tower ID #MUM-BTS-4021 (South Mumbai Docklands)</span>
                        <span style={{ marginLeft: "auto", color: "var(--color-success)", fontSize: "11px", fontFamily: "var(--font-data)" }}>[GEO-LOCK]</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px", background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
                        <span style={{ color: "var(--color-primary)", fontFamily: "var(--font-data)", fontSize: "11px" }}>05:40:10 IST</span>
                        <span style={{ color: "#ffffff", fontSize: "13px" }}>FASTag Checkpoint #GJ-NH48-B (Surat Express Corridor)</span>
                        <span style={{ marginLeft: "auto", color: "var(--color-warning)", fontSize: "11px", fontFamily: "var(--font-data)" }}>[TRANSIT 98 KM/H]</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px", background: "rgba(255, 100, 112, 0.08)", border: "1px solid var(--color-danger)" }}>
                        <span style={{ color: "var(--color-danger)", fontFamily: "var(--font-data)", fontSize: "11px" }}>09:12:05 IST</span>
                        <span style={{ color: "#ffffff", fontSize: "13px" }}>Target Safehouse Geofence Breached (Surat Bourse Industrial Area)</span>
                        <span style={{ marginLeft: "auto", color: "var(--color-danger)", fontSize: "11px", fontFamily: "var(--font-data)" }}>[ALARM ACTIVE]</span>
                      </div>
                    </div>
                  </div>

                  <div className="term-inspector-pane">
                    <span className="inspector-pane-title">Spatio-Temporal Analysis</span>
                    <div className="inspector-row">
                      <span className="inspector-label">Velocity Vector</span>
                      <span className="inspector-val">Consistent 85–100 km/h on NH-48</span>
                    </div>
                    <div className="inspector-row">
                      <span className="inspector-label">Correlated Vehicle</span>
                      <span className="inspector-val">Toyota Innova Crysta [GJ-05-XX-1920]</span>
                    </div>
                    <div className="inspector-row">
                      <span className="inspector-label">Co-Travelers Identified</span>
                      <span className="inspector-val">2 Linked Burner Handsets (+91 94220...)</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "hawala" && (
                <div className="term-view-layout">
                  <div className="term-visual-canvas">
                    <span className="canvas-watermark">FINANCIAL TRAIL // HAWALA LAYERING MAPPING</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
                      <div style={{ padding: "12px", background: "var(--color-surface)", border: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between" }}>
                        <span>Stage 1: Bulk Cash Injection (Diamond Market)</span>
                        <strong style={{ color: "var(--color-primary)" }}>₹4.50 Cr Cash</strong>
                      </div>
                      <div style={{ textAlign: "center", color: "var(--color-text-muted)" }}>↓ Layering via 12 Structured Cheques (&lt; ₹10 Lakhs each)</div>
                      <div style={{ padding: "12px", background: "var(--color-surface)", border: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between" }}>
                        <span>Stage 2: Dormant Shell Accounts (Apex Global Impex)</span>
                        <strong style={{ color: "var(--color-warning)" }}>₹4.20 Cr Clean Book Entry</strong>
                      </div>
                      <div style={{ textAlign: "center", color: "var(--color-text-muted)" }}>↓ Integration into High-Value Real Estate Fronts</div>
                      <div style={{ padding: "12px", background: "rgba(65, 201, 137, 0.08)", border: "1px solid var(--color-success)", display: "flex", justifyContent: "space-between" }}>
                        <span>Stage 3: Commercial Assets Under Benami Names</span>
                        <strong style={{ color: "var(--color-success)" }}>₹4.05 Cr Asset Seized</strong>
                      </div>
                    </div>
                  </div>

                  <div className="term-inspector-pane">
                    <span className="inspector-pane-title">Financial Forensics Summary</span>
                    <div className="inspector-row">
                      <span className="inspector-label">Total Laundering Inflow</span>
                      <span className="inspector-val" style={{ color: "var(--color-warning)", fontWeight: 700 }}>
                        ₹145.20 Crores (FY 2025–26)
                      </span>
                    </div>
                    <div className="inspector-row">
                      <span className="inspector-label">Detected Shell Accounts</span>
                      <span className="inspector-val">27 Current Accounts across 5 Private Banks</span>
                    </div>
                    <div className="inspector-row">
                      <span className="inspector-label">Enforcement Status</span>
                      <span className="inspector-alert-pill">Ready for PMLA Attachment</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "findings" && (
                <div className="term-view-layout">
                  <div className="term-visual-canvas">
                    <span className="canvas-watermark">AUTOMATED INTELLIGENCE FINDINGS FEED</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
                      <div style={{ padding: "10px 14px", background: "rgba(255, 100, 112, 0.09)", border: "1px solid var(--color-danger)" }}>
                        <span style={{ color: "var(--color-danger)", fontFamily: "var(--font-data)", fontSize: "10px" }}>CRITICAL ALERT #FIND-802</span>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff", marginTop: "2px" }}>
                          SIM Swap Execution Detected 14 Minutes Prior to Wire Transfer
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--color-text-secondary)", marginTop: "2px" }}>
                          Target +91 98112-98441 swapped IMEI at Delhi South BTS while victim bank account was drained.
                        </div>
                      </div>

                      <div style={{ padding: "10px 14px", background: "rgba(240, 173, 70, 0.09)", border: "1px solid var(--color-warning)" }}>
                        <span style={{ color: "var(--color-warning)", fontFamily: "var(--font-data)", fontSize: "10px" }}>HIGH ALERT #FIND-791</span>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff", marginTop: "2px" }}>
                          Common Director Discovered Across 4 Dissolved Companies
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--color-text-secondary)", marginTop: "2px" }}>
                          Aadhaar Hash matches suspect Farhan Qureshi under alias 'Farhan Siddiqui'.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="term-inspector-pane">
                    <span className="inspector-pane-title">Automated Rule Engine</span>
                    <div className="inspector-row">
                      <span className="inspector-label">Rules Evaluated</span>
                      <span className="inspector-val">64 Algorithmic Heuristics</span>
                    </div>
                    <div className="inspector-row">
                      <span className="inspector-label">Active Anomaly Flags</span>
                      <span className="inspector-val">12 Flags Awaiting Lead Investigator Sign-off</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ============================================================
            SYNDICATE INVESTIGATION SCENARIOS (#scenarios)
            ============================================================ */}
        <section id="scenarios" className="landing-section">
          <div className="section-dossier-header">
            <div>
              <span className="section-tag-prefix">// OPERATIONAL USE CASES</span>
              <h2 className="section-main-title">Syndicate Investigation Scenarios</h2>
            </div>
            <span className="section-header-meta">PROVEN APPLICABILITY ACROSS MAJOR ENFORCEMENT DOMAINS</span>
          </div>

          <div className="scenarios-grid">
            {/* Scenario 1 */}
            <article className="scenario-card">
              <div className="scenario-top-line">
                <span className="scenario-docket-id">CASE DOSSIER // SYN-09</span>
                <span className="scenario-classification-badge">FINANCIAL SYNDICATE</span>
              </div>
              <h3 className="scenario-title">Interstate Hawala &amp; Layered Money Laundering</h3>
              <p className="scenario-narrative">
                Investigation into a coordinated Hawala ring diverting proceeds through gold trade
                and bogus GST invoicing. SANDHAAN linked 8 shell entities and 27 current accounts in under 48 hours.
              </p>
              <div className="scenario-telemetry-box">
                <div>
                  <span className="sc-stat-label">Total Layered Volume</span>
                  <div className="sc-stat-val">₹145+ Crores</div>
                </div>
                <div>
                  <span className="sc-stat-label">Time to Unmask</span>
                  <div className="sc-stat-val">36 Hours (vs 6 Months)</div>
                </div>
              </div>
              <div className="scenario-outcome-tag">
                <span>✓ FULL GRAPH DECOMPOSED · CHARGE-SHEET READY</span>
              </div>
            </article>

            {/* Scenario 2 */}
            <article className="scenario-card">
              <div className="scenario-top-line">
                <span className="scenario-docket-id">CASE DOSSIER // CYB-41</span>
                <span className="scenario-classification-badge">CYBER FRAUD RING</span>
              </div>
              <h3 className="scenario-title">Multi-State Phishing &amp; Counterfeit SIM Nexus</h3>
              <p className="scenario-narrative">
                Organized cybercrime cell orchestrating fake electricity bill scams. Correlated 380 burner
                telecom lines and identified common point of fraudulent biometric Aadhaar issuance.
              </p>
              <div className="scenario-telemetry-box">
                <div>
                  <span className="sc-stat-label">Tracked SIM Cards</span>
                  <div className="sc-stat-val">380 Lines Mapped</div>
                </div>
                <div>
                  <span className="sc-stat-label">Fraudulent UPI Handles</span>
                  <div className="sc-stat-val">124 Neutralized</div>
                </div>
              </div>
              <div className="scenario-outcome-tag">
                <span>✓ 19 INTER-STATE HUB ARRESTS COORDINATED</span>
              </div>
            </article>

            {/* Scenario 3 */}
            <article className="scenario-card">
              <div className="scenario-top-line">
                <span className="scenario-docket-id">CASE DOSSIER // NAR-18</span>
                <span className="scenario-classification-badge">NARCOTICS CORRIDOR</span>
              </div>
              <h3 className="scenario-title">Cross-Border Narcotics Distribution Corridor</h3>
              <p className="scenario-narrative">
                Spatio-temporal intelligence tracking logistics movement from maritime drops along coastal
                Gujarat to inland metropolitan distribution centers via synchronized toll FASTag &amp; tower pings.
              </p>
              <div className="scenario-telemetry-box">
                <div>
                  <span className="sc-stat-label">Correlated Checkpoints</span>
                  <div className="sc-stat-val">4 Border Toll Booths</div>
                </div>
                <div>
                  <span className="sc-stat-label">Seizure Valuation</span>
                  <div className="sc-stat-val">₹32.5 Crores</div>
                </div>
              </div>
              <div className="scenario-outcome-tag">
                <span>✓ KINGPIN IDENTIFIED VIA 3-HOP LINK TRAVERSAL</span>
              </div>
            </article>
          </div>
        </section>

        {/* ============================================================
            CORE CAPABILITIES & MODULES (#capabilities)
            ============================================================ */}
        <section id="capabilities" className="landing-section">
          <div className="section-dossier-header">
            <div>
              <span className="section-tag-prefix">// WORKSTATION MODULE SUITE</span>
              <h2 className="section-main-title">Investigation Capabilities</h2>
            </div>
            <span className="section-header-meta">ENTERPRISE LAW ENFORCEMENT TOOLKIT // V2.4</span>
          </div>

          <div className="modules-grid">
            <article className="module-card">
              <span className="module-card-num">MOD-01</span>
              <h3 className="module-card-title">Network Analysis &amp; Graph Traversal</h3>
              <p className="module-card-desc">
                High-performance multi-hop graph decomposition unrolls shell intermediaries, money
                mule rings, and co-conspirators across disparate state police databases.
              </p>
              <span className="module-card-badge">Force-Directed Graph</span>
            </article>

            <article className="module-card">
              <span className="module-card-num">MOD-02</span>
              <h3 className="module-card-title">Spatio-Temporal Mapping &amp; CDR</h3>
              <p className="module-card-desc">
                Plot call-detail-records (CDR), vehicle sightings, and incident coordinates on
                synchronized temporal map overlays with automated geofence intrusion alerts.
              </p>
              <span className="module-card-badge">Leaflet / OpenStreetMap</span>
            </article>

            <article className="module-card">
              <span className="module-card-num">MOD-03</span>
              <h3 className="module-card-title">Forensic Evidence Chain of Custody</h3>
              <p className="module-card-desc">
                Strict custodial management tracking digital artifacts, seized mobile hardware,
                and ballistic reports with tamper-evident cryptographic audit logs.
              </p>
              <span className="module-card-badge">SHA-256 Ledger</span>
            </article>

            <article className="module-card">
              <span className="module-card-num">MOD-04</span>
              <h3 className="module-card-title">Entity Resolution &amp; Alias Merging</h3>
              <p className="module-card-desc">
                Fuzzy matching resolving alias duplications, forged identities, masked phone numbers,
                and fictitious business director associations into clean unified profiles.
              </p>
              <span className="module-card-badge">Phonetic Fuzzy Engine</span>
            </article>

            <article className="module-card">
              <span className="module-card-num">MOD-05</span>
              <h3 className="module-card-title">Chronological Event Timeline</h3>
              <p className="module-card-desc">
                Multi-docket chronological event sequencing establishing alibi invalidation,
                concurrent presence at crime scenes, and coordinated communication bursts.
              </p>
              <span className="module-card-badge">Temporal Sequencing</span>
            </article>

            <article className="module-card">
              <span className="module-card-num">MOD-06</span>
              <h3 className="module-card-title">Automated Syndicate Findings</h3>
              <p className="module-card-desc">
                Algorithmic heuristic analysis uncovering SIM swaps, sudden wealth surges,
                benami asset transfers, and unusual cross-border calls without manual filtering.
              </p>
              <span className="module-card-badge">Heuristic Anomaly Engine</span>
            </article>
          </div>
        </section>

        {/* ============================================================
            SECURITY, GOVERNANCE & SECTION 65B COMPLIANCE (#compliance)
            ============================================================ */}
        <section id="compliance" className="landing-section">
          <div className="section-dossier-header">
            <div>
              <span className="section-tag-prefix">// STATUTORY COMPLIANCE &amp; GOVERNANCE</span>
              <h2 className="section-main-title">Judicial Evidence Standards &amp; Clearance Matrix</h2>
            </div>
            <span className="section-header-meta">ADMISSIBILITY UNDER INDIAN EVIDENCE ACT &amp; IT ACT 2000</span>
          </div>

          <div className="compliance-layout">
            <div className="compliance-info-card">
              <h3 className="compliance-card-title">
                <span>⚖️ Section 65B Indian Evidence Act Compliance</span>
              </h3>
              <p className="compliance-p">
                All electronic records, graph screenshots, CDR timelines, and transaction logs
                generated by SANDHAAN include an automatically generated, tamper-evident certificate
                under Section 65B(4) of the Indian Evidence Act, 1872.
              </p>
              <div className="legal-cert-seal">
                <span className="seal-header">SEC 65B DIGITAL ATTESTATION HASH</span>
                <span className="seal-hash">
                  SHA256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
                </span>
                <span style={{ fontSize: "11px", color: "var(--color-success)" }}>
                  ✓ Non-repudiation assured by hardware-bound cryptographic signing
                </span>
              </div>
              <p className="compliance-p">
                Every query, export, and subject view is cryptographically recorded in an immutable
                append-only audit log, ensuring strict evidentiary chain of custody for trial prosecution.
              </p>
            </div>

            <div className="compliance-info-card">
              <h3 className="compliance-card-title">
                <span>🛡️ Level 1 to 5 Security Clearance Matrix</span>
              </h3>
              <div className="clearance-table-container">
                <table className="clearance-matrix-table">
                  <thead>
                    <tr>
                      <th>Clearance</th>
                      <th>Designation</th>
                      <th>Access Scope</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span className="role-badge">Level 1</span></td>
                      <td>Field Officer / Sub-Inspector</td>
                      <td>Local Station FIRs &amp; Evidence Log</td>
                    </tr>
                    <tr>
                      <td><span className="role-badge">Level 2</span></td>
                      <td>Investigating Officer (IO)</td>
                      <td>Cross-Jurisdiction CDR &amp; Financials</td>
                    </tr>
                    <tr>
                      <td><span className="role-badge">Level 3</span></td>
                      <td>Superintendent of Police (SP)</td>
                      <td>Full Multi-Hop Graph &amp; Anomaly Triage</td>
                    </tr>
                    <tr>
                      <td><span className="role-badge">Level 4</span></td>
                      <td>Inspector General (IG) / Bureau Chief</td>
                      <td>Inter-State Joint Intelligence Merging</td>
                    </tr>
                    <tr>
                      <td><span className="role-badge">Level 5</span></td>
                      <td>National Oversight / NSA</td>
                      <td>Full Master System Audit &amp; Sealing</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            TECHNICAL SPECIFICATIONS (#specs)
            ============================================================ */}
        <section id="specs" className="landing-section">
          <div className="section-dossier-header">
            <div>
              <span className="section-tag-prefix">// ARCHITECTURAL SPECIFICATIONS</span>
              <h2 className="section-main-title">Platform Specifications &amp; Performance</h2>
            </div>
            <span className="section-header-meta">ENGINEERED FOR EXTREME THROUGHPUT &amp; ZERO-LEAKAGE PRIVACY</span>
          </div>

          <div className="specs-grid">
            <div className="spec-box">
              <span className="spec-title">Database Engine</span>
              <span className="spec-val">NeonDB Serverless PostgreSQL</span>
              <span className="spec-note">High-concurrency connection pooling with enterprise TLS 1.3 encryption.</span>
            </div>

            <div className="spec-box">
              <span className="spec-title">Graph Traversal Depth</span>
              <span className="spec-val">Up to 6 Degrees of Separation</span>
              <span className="spec-note">Recursive relational algorithms resolving complex syndicate webs in &lt;150ms.</span>
            </div>

            <div className="spec-box">
              <span className="spec-title">Air-Gapped Sovereign Readiness</span>
              <span className="spec-val">100% On-Premise Capable</span>
              <span className="spec-note">Deployable inside secure police intranet data centers with zero external egress.</span>
            </div>

            <div className="spec-box">
              <span className="spec-title">Evidence Export Formats</span>
              <span className="spec-val">PDF, JSON-LD, Section 65B Form</span>
              <span className="spec-note">Includes court-ready annexures, hash registries, and chain-of-custody logs.</span>
            </div>
          </div>
        </section>
      </main>

      {/* ============================================================
          Comprehensive Security Footer
          ============================================================ */}
      <footer className="landing-footer">
        <div className="footer-top-row">
          <div className="footer-compliance-statement">
            <span style={{ color: "var(--color-warning)" }}>🔒</span>
            <span>RESTRICTED ACCESS PORTAL — AUTHORIZED LAW ENFORCEMENT &amp; SECURITY AGENCIES ONLY</span>
          </div>
          <div style={{ display: "flex", gap: "16px" }}>
            <a href="#overview" style={{ color: "var(--color-text-secondary)", textDecoration: "none", fontSize: "12px" }}>
              Back to Top ↑
            </a>
            <Link to={routes.login} style={{ color: "var(--color-primary)", textDecoration: "none", fontSize: "12px", fontWeight: 600 }}>
              Investigator Login →
            </Link>
          </div>
        </div>

        <div className="footer-statutory-notice">
          <strong>STATUTORY ADVISORY:</strong> Access to this system is restricted to authorized personnel
          holding valid credentials under the Information Technology Act, 2000 and the Official Secrets Act, 1923.
          All sessions, queries, and data downloads are cryptographically logged and subject to continuous surveillance.
          Unauthorized access attempts will be prosecuted to the maximum extent of the law.
        </div>

        <div className="footer-bottom-row">
          <span>SANDHAAN PLATFORM BUILD 2026.09-PROD // SOVEREIGN CRIME INTELLIGENCE GRID</span>
          <span>EMERGENCY DISPATCH HOTLINE // NATIONAL CYBER CELL 1930</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
