import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import CreateAccount from './CreateAccount';
import LandingPage from './LandingPage';
import Root from './Root';
import BinaryLevel from './levels/BinaryLevel';
import TetrahedralLevel from './levels/TetrahedralLevel';
import CubicLevel from './levels/CubicLevel';
import OctahedralLevel from './levels/OctahedralLevel';
import './App.css';
import './i18n';


function App() {
  const [backendData, setBackendData] = useState([{}]);

  useEffect(() => {
    fetch("/api")
      .then(response => response.json())
      .then(data => setBackendData(data))
      .catch(error => console.error("Error fetching data:", error));
  }, []); // Adding an empty dependency array to run this effect only once on mount

  return (
    <Router>
      <div className="App">
        {/* Display backend data if available */}
        <div>
          {typeof backendData.users === 'undefined' ? (
            <p>Loading...</p>
          ) : (
            backendData.users.map((user, i) => (
              <p key={i}>{user}</p>
            ))
          )}
        </div>
        
        {/* Routes */}
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/create-account" element={<CreateAccount />} />
          <Route path="/root" element={<Root />} />
          <Route path="/levels/BinaryLevel" element={<BinaryLevel />} />
          <Route path="/levels/TetrahedralLevel" element={<TetrahedralLevel />} />
          <Route path="/levels/CubicLevel" element={<CubicLevel />} />
          <Route path="/levels/OctahedralLevel" element={<OctahedralLevel />} />
          {/* End Routes */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
