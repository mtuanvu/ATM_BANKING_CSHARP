import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppHeader from './components/AppHeader';
import Login from './components/Login';
import Register from './components/Register';
import Deposit from './components/Deposit';
import Withdraw from './components/Withdraw';
import Transfer from './components/Transfer';
import TransactionHistory from './components/TransactionHistory';

function App() {
  return (
    <Router>
      <AppHeader />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/deposit" element={<Deposit />} />
        <Route path="/withdraw" element={<Withdraw />} />
        <Route path="/transfer" element={<Transfer />} />
        <Route path="/transactionHistory" element={<TransactionHistory />} />
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
