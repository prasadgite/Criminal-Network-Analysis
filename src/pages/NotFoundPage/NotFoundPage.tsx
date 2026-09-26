import { Link } from "react-router-dom";
import { routes } from "@/routes/routePaths";

export default function NotFoundPage() {
  return (
    <div style={{ padding: "2rem", color: "#dce8f6" }}>
      <h1>404</h1>
      <p>The requested SANDHAAN page could not be found.</p>
      <Link to={routes.dashboard} style={{ color: "#438cff" }}>
        Return to Dashboard
      </Link>
    </div>
  );
}
