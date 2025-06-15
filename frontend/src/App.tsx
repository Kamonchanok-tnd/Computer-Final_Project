import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
 // Import ConfigRoutes which contains the role-based routing
import ConfigRoutes from "./ routes/ConfigRoutes";
const App: React.FC = () => {
  return (
    <Router>
      <ConfigRoutes /> {/* Use ConfigRoutes which handles all routing */}
    </Router>
  );
};

export default App;
