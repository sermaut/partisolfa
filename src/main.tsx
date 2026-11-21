import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.tsx";
import "./index.css";

// Automatically install new app versions and reload when the new
// service worker takes control. This also works for installed PWAs.
registerSW({
  immediate: true,
  onRegisteredSW(_serviceWorkerUrl, registration) {
    if (!registration) return;

    // Keep already-open tabs informed about releases without requiring
    // the user to close and reopen the app.
    const checkForUpdates = () => {
      if (document.visibilityState === "visible" && navigator.onLine) {
        void registration.update().catch(() => {
          // A temporary network failure should not interrupt the app.
        });
      }
    };

    window.setInterval(checkForUpdates, 5 * 60 * 1000);
    window.addEventListener("online", checkForUpdates);
    document.addEventListener("visibilitychange", checkForUpdates);
  },
});

createRoot(document.getElementById("root")!).render(<App />);
