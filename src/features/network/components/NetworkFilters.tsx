import type { RelationshipType } from '@/domain/investigation/relationship';

interface NetworkFiltersProps {
  depth: number;
  relationshipType?: RelationshipType;
  onDepthChange: (depth: number) => void;
  onRelationshipTypeChange: (
    type?: RelationshipType,
  ) => void;
}

const relationshipTypes = [
  'communicates_with',
  'transacted_with',
  'registered_to',
  'owns',
];

export default function NetworkFilters({
  depth,
  relationshipType,
  onDepthChange,
  onRelationshipTypeChange,
}: NetworkFiltersProps) {
  return (
    <div className="network-filters">
      <label className="network-filter">
        <span>Graph depth</span>

        <select
          value={depth}
          onChange={(event) =>
            onDepthChange(
              Number(event.target.value),
            )
          }
        >
          <option value={1}>1 hop</option>
          <option value={2}>2 hops</option>
          <option value={3}>3 hops</option>
        </select>
      </label>

      <label className="network-filter">
        <span>Relationship</span>

        <select
          value={relationshipType ?? ''}
          onChange={(event) => {
            const value = event.target.value;

            onRelationshipTypeChange(
              value
                ? (value as RelationshipType)
                : undefined,
            );
          }}
        >
          <option value="">
            All relationships
          </option>

          {relationshipTypes.map((type) => (
            <option key={type} value={type}>
              {type.replaceAll('_', ' ')}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
