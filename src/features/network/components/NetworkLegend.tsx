const entityTypes = [
  'person',
  'phone',
  'vehicle',
  'bank_account',
  'location',
];

export default function NetworkLegend() {
  return (
    <div className="network-legend">
      <span className="network-legend__title">
        Entity types
      </span>

      {entityTypes.map((type) => (
        <span
          key={type}
          className="network-legend__item"
        >
          <span
            className={`network-legend__dot network-legend__dot--${type}`}
          />

          {type.replaceAll('_', ' ')}
        </span>
      ))}
    </div>
  );
}
