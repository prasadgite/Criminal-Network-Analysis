import React, { useState } from 'react';
import type {
  AccessRequestSummary,
  AssignedRole,
} from '../types/accessControl';
import { AccessRequestStatusBadge } from './AccessRequestStatusBadge';
import { ApproveModal, RejectModal, RequestInfoModal } from './ReviewModals';

interface Props {
  application: AccessRequestSummary | null;
  onClose: () => void;
  onAction: (
    action: 'APPROVE' | 'REJECT' | 'REQUEST_INFORMATION' | 'UNDER_REVIEW',
    role?: AssignedRole,
    notes?: string,
  ) => Promise<void>;
  isActionLoading: boolean;
}

export const AccessRequestInspector: React.FC<Props> = ({
  application,
  onClose,
  onAction,
  isActionLoading,
}) => {
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isReqInfoOpen, setIsReqInfoOpen] = useState(false);

  if (!application) return null;

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return '—';
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

  const handleStartReview = async () => {
    await onAction('UNDER_REVIEW');
  };

  const handleConfirmApprove = async (role: AssignedRole, notes?: string) => {
    await onAction('APPROVE', role, notes);
    setIsApproveOpen(false);
  };

  const handleConfirmReject = async (reason: string) => {
    await onAction('REJECT', undefined, reason);
    setIsRejectOpen(false);
  };

  const handleConfirmReqInfo = async (notes: string) => {
    await onAction('REQUEST_INFORMATION', undefined, notes);
    setIsReqInfoOpen(false);
  };

  return (
    <>
      <div className="access-inspector-overlay" onClick={onClose} />
      <aside className="access-inspector-drawer">
        {/* Header */}
        <div className="inspector-header">
          <div className="inspector-title-area">
            <span className="inspector-pretitle">CYBER CELL VERIFICATION DOSSIER</span>
            <h2 className="inspector-app-num">{application.applicationNumber}</h2>
          </div>
          <div className="inspector-header-right">
            <AccessRequestStatusBadge status={application.status} size="md" />
            <button
              type="button"
              className="inspector-close-btn"
              onClick={onClose}
              title="Close dossier"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="inspector-body">
          {/* Section 01: Identity */}
          <div className="inspector-section">
            <div className="inspector-section-header">
              <span className="sec-num">01</span>
              <span className="sec-title">OFFICIAL IDENTITY</span>
            </div>
            <div className="inspector-data-grid">
              <div className="inspector-data-item">
                <span className="data-label">FULL LEGAL NAME</span>
                <span className="data-val bold">{application.fullName}</span>
              </div>
              <div className="inspector-data-item">
                <span className="data-label">OFFICIAL GOVERNMENT ID</span>
                <span className="data-val mono highlight">{application.officialId}</span>
              </div>
              <div className="inspector-data-item">
                <span className="data-label">OFFICIAL EMAIL</span>
                <span className="data-val mono">{application.officialEmail}</span>
              </div>
              <div className="inspector-data-item">
                <span className="data-label">SECURE PHONE</span>
                <span className="data-val mono">{application.officialPhone}</span>
              </div>
            </div>
          </div>

          {/* Section 02: Affiliation */}
          <div className="inspector-section">
            <div className="inspector-section-header">
              <span className="sec-num">02</span>
              <span className="sec-title">OFFICIAL AFFILIATION</span>
            </div>
            <div className="inspector-data-grid">
              <div className="inspector-data-item">
                <span className="data-label">ORGANIZATION</span>
                <span className="data-val">{application.organization}</span>
              </div>
              <div className="inspector-data-item">
                <span className="data-label">DEPARTMENT / WING</span>
                <span className="data-val">{application.department}</span>
              </div>
              <div className="inspector-data-item">
                <span className="data-label">DESIGNATION</span>
                <span className="data-val">{application.designation}</span>
              </div>
              <div className="inspector-data-item">
                <span className="data-label">OFFICIAL RANK / LEVEL</span>
                <span className="data-val">{application.rank || 'Standard'}</span>
              </div>
              <div className="inspector-data-item">
                <span className="data-label">JURISDICTION</span>
                <span className="data-val">{application.jurisdiction}</span>
              </div>
              <div className="inspector-data-item">
                <span className="data-label">OFFICE / FIELD UNIT</span>
                <span className="data-val">{application.officeUnit || 'Not Specified'}</span>
              </div>
            </div>
          </div>

          {/* Section 03: Supervisory Authorization */}
          <div className="inspector-section">
            <div className="inspector-section-header">
              <span className="sec-num">03</span>
              <span className="sec-title">SUPERVISORY AUTHORIZATION</span>
            </div>
            <div className="inspector-data-grid">
              <div className="inspector-data-item">
                <span className="data-label">SUPERVISING OFFICER</span>
                <span className="data-val bold">{application.supervisorName}</span>
              </div>
              <div className="inspector-data-item">
                <span className="data-label">SUPERVISOR OFFICIAL ID</span>
                <span className="data-val mono highlight">{application.supervisorId}</span>
              </div>
            </div>
          </div>

          {/* Section 04: Purpose */}
          <div className="inspector-section">
            <div className="inspector-section-header">
              <span className="sec-num">04</span>
              <span className="sec-title">OPERATIONAL PURPOSE</span>
            </div>
            <div className="inspector-purpose-box">
              <p>{application.purpose}</p>
            </div>
          </div>

          {/* Section 05: Verification Audit Trail */}
          <div className="inspector-section">
            <div className="inspector-section-header">
              <span className="sec-num">05</span>
              <span className="sec-title">VERIFICATION & AUDIT TRAIL</span>
            </div>
            <div className="inspector-data-grid">
              <div className="inspector-data-item">
                <span className="data-label">APPLICATION SUBMITTED</span>
                <span className="data-val mono">{formatDate(application.submittedAt)}</span>
              </div>
              <div className="inspector-data-item">
                <span className="data-label">LAST REVIEWED BY</span>
                <span className="data-val mono">{application.reviewedBy || 'Pending Assignment'}</span>
              </div>
              <div className="inspector-data-item">
                <span className="data-label">LAST REVIEW TIMESTAMP</span>
                <span className="data-val mono">{formatDate(application.reviewedAt)}</span>
              </div>
              {application.reviewNotes && (
                <div className="inspector-data-item full-width">
                  <span className="data-label">OFFICIAL REVIEW REMARKS</span>
                  <div className="inspector-notes-box">{application.reviewNotes}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="inspector-footer">
          {application.status === 'APPROVED' ? (
            <div className="inspector-status-banner approved">
              <span>✓</span>
              <div>
                <strong>Account Provisioned</strong>
                <p>Status: PENDING_ACTIVATION (Awaiting officer first credential reset)</p>
              </div>
            </div>
          ) : application.status === 'REJECTED' ? (
            <div className="inspector-status-banner rejected">
              <span>✕</span>
              <div>
                <strong>Application Rejected</strong>
                <p>Authorization denied by Cyber Cell Verification team.</p>
              </div>
            </div>
          ) : (
            <div className="inspector-action-bar">
              {application.status === 'PENDING' && (
                <button
                  type="button"
                  className="inspector-btn under-review"
                  onClick={handleStartReview}
                  disabled={isActionLoading}
                >
                  START REVIEW
                </button>
              )}
              <button
                type="button"
                className="inspector-btn req-info"
                onClick={() => setIsReqInfoOpen(true)}
                disabled={isActionLoading}
              >
                REQUEST INFO
              </button>
              <button
                type="button"
                className="inspector-btn reject"
                onClick={() => setIsRejectOpen(true)}
                disabled={isActionLoading}
              >
                REJECT
              </button>
              <button
                type="button"
                className="inspector-btn approve"
                onClick={() => setIsApproveOpen(true)}
                disabled={isActionLoading}
              >
                ✓ APPROVE & PROVISION →
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Action Modals */}
      <ApproveModal
        application={application}
        isOpen={isApproveOpen}
        onClose={() => setIsApproveOpen(false)}
        onConfirm={handleConfirmApprove}
        isSubmitting={isActionLoading}
      />
      <RejectModal
        application={application}
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        onConfirm={handleConfirmReject}
        isSubmitting={isActionLoading}
      />
      <RequestInfoModal
        application={application}
        isOpen={isReqInfoOpen}
        onClose={() => setIsReqInfoOpen(false)}
        onConfirm={handleConfirmReqInfo}
        isSubmitting={isActionLoading}
      />
    </>
  );
};
