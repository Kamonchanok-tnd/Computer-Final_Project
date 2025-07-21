import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
 // Import ConfigRoutes which contains the role-based routing
import ConfigRoutes from "./ routes/ConfigRoutes";
import AutoLogoutProvider from "./ routes/AutoLogoutProvider";
// import SignInPages from "./pages/login/login";
const App: React.FC = () => {
  return (
    <Router>
      <AutoLogoutProvider>
        <ConfigRoutes /> {/* Use ConfigRoutes which handles all routing */}
      </AutoLogoutProvider>
    </Router>
  );
};

export default App;


