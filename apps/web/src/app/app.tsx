import { BrowserRouter } from "react-router-dom";
import { IosInstallHint } from "@/components/pwa/ios-install-hint";
import { AppRouter } from "@/routes/router";

export function App() {
  return (
    <BrowserRouter>
      <AppRouter />
      <IosInstallHint />
    </BrowserRouter>
  );
}
