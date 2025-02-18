import React from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import SkinAnalysis from "./components/SkinAnalysis";
import StartPage from "./components/startpage";
import User from "./components/users";
import Map from "./components/map"; 
import HomePanel from "./components/homepanel";
import Layout from "./components/Layout"; // Import Layout
import Mailtrap from "./components/mailtrap";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Pages without the Layout (Login, Register, StartPage) */}
          <Route path="/" element={<StartPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/mailtrap" element={<Mailtrap />} />
          <Route path="/users" element={<User />} />
          {/* Pages wrapped in Layout (Persistent Navigation) */}
          <Route path="/" element={<Layout />}>
            <Route path="/homepanel" element={<HomePanel />} />
            <Route path="/skin-analysis" element={<SkinAnalysis />} />
            <Route path="/map" element={<Map />} /> 
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
