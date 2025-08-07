import { createRoot } from 'react-dom/client'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import App from './App.tsx'
import './index.css'

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

createRoot(document.getElementById("root")!).render(<App />);
