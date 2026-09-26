import React, { useEffect, useState } from 'react';
import {
  entityResolutionService,
  SAMPLE_FIRS,
} from '../../services/entityResolutionService';
import type {
  AnalyzeFIRResponse,
  ServiceHealth,
} from '../../types';
import './EntityResolutionPage.css';

export default function EntityResolutionPage() {
  const [activeTab, setActiveTab] = useState<'DATABASE' | 'ANALYZER'>('DATABASE');
  
  // NeonDB Live Explorer state
  const [dbStats, setDbStats] = useState({ total: 50000, resolved: 20007, ambiguous: 10000, unresolved: 19993 });
  const [dbStatusFilter, setDbStatusFilter] = useState<'ALL' | 'AMBIGUOUS' | 'RESOLVED' | 'UNRESOLVED'>('AMBIGUOUS');
  const [dbEntityTypeFilter, setDbEntityTypeFilter] = useState<'ALL' | 'PERSON' | 'PHONE' | 'VEHICLE' | 'LOCATION'>('PERSON');
  const [dbSearch, setDbSearch] = useState('');
  const [dbMentions, setDbMentions] = useState<any[]>([]);
  const [dbTotal, setDbTotal] = useState(0);
  const [dbPage, setDbPage] = useState(0);
  const [dbLoading, setDbLoading] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  // Live Analyzer state
  const [firText, setFirText] = useState(SAMPLE_FIRS[0].text);
  const [selectedSample, setSelectedSample] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeFIRResponse | null>(null);
  const [health, setHealth] = useState<ServiceHealth>({ status: 'checking' });
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    checkHealth();
    loadDbStats();
    loadDbMentions(dbStatusFilter, dbSearch, dbEntityTypeFilter, 0);
  }, []);

  async function checkHealth() {
    const res = await entityResolutionService.getHealth();
    setHealth(res);
  }

  async function loadDbStats() {
    const stats = await entityResolutionService.getDbStats();
    setDbStats(stats);
  }

  async function loadDbMentions(status: string, search: string, entityType: string, offset: number) {
    try {
      setDbLoading(true);
      const res = await entityResolutionService.queryDbMentions({
        status,
        search,
        entity_type: entityType,
        limit: 15,
        offset,
      });
      setDbMentions(res.items || []);
      setDbTotal(res.total || 0);
      setDbPage(offset);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch mentions from NeonDB');
    } finally {
      setDbLoading(false);
    }
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    void loadDbMentions(dbStatusFilter, dbSearch, dbEntityTypeFilter, 0);
  }

  function handleFilterChange(newStatus: 'ALL' | 'AMBIGUOUS' | 'RESOLVED' | 'UNRESOLVED') {
    setDbStatusFilter(newStatus);
    void loadDbMentions(newStatus, dbSearch, dbEntityTypeFilter, 0);
  }

  function handleEntityTypeChange(newType: 'ALL' | 'PERSON' | 'PHONE' | 'VEHICLE' | 'LOCATION') {
    setDbEntityTypeFilter(newType);
    void loadDbMentions(dbStatusFilter, dbSearch, newType, 0);
  }

  async function handleConfirmResolutionInDb(mentionId: string, personId: string) {
    try {
      setResolvingId(mentionId);
      setError(null);
      const res = await entityResolutionService.resolveDbMention(mentionId, personId);
      setSuccessMsg(`✓ Saved to NeonDB: Mention ${mentionId} is now resolved to ${personId}.`);
      setTimeout(() => setSuccessMsg(null), 5000);
      
      // Refresh list & stats from NeonDB
      await loadDbStats();
      await loadDbMentions(dbStatusFilter, dbSearch, dbEntityTypeFilter, dbPage);
    } catch (err: any) {
      setError(err?.message || 'Failed to update resolution in NeonDB');
    } finally {
      setResolvingId(null);
    }
  }

  async function runLiveAnalysis(textToAnalyze: string, caseId?: string, documentId?: string) {
    if (!textToAnalyze.trim()) return;
    try {
      setAnalyzing(true);
      setError(null);
      const res = await entityResolutionService.analyzeFIR(textToAnalyze, caseId, documentId);
      setAnalysisResult(res);
      setSuccessMsg('✓ Analysis completed & synchronized with NeonDB.');
      setTimeout(() => setSuccessMsg(null), 4000);
      await loadDbStats();
    } catch (err: any) {
      setError(err?.message || 'Failed to analyze text with Entity Intelligence service.');
    } finally {
      setAnalyzing(false);
    }
  }

  function handleSelectSample(index: number) {
    setSelectedSample(index);
    const sample = SAMPLE_FIRS[index];
    setFirText(sample.text);
    void runLiveAnalysis(sample.text, sample.caseId, sample.documentId);
  }

  async function handleLoadRandomRealFIR() {
    setSelectedSample(-1);
    const fir = await entityResolutionService.getRandomFIR();
    setFirText(fir.narrative_text);
    void runLiveAnalysis(fir.narrative_text, fir.case_id, fir.document_id);
  }

  return (
    <div className="er-page-container">
      {/* Header */}
      <div className="er-header">
        <div className="er-title-area">
          <h1>Entity Intelligence & Disambiguation Console</h1>
          <p className="er-subtitle">
            NeonDB PostgreSQL Active • 10,000 Persons • 50,000 Mentions • Token-Trie Hybrid Disambiguation
          </p>
        </div>
        <div className="er-health-badge">
          <div className={`er-health-dot ${health.status === 'online' ? 'online' : 'offline'}`} />
          <span>
            {health.status === 'online'
              ? `NeonDB Cloud Online • ${health.indexed_people?.toLocaleString() || '7,000'} Persons Indexed`
              : 'AI Engine Offline (Run: npm run dev:ai)'}
          </span>
          <button
            onClick={() => { void checkHealth(); void loadDbStats(); }}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            ↻
          </button>
        </div>
      </div>

      {/* Top Level Workspace Tabs */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid #1e293b', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('DATABASE')}
          style={{
            background: activeTab === 'DATABASE' ? '#0284c7' : '#1e293b',
            color: activeTab === 'DATABASE' ? '#fff' : '#94a3b8',
            border: '1px solid #334155',
            padding: '8px 18px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          🗄️ NeonDB Live Mentions Explorer (50,000 Records)
        </button>
        <button
          onClick={() => setActiveTab('ANALYZER')}
          style={{
            background: activeTab === 'ANALYZER' ? '#0284c7' : '#1e293b',
            color: activeTab === 'ANALYZER' ? '#fff' : '#94a3b8',
            border: '1px solid #334155',
            padding: '8px 18px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ⚡ Live FIR Narrative Analyzer & Ingestion
        </button>
      </div>

      {/* Top Metrics Row (Live from NeonDB) */}
      <div className="er-metrics-grid">
        <div className="er-metric-card">
          <span className="er-metric-label">NeonDB Total Mentions</span>
          <span className="er-metric-value">{dbStats.total.toLocaleString()}</span>
        </div>
        <div className="er-metric-card resolved">
          <span className="er-metric-label">Resolved (Canonical Match)</span>
          <span className="er-metric-value">{dbStats.resolved.toLocaleString()}</span>
        </div>
        <div className="er-metric-card ambiguous">
          <span className="er-metric-label">Ambiguous (Triage Required)</span>
          <span className="er-metric-value">{dbStats.ambiguous.toLocaleString()}</span>
        </div>
        <div className="er-metric-card unresolved">
          <span className="er-metric-label">Unresolved</span>
          <span className="er-metric-value">{dbStats.unresolved.toLocaleString()}</span>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', padding: '12px', borderRadius: '6px', color: '#6ee7b7', fontSize: '13px' }}>
          {successMsg}
        </div>
      )}
      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', padding: '12px', borderRadius: '6px', color: '#fca5a5', fontSize: '13px' }}>
          ⚠️ {error}
        </div>
      )}

      {/* TAB 1: NEONDB LIVE MENTIONS EXPLORER */}
      {activeTab === 'DATABASE' && (
        <div className="er-panel">
          <div className="er-panel-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="er-panel-title">Live Database Triage Queue</span>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                Showing {dbMentions.length} of {dbTotal.toLocaleString()} matching records in NeonDB
              </span>
            </div>

            {/* Filter buttons */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {(['AMBIGUOUS', 'UNRESOLVED', 'RESOLVED', 'ALL'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => handleFilterChange(status)}
                  style={{
                    background: dbStatusFilter === status ? '#0284c7' : '#1e293b',
                    color: dbStatusFilter === status ? '#fff' : '#94a3b8',
                    border: '1px solid #334155',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar & Entity Type filters */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="Search by mention name (e.g. Akash, Rohit), Case ID, or Document ID..."
              value={dbSearch}
              onChange={(e) => setDbSearch(e.target.value)}
              style={{
                flex: 1,
                background: '#090d16',
                border: '1px solid #334155',
                color: '#f8fafc',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '13px',
              }}
            />
            <button
              type="submit"
              className="er-btn-primary"
              style={{ padding: '8px 16px' }}
            >
              🔍 Search NeonDB
            </button>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              {(['ALL', 'PERSON', 'PHONE', 'VEHICLE', 'LOCATION'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleEntityTypeChange(type)}
                  style={{
                    background: dbEntityTypeFilter === type ? '#334155' : 'transparent',
                    color: dbEntityTypeFilter === type ? '#38bdf8' : '#64748b',
                    border: '1px solid #334155',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </form>

          {/* Table */}
          {dbLoading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              Querying NeonDB cloud database...
            </div>
          ) : dbMentions.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              No mentions found in NeonDB matching your criteria.
            </div>
          ) : (
            <table className="er-resolutions-table">
              <thead>
                <tr>
                  <th style={{ width: '130px' }}>Mention ID</th>
                  <th style={{ width: '180px' }}>Mention / Span</th>
                  <th style={{ width: '100px' }}>Type</th>
                  <th style={{ width: '130px' }}>Status</th>
                  <th>Candidate Resolution & NeonDB Sync</th>
                </tr>
              </thead>
              <tbody>
                {dbMentions.map((m) => (
                  <tr key={m.mention_id}>
                    <td>
                      <div style={{ fontFamily: 'monospace', fontWeight: 600, color: '#38bdf8' }}>
                        {m.mention_id}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {m.case_id} • {m.document_id}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '14px' }}>
                        {m.text_span}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
                        Offset: [{m.start_char}:{m.end_char}]
                      </div>
                    </td>

                    <td>
                      <span className={`er-chip-type`} style={{
                        color: m.entity_type === 'PERSON' ? '#38bdf8' :
                               m.entity_type === 'PHONE' ? '#10b981' :
                               m.entity_type === 'VEHICLE' ? '#f59e0b' : '#c084fc',
                        fontWeight: 700,
                        fontSize: '11px',
                      }}>
                        {m.entity_type}
                      </span>
                    </td>

                    <td>
                      <span className={`er-status-tag ${m.resolution_status}`}>
                        {m.resolution_status}
                      </span>
                      {m.resolved_entity_id && (
                        <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#10b981', marginTop: '4px' }}>
                          ID: {m.resolved_entity_id}
                        </div>
                      )}
                    </td>

                    <td>
                      {m.resolution_status === 'RESOLVED' && m.resolved_person && (
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                          Resolved to: <strong style={{ color: '#f8fafc' }}>{m.resolved_person.full_name}</strong>
                          {m.resolved_person.aliases && ` (Aliases: ${m.resolved_person.aliases})`}
                          {m.resolved_person.date_of_birth && ` • DOB: ${m.resolved_person.date_of_birth}`}
                        </div>
                      )}

                      {m.resolution_status === 'AMBIGUOUS' && (
                        <div>
                          <div style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '6px' }}>
                            ⚠️ <strong>Multiple Registered Candidates Found in NeonDB:</strong>
                          </div>
                          <div className="er-candidate-cards-grid">
                            {m.candidates && m.candidates.length > 0 ? (
                              m.candidates.map((c: any) => (
                                <div key={c.person_id} className="er-candidate-card">
                                  <div className="er-candidate-name">{c.full_name}</div>
                                  <div className="er-candidate-id">{c.person_id}</div>
                                  {c.date_of_birth && (
                                    <div className="er-candidate-meta">DOB: {c.date_of_birth}</div>
                                  )}
                                  <button
                                    className="er-resolve-action-btn"
                                    disabled={resolvingId === m.mention_id}
                                    onClick={() => handleConfirmResolutionInDb(m.mention_id, c.person_id)}
                                  >
                                    {resolvingId === m.mention_id ? 'Saving...' : '✓ Resolve in NeonDB'}
                                  </button>
                                </div>
                              ))
                            ) : (
                              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                                Location or multi-party ambiguity.
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {m.resolution_status === 'UNRESOLVED' && (
                        <div style={{ fontSize: '12px', color: '#ef4444' }}>
                          No canonical match in person registry. Record requires field investigation.
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
            <button
              className="er-sample-btn"
              disabled={dbPage === 0}
              onClick={() => void loadDbMentions(dbStatusFilter, dbSearch, dbEntityTypeFilter, Math.max(0, dbPage - 15))}
            >
              ← Previous 15
            </button>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
              Showing {dbPage + 1} – {Math.min(dbPage + 15, dbTotal)} of {dbTotal.toLocaleString()}
            </span>
            <button
              className="er-sample-btn"
              disabled={dbPage + 15 >= dbTotal}
              onClick={() => void loadDbMentions(dbStatusFilter, dbSearch, dbEntityTypeFilter, dbPage + 15)}
            >
              Next 15 →
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE FIR NARRATIVE ANALYZER */}
      {activeTab === 'ANALYZER' && (
        <>
          {/* Preset FIR Pickers */}
          <div className="er-samples-bar">
            <span className="er-samples-label">Load Narrative:</span>
            {SAMPLE_FIRS.map((s, idx) => (
              <button
                key={s.caseId}
                className={`er-sample-btn ${selectedSample === idx ? 'active' : ''}`}
                onClick={() => handleSelectSample(idx)}
              >
                {s.title}
              </button>
            ))}
            <button
              className={`er-sample-btn ${selectedSample === -1 ? 'active' : ''}`}
              style={{ background: '#1e1b4b', borderColor: '#6366f1', color: '#c7d2fe' }}
              onClick={() => void handleLoadRandomRealFIR()}
            >
              🎲 Load Random Real FIR from NeonDB
            </button>
          </div>

          <div className="er-split-layout">
            {/* Left: Input Text */}
            <div className="er-panel">
              <div className="er-panel-header">
                <span className="er-panel-title">FIR Document & Narrative Text</span>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                  {analysisResult?.document_id || 'DOC_LIVE'}
                </span>
              </div>

              <textarea
                className="er-textarea"
                value={firText}
                onChange={(e) => setFirText(e.target.value)}
                placeholder="Paste FIR narrative, intelligence wire, or police report text here..."
              />

              <div className="er-action-row">
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  {firText.length} characters • {firText.split(/\s+/).filter(Boolean).length} words
                </span>
                <button
                  className="er-btn-primary"
                  disabled={analyzing || !firText.trim()}
                  onClick={() => void runLiveAnalysis(firText)}
                >
                  {analyzing ? 'Extracting & Saving...' : '⚡ Run Entity Intelligence (Save to NeonDB)'}
                </button>
              </div>

              {/* Provenance Span Viewer */}
              {analysisResult && (
                <>
                  <div className="er-panel-header" style={{ marginTop: '10px' }}>
                    <span className="er-panel-title">Extracted Narrative Spans</span>
                  </div>
                  <div className="er-text-provenance">
                    {renderHighlightedText(analysisResult.raw_text, analysisResult.mentions)}
                  </div>
                </>
              )}
            </div>

            {/* Right: Extracted Entities from Analyzer */}
            <div className="er-panel">
              <div className="er-panel-header">
                <span className="er-panel-title">Extracted & Disambiguated Results</span>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                  {analysisResult?.resolutions.length || 0} person resolutions
                </span>
              </div>

              {!analysisResult ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                  Click &ldquo;Run Entity Intelligence&rdquo; or select a sample FIR to begin analysis.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {analysisResult.resolutions.map((r) => (
                    <div key={r.mention_id} style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '6px', padding: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div>
                          <strong style={{ color: '#f8fafc', fontSize: '15px' }}>{r.text_span}</strong>
                          <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '8px', fontFamily: 'monospace' }}>
                            [{r.start_char}:{r.end_char}]
                          </span>
                        </div>
                        <span className={`er-status-tag ${r.resolution_status}`}>
                          {r.resolution_status}
                        </span>
                      </div>

                      {r.resolution_status === 'AMBIGUOUS' && (
                        <div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
                            {r.candidates.length} candidates in NeonDB. Pick to confirm:
                          </div>
                          <div className="er-candidate-cards-grid">
                            {r.candidates.map((c) => (
                              <div key={c.person_id} className="er-candidate-card">
                                <div className="er-candidate-name">{c.full_name}</div>
                                <div className="er-candidate-id">{c.person_id}</div>
                                {c.date_of_birth && <div className="er-candidate-meta">DOB: {c.date_of_birth}</div>}
                                <button
                                  className="er-resolve-action-btn"
                                  onClick={() => handleConfirmResolutionInDb(r.mention_id, c.person_id)}
                                >
                                  ✓ Confirm & Save to NeonDB
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {r.resolution_status === 'RESOLVED' && (
                        <div style={{ fontSize: '12px', color: '#10b981' }}>
                          ✓ Resolved to canonical ID: <strong>{r.resolved_entity_id}</strong> (Confidence: 1.0)
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function renderHighlightedText(text: string, mentions: { start_char: number; end_char: number; entity_type: string; text_span: string }[]) {
  if (!text || mentions.length === 0) return <span>{text}</span>;

  const sorted = [...mentions].sort((a, b) => a.start_char - b.start_char);
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;

  sorted.forEach((m, idx) => {
    if (m.start_char > lastIndex) {
      elements.push(<span key={`txt-${idx}`}>{text.substring(lastIndex, m.start_char)}</span>);
    }
    elements.push(
      <span key={`span-${idx}`} className={`er-span-badge ${m.entity_type}`}>
        {text.substring(m.start_char, m.end_char) || m.text_span}
      </span>
    );
    lastIndex = Math.max(lastIndex, m.end_char);
  });

  if (lastIndex < text.length) {
    elements.push(<span key="txt-end">{text.substring(lastIndex)}</span>);
  }

  return <>{elements}</>;
}
