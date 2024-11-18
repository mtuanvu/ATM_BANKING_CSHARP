import React, { useEffect, useState } from 'react';
import { Layout, Menu } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { fetchAccountInfo } from './AccountService';

const { Header } = Layout;

const AppHeader = () => {
  const token = localStorage.getItem('token');
  const [accountInfo, setAccountInfo] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      fetchAccountInfo()
        .then((data) => setAccountInfo(data[0]))
        .catch((err) => console.error('Error:', err));
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <Header>
      <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']}>
        {!token ? (
          <>
            <Menu.Item key="1">
              <Link to="/register">Register</Link>
            </Menu.Item>
            <Menu.Item key="2">
              <Link to="/">Login</Link>
            </Menu.Item>
          </>
        ) : (
          <>
            <Menu.Item key="3">
              <Link to="/deposit">Deposit</Link>
            </Menu.Item>
            <Menu.Item key="4">
              <Link to="/withdraw">Withdraw</Link>
            </Menu.Item>
            <Menu.Item key="5">
              <Link to="/transfer">Transfer</Link>
            </Menu.Item>
            <Menu.Item key="6">
              <Link to="/transactionHistory">History</Link>
            </Menu.Item>
            <Menu.Item key="7" onClick={handleLogout}>
              Logout
            </Menu.Item>
          </>
        )}
      </Menu>
    </Header>
  );
};

export default AppHeader;
