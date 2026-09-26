import { Link, useParams } from 'react-router-dom';

import NetworkAnalysisPage from '../NetworkAnalysisPage/NetworkAnalysisPage';

export default function NetworkDetailPage() {
  const { networkId } = useParams();

  if (!networkId) {
    return (
      <div>
        <h1>Network Investigation</h1>
        <p>
          No root entity was provided.
        </p>

        <Link to="/network">
          Return to Network Analysis
        </Link>
      </div>
    );
  }

  return (
    <NetworkAnalysisPage
      rootEntityId={networkId}
    />
  );
}
