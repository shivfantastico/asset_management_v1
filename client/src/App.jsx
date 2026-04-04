import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Assets from "./pages/Assets";
import AddAsset from "./pages/AddAsset";
// import Users from './pages/Users/Users'
import { ToastProvider } from "./components/toast/ToastContext";
import Login from "./pages/Login";
import PrivateRoute from "./routes/PrivateRoute";
import AssetHistory from "./pages/AssetHistory";

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Private Layout */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Assets />} /> {/* ✅ default */}
            <Route path="assets" element={<Assets />} />
            <Route path="assets/add" element={<AddAsset />} />
            <Route path="asset/history" element={<AssetHistory />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
