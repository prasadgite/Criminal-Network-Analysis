import React from 'react';
import type { AccessRequestStats } from '../types/accessControl';

interface Props {
  stats: AccessRequestStats;
  currentStatus: string;
  onStatusChange: (status: string) => void;
  searchTerm: string;
  onSearchChange: (search: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const AccessRequestFilters: React.FC<Props> = ({
  stats,
  currentStatus,
  onStatusChange,
  searchTerm,
  onSearchChange,
  onRefresh,
  isLoading,
}) => {
  const statItems = [
    { id: 'PENDING', label: 'PENDING REVIEW', count: stats.pending, color: '#fbbf24' },
    { id: 'UNDER_REVIEW', label: 'UNDER REVIEW', count: stats.underReview, color: '#38bdf8' },
    { id: 'APPROVED', label: 'APPROVED', count: stats.approved, color: '#4ade80' },
    { id: 'MORE_INFORMATION_REQUIRED', label: 'ACTION REQUIRED', count: stats.moreInfoRequired, color: '#f97316' },
    { id: 'ALL', label: 'TOTAL DOCKETS', count: stats.total, color: '#94a3b8' },
  ];

  return (
    <div className="access-filters-container">
      {/* KPI Cards / Status Quick Select */}
      <div className="access-kpi-grid">
        {statItems.map((item) => {
          const isActive = currentStatus === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`access-kpi-card ${isActive ? 'active' : ''}`}
              onClick={() => onStatusChange(item.id)}
            >
              <div className="access-kpi-header">
                <span className="access-kpi-label">{item.label}</span>
                <span
                  className="access-kpi-indicator"
                  style={{ backgroundColor: item.color }}
                />
              </div>
              <div className="access-kpi-count" style={{ color: item.color }}>
                {item.count}
              </div>
              <div className="access-kpi-footer">
                {isActive ? '● FILTER APPLIED' : 'CLICK TO FILTER'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Search & Actions Bar */}
      <div className="access-search-bar">
        <div className="access-search-input-wrapper">
          <span className="access-search-icon">🔍</span>
          <input
            type="text"
            className="access-search-input"
            placeholder="Search by Applicant Name, Official ID (e.g. POL-MH-...), Application # (SAR-...), or Department..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="access-search-clear"
              onClick={() => onSearchChange('')}
            >
              ✕
            </button>
          )}
        </div>

        <div className="access-actions-group">
          <select
            className="access-status-select"
            value={currentStatus}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Review</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="MORE_INFORMATION_REQUIRED">Action Required</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <button
            type="button"
            className="access-refresh-btn"
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh application roster"
          >
            {isLoading ? '◌' : '⟳'} REFRESH
          </button>
        </div>
      </div>
    </div>
  );
};
