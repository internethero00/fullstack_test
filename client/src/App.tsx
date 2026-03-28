import { useEffect, useRef } from "react";
import { requestQueue } from "./requestQueue";
import { LeftPanel } from "./components/LeftPanel";
import { RightPanel } from "./components/RightPanel";
import "./App.css";

export interface PanelHandle {
  refresh: () => void;
}

function App() {
  const leftRef = useRef<PanelHandle>(null);
  const rightRef = useRef<PanelHandle>(null);

  useEffect(() => {
    requestQueue.start();

    const unsub = requestQueue.onFlush(() => {
      leftRef.current?.refresh();
      rightRef.current?.refresh();
    });

    return () => {
      requestQueue.stop();
      unsub();
    };
  }, []);

  return (
      <div className="app">
        <h1>Item Selector</h1>
        <div className="panels">
          <LeftPanel ref={leftRef} />
          <RightPanel ref={rightRef} />
        </div>
      </div>
  );
}

export default App;