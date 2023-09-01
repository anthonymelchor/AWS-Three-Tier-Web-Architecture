//import logo from './logo.svg';
//import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import OrdersList from './components/OrdersList';
import OrderForm from './components/OrderForm';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<OrdersList />} />
        <Route path="/addOrder" element={<OrderForm />} />
      </Routes>
    </Router>
  );
}

export default App;
