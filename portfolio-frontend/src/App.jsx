import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ProjectView from "./pages/ProjectView";
import Footer from "./pages/miniComponents/Footer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <Router>
          <div>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/project/:id" element={<ProjectView />} />
          </Routes>
          <Footer />
          </div>
          <ToastContainer position="bottom-right" theme="dark" />
        </Router>
      </div >

    </>
  );
}

export default App;
