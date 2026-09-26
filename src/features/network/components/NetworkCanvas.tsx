import type {
  NetworkEdge,
  NetworkNode,
} from '../services/networkService';

interface NetworkCanvasProps {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  selectedNodeId?: string;
  onNodeSelect?: (node: NetworkNode) => void;
}

function getNodePosition(
  index: number,
  total: number,
  root: boolean,
) {
  if (root) {
    return {
      x: 50,
      y: 50,
    };
  }

  const radius = 34;
  const angle =
    ((index - 1) / Math.max(total - 1, 1)) *
    Math.PI *
    2;

  return {
    x: 50 + Math.cos(angle) * radius,
    y: 50 + Math.sin(angle) * radius,
  };
}

export default function NetworkCanvas({
  nodes,
  edges,
  selectedNodeId,
  onNodeSelect,
}: NetworkCanvasProps) {
  const nodePositions = new Map(
    nodes.map((node, index) => [
      node.id,
      getNodePosition(
        index,
        nodes.length,
        Boolean(node.isRoot),
      ),
    ]),
  );

  return (
    <div className="network-canvas">
      <svg
        className="network-canvas__svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {edges.map((edge) => {
          const source = nodePositions.get(edge.source);
          const target = nodePositions.get(edge.target);

          if (!source || !target) {
            return null;
          }

          return (
            <line
              key={edge.id}
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              className="network-edge"
            />
          );
        })}
      </svg>

      {nodes.map((node, index) => {
        const position = getNodePosition(
          index,
          nodes.length,
          Boolean(node.isRoot),
        );

        const selected =
          selectedNodeId === node.id;

        return (
          <button
            key={node.id}
            type="button"
            className={[
              'network-node',
              node.isRoot
                ? 'network-node--root'
                : '',
              selected
                ? 'network-node--selected'
                : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
            }}
            onClick={() => onNodeSelect?.(node)}
            title={`${node.type}: ${node.label}`}
          >
            <span className="network-node__type">
              {node.type}
            </span>

            <span className="network-node__label">
              {node.label}
            </span>
          </button>
        );
      })}

      {!nodes.length && (
        <div className="network-canvas__empty">
          No network nodes available.
        </div>
      )}
    </div>
  );
}
