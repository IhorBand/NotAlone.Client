import './App.css';
import React from 'react';
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import MainPage from './pages/MainPage';
import Login from './pages/Login';
import AnimeListComponent from './pages/AnimeList';

function App() {
  return (
    <div className="App">
      <Router>
        <div>
          {/* <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <p>
              Edit <code>src/App.tsx</code> and save to reload.
            </p>
            <a
              className="App-link"
              href="https://reactjs.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn React
            </a>
          </header> */}
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/video" element={<MainPage />} />
            {/* <Route path="/animes" element={<AnimeListComponent />} /> */}
          </Routes>  
        </div>
      </Router>
    </div>
  );
}

export default App;
