import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { caseService } from '@/features/cases/services/caseService';
import type {
  InvestigationCase,
  CasePriority,
  CaseStatus,
} from '@/domain/investigation/case';
import { routes } from '@/routes/routePaths';

const PAGE_SIZE = 25;

export default function CasesPage() {
  const [cases, setCases] = useState<InvestigationCase[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<CaseStatus | ''>('');
  const [priority, setPriority] = useState<CasePriority | ''>('');

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCases() {
      try {
        setLoading(true);
        setError(null);

        const result = await caseService.list({
          page,
          pageSize: PAGE_SIZE,
          search: search || undefined,
          status: status || undefined,
          priority: priority || undefined,
        });

        if (cancelled) return;

        setCases(result.items);
        setTotal(result.total);
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load cases.',
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadCases();

    return () => {
      cancelled = true;
    };
  }, [page, search, status, priority]);

  const totalPages = Math.max(
    1,
    Math.ceil(total / PAGE_SIZE),
  );

  function handleSearchChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    setSearch(event.target.value);
    setPage(1);
  }

  function handleStatusChange(
    event: React.ChangeEvent<HTMLSelectElement>,
  ) {
    setStatus(event.target.value as CaseStatus | '');
    setPage(1);
  }

  function handlePriorityChange(
    event: React.ChangeEvent<HTMLSelectElement>,
  ) {
    setPriority(
      event.target.value as CasePriority | '',
    );
    setPage(1);
  }

  return (
    <div>
      <header>
        <h1>Cases</h1>
        <p>
          Investigation cases from the SANDHAAN intelligence
          database.
        </p>
      </header>

      <section>
        <input
          type="search"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search cases..."
        />

        <select
          value={status}
          onChange={handleStatusChange}
        >
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="active">Active</option>
          <option value="under_review">Under Review</option>
          <option value="closed">Closed</option>
        </select>

        <select
          value={priority}
          onChange={handlePriorityChange}
        >
          <option value="">All priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </section>

      {loading && <p>Loading cases...</p>}

      {error && (
        <section>
          <h2>Unable to load cases</h2>
          <p>{error}</p>
        </section>
      )}

      {!loading && !error && (
        <>
          <section>
            <p>
              Showing {cases.length} of {total} cases
            </p>

            <table>
              <thead>
                <tr>
                  <th>Case</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Category</th>
                  <th>Incident Date</th>
                </tr>
              </thead>

              <tbody>
                {cases.map((item) => (
                  <tr key={item.caseId}>
                    <td>
                      <Link to={routes.cases.detail(item.caseId)}>
                        {item.caseNumber}
                      </Link>
                    </td>

                    <td>{item.title}</td>

                    <td>{item.status}</td>

                    <td>{item.priority}</td>

                    <td>
                      {item.metadata?.crimeCategory ?? '—'}
                    </td>

                    <td>
                      {item.metadata?.incidentDate
                        ? new Date(
                            item.metadata.incidentDate as string,
                          ).toLocaleDateString()
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {cases.length === 0 && (
              <p>No cases match the current filters.</p>
            )}
          </section>

          <nav aria-label="Cases pagination">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() =>
                setPage((current) => current - 1)
              }
            >
              Previous
            </button>

            <span>
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() =>
                setPage((current) => current + 1)
              }
            >
              Next
            </button>
          </nav>
        </>
      )}
    </div>
  );
}
