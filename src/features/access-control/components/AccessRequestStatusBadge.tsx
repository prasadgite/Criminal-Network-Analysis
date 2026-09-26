import React from 'react';
import type { AccessRequestStatus } from '../types/accessControl';

interface Props {
  status: AccessRequestStatus;
  size?: 'sm' | 'md';
}

export const AccessRequestStatusBadge: React.FC<Props> = ({ status, size = 'md' }) => {
  const getMeta = () => {
    switch (status) {
      case 'PENDING':
        return {
          label: 'PENDING REVIEW',
          color: '#fbbf24',
          bg: 'rgba(251, 191, 36, 0.12)',
          border: 'rgba(251, 191, 36, 0.35)',
        };
      case 'UNDER_REVIEW':
        return {
          label: 'UNDER REVIEW',
          color: '#38bdf8',
          bg: 'rgba(56, 189, 248, 0.14)',
          border: 'rgba(56, 189, 248, 0.4)',
        };
      case 'MORE_INFORMATION_REQUIRED':
        return {
          label: 'ACTION REQUIRED',
          color: '#f97316',
          bg: 'rgba(249, 115, 22, 0.14)',
          border: 'rgba(249, 115, 22, 0.4)',
        };
      case 'APPROVED':
        return {
          label: 'APPROVED',
          color: '#4ade80',
          bg: 'rgba(74, 222, 128, 0.14)',
          border: 'rgba(74, 222, 128, 0.4)',
        };
      case 'REJECTED':
        return {
          label: 'REJECTED',
          color: '#f87171',
          bg: 'rgba(248, 113, 113, 0.14)',
          border: 'rgba(248, 113, 113, 0.4)',
        };
      case 'CANCELLED':
        return {
          label: 'CANCELLED',
          color: '#94a3b8',
          bg: 'rgba(148, 163, 184, 0.1)',
          border: 'rgba(148, 163, 184, 0.3)',
        };
      default:
        return {
          label: status,
          color: '#cbd5e1',
          bg: 'rgba(203, 213, 225, 0.1)',
          border: 'rgba(203, 213, 225, 0.3)',
        };
    }
  };

  const meta = getMeta();
  const isSm = size === 'sm';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: isSm ? '0.15rem 0.5rem' : '0.25rem 0.65rem',
        borderRadius: '3px',
        fontSize: isSm ? '0.68rem' : '0.75rem',
        fontFamily: "'IBM Plex Mono', monospace",
        fontWeight: 600,
        letterSpacing: '0.06em',
        color: meta.color,
        backgroundColor: meta.bg,
        border: `1px solid ${meta.border}`,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: isSm ? '5px' : '6px',
          height: isSm ? '5px' : '6px',
          borderRadius: '50%',
          backgroundColor: meta.color,
          boxShadow: `0 0 6px ${meta.color}`,
        }}
      />
      {meta.label}
    </span>
  );
};
