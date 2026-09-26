import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { entityDomainService } from "@/domain/investigation/services/entityDomainService";
import type {
  InvestigationEntity,
  InvestigationEntityType,
} from "@/domain/investigation/entity";
import {
  networkPath,
  timelinePath,
} from "@/domain/investigation/context";

export default function EntityDetailPage() {
  const { entityType, entityId } = useParams<{
    entityType?: string;
    entityId?: string;
  }>();

  const [entity, setEntity] = useState<InvestigationEntity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!entityId) {
      setError("Entity ID is missing.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadEntity() {
      setLoading(true);
      setError(null);

      try {
        let loaded: InvestigationEntity | null = null;
        if (entityType) {
          loaded = await entityDomainService.getById(
            entityType as InvestigationEntityType,
            entityId!,
          );
        } else {
          // If entityType is not specified in route, search by ID
          const searchResult = await entityDomainService.search({
            query: entityId,
            limit: 5,
          });
          loaded =
            searchResult.data.find((e) => e.entityId === entityId) ||
            searchResult.data[0] ||
            null;
        }

        if (cancelled) return;
        setEntity(loaded);
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to load entity details:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load entity dossier.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadEntity();
    return () => {
      cancelled = true;
    };
  }, [entityType, entityId]);

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <header style={{ marginBottom: "24px" }}>
        <p style={{ margin: "0 0 8px 0" }}>
          <Link
            to="/entities"
            style={{
              color: "#38bdf8",
              textDecoration: "none",
              fontSize: "0.85rem",
              fontWeight: 600,
            }}
          >
            ← Back to Entities
          </Link>
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span
            style={{
              padding: "4px 10px",
              borderRadius: "4px",
              background: "#1e293b",
              border: "1px solid #334155",
              color: "#94a3b8",
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.05em",
            }}
          >
            {(entity?.entityType || entityType || "ENTITY").toUpperCase()}
          </span>
          <h1 style={{ margin: 0, fontSize: "1.75rem", color: "#f8fafc" }}>
            {entity?.displayName || entityId}
          </h1>
        </div>
        <p style={{ color: "#64748b", margin: "4px 0 0 0", fontFamily: "monospace" }}>
          Target Identifier: {entityId}
        </p>
      </header>

      {/* Cross-Investigation Action Navigation Bar */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          padding: "16px",
          background: "#0f172a",
          border: "1px solid #1e293b",
          borderRadius: "8px",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}
      >
        <Link
          to={networkPath({ entityId })}
          style={{
            padding: "8px 16px",
            background: "#0284c7",
            color: "#ffffff",
            borderRadius: "6px",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: "0.85rem",
          }}
        >
          🕸 Network Graph →
        </Link>
        <Link
          to={timelinePath({ entityId })}
          style={{
            padding: "8px 16px",
            background: "#1e293b",
            border: "1px solid #334155",
            color: "#38bdf8",
            borderRadius: "6px",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: "0.85rem",
          }}
        >
          ⚡ Entity Timeline →
        </Link>
      </div>

      {loading && (
        <p style={{ color: "#94a3b8" }}>Querying NeonDB entity intelligence...</p>
      )}

      {error && !loading && (
        <div
          style={{
            padding: "16px",
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid #ef4444",
            borderRadius: "6px",
            color: "#fca5a5",
          }}
        >
          {error}
        </div>
      )}

      {entity && !loading && (
        <div style={{ display: "grid", gap: "20px" }}>
          <section
            style={{
              padding: "20px",
              background: "#0f172a",
              border: "1px solid #1e293b",
              borderRadius: "8px",
            }}
          >
            <h2
              style={{
                fontSize: "1rem",
                color: "#e2e8f0",
                borderBottom: "1px solid #1e293b",
                paddingBottom: "10px",
                marginTop: 0,
              }}
            >
              Entity Summary & Identity
            </h2>
            <dl
              style={{
                display: "grid",
                gridTemplateColumns: "200px 1fr",
                rowGap: "10px",
                margin: "16px 0 0 0",
              }}
            >
              <dt style={{ color: "#64748b", fontSize: "0.85rem" }}>Canonical ID:</dt>
              <dd style={{ color: "#f8fafc", fontFamily: "monospace", margin: 0 }}>
                {entity.entityId}
              </dd>

              <dt style={{ color: "#64748b", fontSize: "0.85rem" }}>Classification:</dt>
              <dd style={{ color: "#f8fafc", margin: 0 }}>
                {entity.entityType.toUpperCase()}
              </dd>

              <dt style={{ color: "#64748b", fontSize: "0.85rem" }}>Operational Status:</dt>
              <dd style={{ color: "#38bdf8", margin: 0, fontWeight: 600 }}>
                {(entity.status ?? "active").toUpperCase()}
              </dd>

              <dt style={{ color: "#64748b", fontSize: "0.85rem" }}>Display Name:</dt>
              <dd style={{ color: "#f8fafc", margin: 0 }}>{entity.displayName}</dd>
            </dl>
          </section>

          {/* Source Provenance References */}
          {entity.sourceReferences && entity.sourceReferences.length > 0 && (
            <section
              style={{
                padding: "20px",
                background: "#0f172a",
                border: "1px solid #1e293b",
                borderRadius: "8px",
              }}
            >
              <h2
                style={{
                  fontSize: "1rem",
                  color: "#e2e8f0",
                  borderBottom: "1px solid #1e293b",
                  paddingBottom: "10px",
                  marginTop: 0,
                }}
              >
                Source Provenance ({entity.sourceReferences.length})
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "12px",
                  marginTop: "12px",
                }}
              >
                {entity.sourceReferences.map((ref, idx) => (
                  <div
                    key={`${ref.sourceDataset}-${ref.sourceRecordId}-${idx}`}
                    style={{
                      padding: "10px 14px",
                      background: "#090d16",
                      border: "1px solid #1e293b",
                      borderRadius: "6px",
                    }}
                  >
                    <div style={{ color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase" }}>
                      Dataset: {ref.sourceDataset}
                    </div>
                    <div
                      style={{
                        color: "#e2e8f0",
                        fontFamily: "monospace",
                        fontSize: "0.85rem",
                        marginTop: "4px",
                        wordBreak: "break-all",
                      }}
                    >
                      Record: {ref.sourceRecordId}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
