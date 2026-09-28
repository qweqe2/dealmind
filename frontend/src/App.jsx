import { useEffect, useState } from "react";
import { healthCheck } from "./services/api";

function App() {
  const [status, setStatus] = useState("Checking backend...");

  useEffect(() => {
    healthCheck()
      .then((data) => setStatus(`Backend: ${data.status}`))
      .catch(() => setStatus("Backend connection failed"));
  }, []);

  return (
    <div>
      <h1>DealMind</h1>
      <p>{status}</p>
    </div>
  );
}

export default App;