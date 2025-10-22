import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import SensorList from "./pages/sensors/SensorList.jsx";
import SensorDetail from "./pages/sensors/SensorDetail.jsx";
import PrivateRoute from "./context/PrivateRoute";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<PrivateRoute />}>
          <Route path="/sensors" element={<SensorList />} />
          <Route path="/sensors/:sensorId" element={<SensorDetail />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
