import React from 'react';
import type { AccessRequestSummary } from '../types/accessControl';
import { AccessRequestStatusBadge } from './AccessRequestStatusBadge';

interface Props {
  applications: AccessRequestSummary[];
  selectedId: number | null;
  onSelect: (app: AccessRequestSummary) => void;
  isLoading: boolean;
}

export const AccessRequestTable: React.FC<Props> = ({
  applications,
  selectedId,
  onSelect,
  isLoading,
}) => {
  if (isLoading && applications.length === 0) {
    return (
      <div className="access-table-empty">
        <div className="access-loading-spinner" />
        <p>Retrieving official application dossiers from secure enclave...</p>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="access-table-empty">
        <span className="access-empty-icon">📁</span>
        <h3>No Official Applications Found</h3>
        <p>No access applications match the current filter criteria.</p>
      </div>
    );
  }

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="access-table-wrapper">
      <table className="access-table">
        <thead>
          <tr>
            <th>APPLICATION NUMBER</th>
            <th>OFFICIAL APPLICANT</th>
            <th>DEPARTMENT / UNIT</th>
            <th>DESIGNATION & RANK</th>
            <th>SUBMITTED</th>
            <th>STATUS</th>
            <th style={{ textAlign: 'right' }}>ACTION</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => {
            const isSelected = selectedId === app.id;
            return (
              <tr
                key={app.id}
                className={`access-table-row ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelect(app)}
              >
                <td>
                  <span className="access-app-num">{app.applicationNumber}</span>
                </td>
                <td>
                  <div className="access-applicant-info">
                    <span className="access-applicant-name">{app.fullName}</span>
                    <span className="access-official-id">ID: {app.officialId}</span>
                  </div>
                </td>
                <td>
                  <div className="access-dept-info">
                    <span className="access-dept-name">{app.department}</span>
                    <span className="access-org-name">{app.organization}</span>
                  </div>
                </td>
                <td>
                  <div className="access-designation-info">
                    <span className="access-desig-name">{app.designation}</span>
                    <span className="access-rank-name">{app.rank || 'Standard'}</span>
                  </div>
                </td>
                <td>
                  <span className="access-date-text">{formatDate(app.submittedAt)}</span>
                </td>
                <td>
                  <AccessRequestStatusBadge status={app.status} size="sm" />
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    type="button"
                    className="access-inspect-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(app);
                    }}
                  >
                    INSPECT DOSSIER →
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
