/**
 * @file main.jsx
 * @description Application client bootstrap entry point initializing global styles, service worker teardown, Lenis smooth scrolling, Redux store, and theme providers.
 * @architecture Entry point for Vite Single Page Application. Wraps App with Redux Provider, MUI ThemeProvider, React Toastify, and ClickSpark UI wrapper.
 * @agent_note Lenis smooth scrolling has prevent rules for modals, dialogs, and containers tagged with [data-lenis-prevent]. Stale service workers are purged on mount to ensure clean asset delivery in development and staging.
 */

// import { StrictMode } from "react";
import "./config.js";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import 'lenis/dist/lenis.css'
import { ThemeProvider } from "./theme/ThemeProvider.jsx";
import { ToastContainer } from "react-toastify";
import store from "@/redux/store";
import { Provider } from "react-redux";
import ClickSpark from "@/components/ui/ClickSpark";
import Lenis from 'lenis'

// Automatically unregister any stale service workers (e.g. from other projects sharing localhost)
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister().then((unregistered) => {
        if (unregistered) {
          console.info("[SW] Unregistered stale service worker:", registration.scope);
        }
      });
    }
  });
}

/**
 * @desc Global Lenis smooth scrolling instance configured with automatic requestAnimationFrame and selective scroll containment for modals and dialogs.
 * @type {Lenis}
 */
const lenis = new Lenis({
  autoRaf: true,
  prevent: (node) => {
    return (
      document.body.style.overflow === "hidden" ||
      Boolean(
        node?.closest?.(
          '.MuiModal-root, .MuiDialog-root, [role="dialog"], [data-lenis-prevent], .MuiTableContainer-root, [data-scrollable]'
        )
      )
    );
  },
});

// Listen for the scroll event and log the event data
// lenis.on('scroll', (e) => {
//   // console.log(e);
// });

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <ThemeProvider>
      <ToastContainer />
      <ClickSpark
        sparkColor='#ca0019'
        sparkSize={20}
        sparkRadius={45}
        sparkCount={8}
        duration={500}
      >
        <App />
      </ClickSpark>
    </ThemeProvider>
  </Provider>
);
