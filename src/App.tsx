import { RouterProvider } from "react-router-dom";

import { AuthProvider } from "@/features/auth/hooks";
import { router } from "./routes";

export function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
