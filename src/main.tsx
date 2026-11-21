import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.tsx";
import "./index.css";

const BUILD_VERSION_KEY = "partisolfa-build-version";

async function checkPublishedVersion() {
  if (!navigator.onLine) return;

  try {
    // A unique query and no-store prevent the browser/CDN from reusing
    // an old version marker.
    const response = await fetch(`/version.json?check=${Date.now()}`, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    });
    if (!response.ok) return;

    const data: { version?: string } = await response.json();
    if (!data.version) return;

    const currentVersion = localStorage.getItem(BUILD_VERSION_KEY);
    if (currentVersion && currentVersion !== data.version) {
      // The new deployment is live. A normal navigation will now request
      // the latest HTML and hashed assets from the server.
      localStorage.setItem(BUILD_VERSION_KEY, data.version);
      window.location.reload();
      return;
    }

    localStorage.setItem(BUILD_VERSION_KEY, data.version);
  } catch {
    // Offline or temporary network errors must not block the application.
  }
}

// Register and check the service worker immediately on every app visit.
registerSW({
  immediate: true,
  onRegisteredSW(_serviceWorkerUrl, registration) {
    if (!registration) return;

    const checkForUpdates = () => {
      if (document.visibilityState === "visible" && navigator.onLine) {
        void registration.update().catch(() => {});
        void checkPublishedVersion();
      }
    };

    void registration.update().catch(() => {});
    void checkPublishedVersion();
    window.setInterval(checkForUpdates, 60 * 1000);
    window.addEventListener("online", checkForUpdates);
    document.addEventListener("visibilitychange", checkForUpdates);
  },
});

createRoot(document.getElementById("root")!).render(<App />);
