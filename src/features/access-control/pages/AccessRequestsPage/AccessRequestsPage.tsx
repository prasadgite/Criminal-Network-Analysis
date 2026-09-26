import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/features/auth/hooks';
import { accessControlService } from '../../services/accessControlService';
import type {
  AccessRequestSummary,
  AccessRequestStats,
  AssignedRole,
} from '../../types/accessControl';
import { AccessRequestFilters } from '../../components/AccessRequestFilters';
import { AccessRequestTable } from '../../components/AccessRequestTable';
import { AccessRequestInspector } from '../../components/AccessRequestInspector';
import './AccessRequestsPage.css';

export const AccessRequestsPage: React.FC = () => {
  const { user } = useAuth();

  const [applications, setApplications] = useState<AccessRequestSummary[]>([]);
  const [stats, setStats] = useState<AccessRequestStats>({
    pending: 0,
    underReview: 0,
    approved: 0,
    moreInfoRequired: 0,
    rejected: 0,
    total: 0,
  });

  const [selectedApp, setSelectedApp] = useState<AccessRequestSummary | null>(null);
  const [currentStatus, setCurrentStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [bannerMessage, setBannerMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const fetchApplications = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await accessControlService.list({
        status: currentStatus,
        search: searchTerm,
        limit: 50,
      });

      setApplications(res.data);
      setStats(res.stats);

      // If an application was selected, update its local copy
      if (selectedApp) {
        const updated = res.data.find((a) => a.id === selectedApp.id);
        if (updated) {
          setSelectedApp(updated);
        }
      }
    } catch (err: any) {
      setBannerMessage({
        type: 'error',
        text: err.message || 'Failed to load access applications.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentStatus, searchTerm, selectedApp?.id]);

  useEffect(() => {
    fetchApplications();
  }, [currentStatus]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchApplications();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleAction = async (
    action: 'APPROVE' | 'REJECT' | 'REQUEST_INFORMATION' | 'UNDER_REVIEW',
    role?: AssignedRole,
    notes?: string,
  ) => {
    if (!selectedApp) return;

    try {
      setIsActionLoading(true);
      const res = await accessControlService.review(selectedApp.id.toString(), {
        action,
        role,
        reviewNotes: notes,
      });

      setBannerMessage({
        type: 'success',
        text: res.message,
      });

      // Refresh applications and inspector
      setSelectedApp(res.accessRequest);
      await fetchApplications();
    } catch (err: any) {
      setBannerMessage({
        type: 'error',
        text: err.message || 'Failed to process verification action.',
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="access-page-container">
      {/* Top Classification & Context Header */}
      <header className="access-page-header">
        <div className="access-header-left">
          <div className="access-header-badge">
            <span className="dot" /> CYBER SECURITY COMMAND • VERIFICATION ENCLAVE
          </div>
          <h1 className="access-page-title">Cyber Cell Access Verification</h1>
          <p className="access-page-subtitle">
            Manual identity authorization and role-based credential provisioning center for SANDHAAN.
          </p>
        </div>

        <div className="access-header-right">
          <div className="access-officer-pill">
            <span className="officer-role">CLEARANCE: {user?.role || 'CYBER_CELL_ADMIN'}</span>
            <span className="officer-name">{user?.displayName || 'Verification Officer'}</span>
            <span className="officer-id">{user?.userId || 'CYBER-ADMIN-01'}</span>
          </div>
        </div>
      </header>

      {/* Action Notification Banner */}
      {bannerMessage && (
        <div className={`access-banner ${bannerMessage.type}`}>
          <span className="banner-icon">
            {bannerMessage.type === 'success' ? '✓' : '⚠️'}
          </span>
          <span className="banner-text">{bannerMessage.text}</span>
          <button
            type="button"
            className="banner-close"
            onClick={() => setBannerMessage(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Workspace */}
      <main className="access-workspace">
        <AccessRequestFilters
          stats={stats}
          currentStatus={currentStatus}
          onStatusChange={(status) => setCurrentStatus(status)}
          searchTerm={searchTerm}
          onSearchChange={(search) => setSearchTerm(search)}
          onRefresh={fetchApplications}
          isLoading={isLoading}
        />

        <div className="access-content-area">
          <AccessRequestTable
            applications={applications}
            selectedId={selectedApp?.id || null}
            onSelect={(app) => setSelectedApp(app)}
            isLoading={isLoading}
          />
        </div>
      </main>

      {/* Inspector Slide-over Drawer */}
      <AccessRequestInspector
        application={selectedApp}
        onClose={() => setSelectedApp(null)}
        onAction={handleAction}
        isActionLoading={isActionLoading}
      />
    </div>
  );
};

export default AccessRequestsPage;
