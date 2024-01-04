import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';
import Faturas from './pages/Faturas';

function App() {


  return (
    <Router>
      <Routes>
        <Route path="/" element={<Faturas/>} />
      </Routes >
    </Router >
  );
}

export default App;
