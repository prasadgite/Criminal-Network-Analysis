import { Outlet } from "react-router-dom";

import "./InvestigationLayout.css";

export default function InvestigationLayout() {
  return (
    <section className="investigation-layout">
      <div className="investigation-layout__content">
        <Outlet />
      </div>
    </section>
  );
}
