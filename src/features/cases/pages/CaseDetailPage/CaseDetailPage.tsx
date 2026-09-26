import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

import { caseService } from '@/features/cases/services/caseService';
import type { InvestigationCase } from '@/domain/investigation/case';
import { routes } from '@/routes/routePaths';
import {
  entityPath,
  networkPath,
  timelinePath,
  evidencePath,
  findingPath,
  locationPath,
} from '@/domain/investigation/context';

export default function CaseDetailPage() {
  const { caseId } = useParams<{ caseId: string }>();

  const [caseData, setCaseData] =
    useState<InvestigationCase | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!caseId) {
      setError('Case ID is missing.');
      setLoading(false);
      return;
    }

    const currentCaseId = caseId;
    let cancelled = false;

    async function loadCase() {
      try {
        setLoading(true);
        setError(null);

        const result =
          await caseService.getById(currentCaseId);

        if (cancelled) return;

        if (!result) {
          setError('Case not found.');
          return;
        }

        setCaseData(result);
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load case.',
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadCase();

    return () => {
      cancelled = true;
    };
  }, [caseId]);

  if (loading) {
    return <p>Loading investigation...</p>;
  }

  if (error) {
    return (
      <section>
        <h1>Case Investigation</h1>
        <p>{error}</p>
        <p>
          <Link to={routes.cases.list}>Back to Cases</Link>
        </p>
      </section>
    );
  }

  if (!caseData) {
    return <p>Case not found.</p>;
  }

  return (
    <main>
      <header>
        <p>
          <Link to={routes.cases.list}>← Back to Cases</Link>
        </p>
        <p>{caseData.caseNumber}</p>
        <h1>{caseData.title}</h1>

        <p>
          Status: {caseData.status} · Priority:{' '}
          {caseData.priority}
        </p>
      </header>

      <section>
        <h2>Case Overview</h2>

        <p>{caseData.description}</p>

        <dl>
          <dt>Crime Category</dt>
          <dd>
            {caseData.metadata?.crimeCategory ?? '—'}
          </dd>

          <dt>Crime Subcategory</dt>
          <dd>
            {caseData.metadata?.crimeSubcategory ?? '—'}
          </dd>

          <dt>District</dt>
          <dd>{caseData.metadata?.district ?? '—'}</dd>

          <dt>City</dt>
          <dd>{caseData.metadata?.city ?? '—'}</dd>

          <dt>Police Station</dt>
          <dd>
            {caseData.metadata?.policeStationId ?? '—'}
          </dd>

          <dt>Investigating Officer</dt>
          <dd>
            {caseData.metadata?.investigatingOfficerId ?? '—'}
          </dd>

          <dt>Incident Date</dt>
          <dd>
            {caseData.metadata?.incidentDate
              ? new Date(
                  caseData.metadata.incidentDate as string,
                ).toLocaleString()
              : '—'}
          </dd>
        </dl>
      </section>

      <section>
        <h2>Related Entities ({caseData.entityReferences.length})</h2>

        {caseData.entityReferences.length === 0 ? (
          <p>No related entities.</p>
        ) : (
          <div style={{ display: 'grid', gap: '8px', marginTop: '12px' }}>
            {caseData.entityReferences.map(
              (reference) => (
                <div
                  key={reference.entityId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '6px',
                  }}
                >
                  <div>
                    <span
                      style={{
                        padding: '2px 6px',
                        background: '#1e293b',
                        color: '#94a3b8',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        marginRight: '8px',
                      }}
                    >
                      {reference.entityType.toUpperCase()}
                    </span>
                    <strong style={{ color: '#f8fafc' }}>{reference.label}</strong>
                    <span style={{ color: '#64748b', fontSize: '0.8rem', marginLeft: '8px', fontFamily: 'monospace' }}>
                      ({reference.entityId})
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link
                      to={entityPath(reference.entityType, reference.entityId)}
                      style={{ color: '#38bdf8', textDecoration: 'none', fontSize: '0.8rem' }}
                    >
                      Dossier →
                    </Link>
                    <Link
                      to={networkPath({ entityId: reference.entityId })}
                      style={{ color: '#0284c7', textDecoration: 'none', fontSize: '0.8rem' }}
                    >
                      Network →
                    </Link>
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </section>

      <section style={{ marginTop: '24px' }}>
        <h2>Investigation Modules & Artifacts</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginTop: '12px' }}>
          <div style={{ padding: '12px', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '6px' }}>
            <div style={{ color: '#64748b', fontSize: '0.75rem' }}>EVIDENCE ARTIFACTS</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', margin: '4px 0' }}>
              {caseData.evidenceIds.length}
            </div>
            <Link
              to={evidencePath(undefined, caseData.caseId)}
              style={{ color: '#38bdf8', fontSize: '0.8rem', textDecoration: 'none' }}
            >
              Open Evidence Workspace →
            </Link>
          </div>

          <div style={{ padding: '12px', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '6px' }}>
            <div style={{ color: '#64748b', fontSize: '0.75rem' }}>INTELLIGENCE FINDINGS</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', margin: '4px 0' }}>
              {caseData.findingIds.length}
            </div>
            <Link
              to={findingPath(undefined, caseData.caseId)}
              style={{ color: '#38bdf8', fontSize: '0.8rem', textDecoration: 'none' }}
            >
              Open Findings Workspace →
            </Link>
          </div>

          <div style={{ padding: '12px', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '6px' }}>
            <div style={{ color: '#64748b', fontSize: '0.75rem' }}>TIMELINE EVENTS</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', margin: '4px 0' }}>
              {caseData.timelineEventIds.length}
            </div>
            <Link
              to={timelinePath({ caseId: caseData.caseId })}
              style={{ color: '#38bdf8', fontSize: '0.8rem', textDecoration: 'none' }}
            >
              Open Case Timeline →
            </Link>
          </div>

          <div style={{ padding: '12px', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '6px' }}>
            <div style={{ color: '#64748b', fontSize: '0.75rem' }}>NETWORK GRAPH</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', margin: '4px 0' }}>
              {caseData.relationshipIds.length} Rel
            </div>
            {caseData.entityReferences.length > 0 ? (
              <Link
                to={networkPath({ entityId: caseData.entityReferences[0].entityId })}
                style={{ color: '#38bdf8', fontSize: '0.8rem', textDecoration: 'none' }}
              >
                Inspect Primary Network →
              </Link>
            ) : (
              <span style={{ color: '#64748b', fontSize: '0.8rem' }}>No entity node</span>
            )}
          </div>

          <div style={{ padding: '12px', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '6px' }}>
            <div style={{ color: '#64748b', fontSize: '0.75rem' }}>INCIDENT LOCATIONS</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', margin: '4px 0' }}>
              {caseData.locationIds.length}
            </div>
            <Link
              to={locationPath(undefined, caseData.caseId)}
              style={{ color: '#38bdf8', fontSize: '0.8rem', textDecoration: 'none' }}
            >
              View Locations →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

