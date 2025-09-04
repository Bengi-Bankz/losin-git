
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

// Mount PixiJS React app with Duck Game
createRoot(document.getElementById("pixi-container")!).render(<App />);

// Mount Svelte overlay (commented out to show duck game - uncomment to restore original game)
// import "./main.svelte.ts";
