// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import 'lenis/dist/lenis.css'
import { ThemeProvider } from "./theme/ThemeProvider.jsx";
import { ToastContainer } from "react-toastify";
import store from "@/redux/store";
import { Provider } from "react-redux";
import ClickSpark from "./utils/clickSpark/ClickSpark";
import Lenis from 'lenis'


// Initialize Lenis
const lenis = new Lenis({
  autoRaf: true,
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
