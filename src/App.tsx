// 

import { useRef, useState } from "react";
import "./App.scss";
import { LiveAPIProvider } from "./contexts/LiveAPIContext";
import SidePanel from "./components/side-panel/SidePanel";
import ControlTray from "./components/control-tray/ControlTray";
import cn from "classnames";
import { KitchenTrainer } from "./components/kitchen-trainer/Kitchen-trainer";
import { Receptionist } from "./components/receptionist/Receptionist";

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY as string;
if (typeof API_KEY !== "string") {
  throw new Error("set REACT_APP_GEMINI_API_KEY in .env");
}

const host = "generativelanguage.googleapis.com";
const uri = `wss://${host}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent`;

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<"kitchen" | "reception">("reception");

  return (
    <div className="App">
      <LiveAPIProvider url={uri} apiKey={API_KEY}>
        <div className="streaming-console">
          <SidePanel />
          <main>
            {/* ナビゲーションバー */}
            <nav className="navbar">
              <button
                className={selectedComponent === "kitchen" ? "active" : ""}
                onClick={() => setSelectedComponent("kitchen")}
              >
                キッチントレーナー
              </button>
              <button
                className={selectedComponent === "reception" ? "active" : ""}
                onClick={() => setSelectedComponent("reception")}
              >
                ウェイティングボード受付
              </button>
            </nav>

            <div className="main-app-area">
              {selectedComponent === "kitchen" ? <KitchenTrainer /> : <Receptionist />}
              <video
                className={cn("stream", { hidden: !videoRef.current || !videoStream })}
                ref={videoRef}
                autoPlay
                playsInline
              />
            </div>

            <ControlTray
              videoRef={videoRef}
              supportsVideo={true}
              onVideoStreamChange={setVideoStream}
            />
          </main>
        </div>
      </LiveAPIProvider>
    </div>
  );
}

export default App;
