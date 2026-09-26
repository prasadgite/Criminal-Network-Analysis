import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useSearchParams } from 'react-router-dom';

import type {
  EntityRelationship,
  RelationshipType,
} from '@/domain/investigation/relationship';

import NetworkCanvas from '../../components/NetworkCanvas';
import NetworkFilters from '../../components/NetworkFilters';
import NetworkLegend from '../../components/NetworkLegend';
import RelationshipInspector from '../../components/RelationshipInspector';

import {
  networkService,
  type NetworkGraph,
  type NetworkNode,
} from '../../services/networkService';

import './NetworkAnalysisPage.css';

interface NetworkAnalysisPageProps {
  rootEntityId?: string;
}

export default function NetworkAnalysisPage({
  rootEntityId,
}: NetworkAnalysisPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlEntityId = searchParams.get('entityId') || searchParams.get('q') || rootEntityId || '';
  const urlRelationshipId = searchParams.get('relationshipId') || '';

  const [entityId, setEntityId] = useState(urlEntityId);

  const [graph, setGraph] =
    useState<NetworkGraph>({
      nodes: [],
      edges: [],
    });

  const [relationships, setRelationships] =
    useState<EntityRelationship[]>([]);

  const [totalRelationships, setTotalRelationships] =
    useState(0);

  const [selectedNode, setSelectedNode] =
    useState<NetworkNode | null>(null);

  const [selectedRelationship, setSelectedRelationship] =
    useState<EntityRelationship | null>(null);

  const [depth, setDepth] = useState(2);

  const [relationshipType, setRelationshipType] =
    useState<RelationshipType | undefined>();

  const [loading, setLoading] = useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const loadNetwork = useCallback(
    async (targetEntityId: string) => {
      if (!targetEntityId.trim()) {
        setGraph({
          nodes: [],
          edges: [],
        });

        setRelationships([]);
        setTotalRelationships(0);

        return;
      }

      setLoading(true);
      setError(null);
      setSelectedNode(null);
      setSelectedRelationship(null);

      try {
        const result =
          await networkService.getNetwork(
            targetEntityId.trim(),
            {
              depth,
              relationshipType,
              limit: 100,
            },
          );

        setGraph(result.graph);
        setRelationships(result.relationships);
        setTotalRelationships(
          result.totalRelationships,
        );
      } catch (err) {
        console.error(
          'Failed to load network',
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load network intelligence.',
        );
      } finally {
        setLoading(false);
      }
    },
    [depth, relationshipType],
  );

  useEffect(() => {
    const target = urlEntityId || rootEntityId;
    if (target) {
      setEntityId(target);
      void loadNetwork(target);
    }
  }, [urlEntityId, rootEntityId, loadNetwork]);

  // Synchronize URL relationship selection when relationships change
  useEffect(() => {
    if (urlRelationshipId && relationships.length > 0) {
      const match = relationships.find(
        (r) =>
          r.relationshipId === urlRelationshipId ||
          r.relationshipId.toLowerCase().includes(urlRelationshipId.toLowerCase()),
      );
      if (match) {
        setSelectedRelationship(match);
      }
    }
  }, [urlRelationshipId, relationships]);

  const nodeCount = graph.nodes.length;
  const edgeCount = graph.edges.length;

  const relationshipSummary = useMemo(() => {
    const summary = new Map<string, number>();

    relationships.forEach(
      (relationship) => {
        summary.set(
          relationship.relationshipType,
          (summary.get(
            relationship.relationshipType,
          ) ?? 0) + 1,
        );
      },
    );

    return [...summary.entries()].sort(
      (a, b) => b[1] - a[1],
    );
  }, [relationships]);

  function handleSearch(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSearchParams((prev) => {
      const n = new URLSearchParams(prev);
      if (entityId.trim()) {
        n.set('entityId', entityId.trim());
      } else {
        n.delete('entityId');
      }
      return n;
    }, { replace: true });

    void loadNetwork(entityId);
  }

  return (
    <div className="network-page">
      <header className="network-page__header">
        <div>
          <span className="network-page__eyebrow">
            INVESTIGATION INTELLIGENCE
          </span>

          <h1>Network Analysis</h1>

          <p>
            Explore entity connections,
            relationships, and observed
            interactions.
          </p>
        </div>

        <form
          className="network-search"
          onSubmit={handleSearch}
        >
          <input
            value={entityId}
            onChange={(event) =>
              setEntityId(event.target.value)
            }
            placeholder="Enter entity ID"
            aria-label="Root entity ID"
          />

          <button
            type="submit"
            disabled={loading || !entityId.trim()}
          >
            {loading
              ? 'Loading…'
              : 'Investigate'}
          </button>
        </form>
      </header>

      <section className="network-toolbar">
        <NetworkFilters
          depth={depth}
          relationshipType={relationshipType}
          onDepthChange={(value) => {
            setDepth(value);

            if (entityId.trim()) {
              setTimeout(
                () => void loadNetwork(entityId),
                0,
              );
            }
          }}
          onRelationshipTypeChange={(value) => {
            setRelationshipType(value);

            if (entityId.trim()) {
              setTimeout(
                () => void loadNetwork(entityId),
                0,
              );
            }
          }}
        />

        <NetworkLegend />
      </section>

      {error && (
        <div className="network-error">
          <strong>
            Network request failed
          </strong>

          <span>{error}</span>
        </div>
      )}

      <section className="network-stats">
        <div className="network-stat">
          <span>Nodes</span>
          <strong>{nodeCount}</strong>
        </div>

        <div className="network-stat">
          <span>Graph edges</span>
          <strong>{edgeCount}</strong>
        </div>

        <div className="network-stat">
          <span>Relationships</span>
          <strong>{totalRelationships}</strong>
        </div>

        <div className="network-stat">
          <span>Depth</span>
          <strong>{depth}</strong>
        </div>
      </section>

      <main className="network-layout">
        <section className="network-main">
          <div className="network-panel">
            <div className="network-panel__header">
              <div>
                <span className="network-panel__eyebrow">
                  CONNECTION GRAPH
                </span>

                <h2>
                  {entityId || 'No entity selected'}
                </h2>
              </div>

              {loading && (
                <span className="network-loading">
                  Updating graph…
                </span>
              )}
            </div>

            <NetworkCanvas
              nodes={graph.nodes}
              edges={graph.edges}
              selectedNodeId={
                selectedNode?.id
              }
              onNodeSelect={(node) => {
                setSelectedNode(node);

                const relationship =
                  relationships.find(
                    (item) =>
                      item.source.entityId ===
                        node.id ||
                      item.target.entityId ===
                        node.id,
                  );

                setSelectedRelationship(
                  relationship ?? null,
                );
              }}
            />
          </div>

          <div className="network-panel">
            <div className="network-panel__header">
              <div>
                <span className="network-panel__eyebrow">
                  RELATIONSHIPS
                </span>

                <h2>
                  Observed connections
                </h2>
              </div>
            </div>

            {!relationships.length ? (
              <div className="network-empty">
                No relationships found for the
                selected entity and filters.
              </div>
            ) : (
              <div className="relationship-list">
                {relationships.map(
                  (relationship) => (
                    <button
                      type="button"
                      key={
                        relationship.relationshipId
                      }
                      className={[
                        'relationship-row',
                        selectedRelationship
                          ?.relationshipId ===
                        relationship.relationshipId
                          ? 'relationship-row--selected'
                          : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() =>
                        setSelectedRelationship(
                          relationship,
                        )
                      }
                    >
                      <div>
                        <strong>
                          {relationship.source.label}
                        </strong>

                        <span>
                          {relationship.relationshipType.replaceAll(
                            '_',
                            ' ',
                          )}
                        </span>

                        <strong>
                          {relationship.target.label}
                        </strong>
                      </div>

                      <span className="relationship-confidence">
                        {Math.round(
                          relationship.confidence *
                            100,
                        )}
                        %
                      </span>
                    </button>
                  ),
                )}
              </div>
            )}
          </div>
        </section>

        <section className="network-side">
          <RelationshipInspector
            relationship={
              selectedRelationship
            }
          />

          <div className="network-panel network-summary">
            <div className="network-panel__header">
              <div>
                <span className="network-panel__eyebrow">
                  SUMMARY
                </span>

                <h2>
                  Relationship mix
                </h2>
              </div>
            </div>

            {relationshipSummary.length ===
            0 ? (
              <div className="network-empty">
                No relationship summary available.
              </div>
            ) : (
              <div className="network-summary__list">
                {relationshipSummary.map(
                  ([type, count]) => (
                    <div
                      key={type}
                      className="network-summary__row"
                    >
                      <span>
                        {type.replaceAll(
                          '_',
                          ' ',
                        )}
                      </span>

                      <strong>{count}</strong>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
