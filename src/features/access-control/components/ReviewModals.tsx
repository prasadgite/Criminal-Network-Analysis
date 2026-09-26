import React, { useState } from 'react';
import type {
  AccessRequestSummary,
  AssignedRole,
} from '../types/accessControl';

interface ApproveModalProps {
  application: AccessRequestSummary;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (role: AssignedRole, notes?: string) => Promise<void>;
  isSubmitting: boolean;
}

export const ApproveModal: React.FC<ApproveModalProps> = ({
  application,
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
}) => {
  const [selectedRole, setSelectedRole] = useState<AssignedRole>('INVESTIGATOR');
  const [notes, setNotes] = useState(
    'Identity verified against official departmental records. Security clearance confirmed.',
  );

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirm(selectedRole, notes.trim());
  };

  return (
    <div className="access-modal-overlay">
      <div className="access-modal-card">
        <div className="access-modal-header">
          <div className="access-modal-badge approve">CYBER CELL AUTHORIZATION</div>
          <button type="button" className="access-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <h3 className="access-modal-title">Approve Access & Provision Account</h3>
        <p className="access-modal-subtitle">
          Confirming this action will provision an official SANDHAAN identity in the secure ledger.
        </p>

        <div className="access-modal-docket-summary">
          <div className="access-docket-item">
            <span className="label">APPLICATION</span>
            <span className="val highlight">{application.applicationNumber}</span>
          </div>
          <div className="access-docket-item">
            <span className="label">OFFICER</span>
            <span className="val">{application.fullName}</span>
          </div>
          <div className="access-docket-item">
            <span className="label">OFFICIAL ID</span>
            <span className="val">{application.officialId}</span>
          </div>
          <div className="access-docket-item">
            <span className="label">DEPARTMENT</span>
            <span className="val">{application.department}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="access-modal-form">
          <div className="access-form-field">
            <label className="access-field-label">
              ASSIGN SYSTEM ROLE <span className="req">*</span>
            </label>
            <select
              className="access-field-select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as AssignedRole)}
            >
              <option value="INVESTIGATOR">INVESTIGATOR (Standard Field Investigator)</option>
              <option value="SENIOR_INVESTIGATOR">SENIOR_INVESTIGATOR (Lead Case Officer)</option>
              <option value="ANALYST">ANALYST (Intelligence & Data Analyst)</option>
              <option value="AUDITOR">AUDITOR (Oversight & Compliance Inspector)</option>
              <option value="CYBER_CELL_ADMIN">CYBER_CELL_ADMIN (Cyber Cell Administrator)</option>
            </select>
          </div>

          <div className="access-form-field">
            <label className="access-field-label">VERIFICATION AUDIT NOTES</label>
            <textarea
              className="access-field-textarea"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter official verification remarks or dispatch order reference..."
            />
          </div>

          <div className="access-modal-warning">
            <span className="warning-icon">ℹ️</span>
            <div>
              <strong>Government Provisioning Policy:</strong>
              <p>
                Account will be created in <code>PENDING_ACTIVATION</code> state with temporary credentials.
                The officer must complete first-time credential activation before platform access is granted.
              </p>
            </div>
          </div>

          <div className="access-modal-actions">
            <button
              type="button"
              className="access-btn-cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="access-btn-approve"
              disabled={isSubmitting}
            >
              {isSubmitting ? '◌ PROVISIONING...' : '✓ CONFIRM APPROVAL & PROVISION →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface RejectModalProps {
  application: AccessRequestSummary;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  isSubmitting: boolean;
}

export const RejectModal: React.FC<RejectModalProps> = ({
  application,
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('A mandatory official reason for rejection must be provided.');
      return;
    }
    setError('');
    await onConfirm(reason.trim());
  };

  return (
    <div className="access-modal-overlay">
      <div className="access-modal-card">
        <div className="access-modal-header">
          <div className="access-modal-badge reject">AUTHORIZATION REJECTION</div>
          <button type="button" className="access-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <h3 className="access-modal-title">Reject Access Request</h3>
        <p className="access-modal-subtitle">
          Decline official access for docket <strong>{application.applicationNumber}</strong> ({application.fullName}).
        </p>

        <form onSubmit={handleSubmit} className="access-modal-form">
          <div className="access-form-field">
            <label className="access-field-label">
              MANDATORY REJECTION REASON <span className="req">*</span>
            </label>
            <textarea
              className="access-field-textarea"
              rows={4}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              placeholder="Specify ground for rejection (e.g. Ineligible jurisdiction, unverified supervisory order, non-conforming official ID)..."
            />
            {error && <span className="access-field-error">{error}</span>}
          </div>

          <div className="access-modal-warning danger">
            <span className="warning-icon">⚠️</span>
            <div>
              <strong>Audit Notice:</strong>
              <p>
                This action is permanently logged in the audit ledger. The applicant will be notified of this reason
                when checking application status.
              </p>
            </div>
          </div>

          <div className="access-modal-actions">
            <button
              type="button"
              className="access-btn-cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="access-btn-reject"
              disabled={isSubmitting}
            >
              {isSubmitting ? '◌ PROCESSING...' : '✕ CONFIRM REJECTION'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface RequestInfoModalProps {
  application: AccessRequestSummary;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notes: string) => Promise<void>;
  isSubmitting: boolean;
}

export const RequestInfoModal: React.FC<RequestInfoModalProps> = ({
  application,
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
}) => {
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) {
      setError('Please specify the documents or clarifications required from the applicant.');
      return;
    }
    setError('');
    await onConfirm(details.trim());
  };

  return (
    <div className="access-modal-overlay">
      <div className="access-modal-card">
        <div className="access-modal-header">
          <div className="access-modal-badge info">ACTION REQUIRED</div>
          <button type="button" className="access-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <h3 className="access-modal-title">Request Additional Information</h3>
        <p className="access-modal-subtitle">
          Request further documentation or supervisory confirmation for <strong>{application.applicationNumber}</strong>.
        </p>

        <form onSubmit={handleSubmit} className="access-modal-form">
          <div className="access-form-field">
            <label className="access-field-label">
              INFORMATION / CLARIFICATION REQUIRED <span className="req">*</span>
            </label>
            <textarea
              className="access-field-textarea"
              rows={4}
              value={details}
              onChange={(e) => {
                setDetails(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Please provide official office order endorsement from the Zonal Joint Director, or clear copy of Ministry authorization letter..."
            />
            {error && <span className="access-field-error">{error}</span>}
          </div>

          <div className="access-modal-actions">
            <button
              type="button"
              className="access-btn-cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="access-btn-reqinfo"
              disabled={isSubmitting}
            >
              {isSubmitting ? '◌ TRANSMITTING...' : '✉ TRANSMIT INFORMATION REQUEST'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
