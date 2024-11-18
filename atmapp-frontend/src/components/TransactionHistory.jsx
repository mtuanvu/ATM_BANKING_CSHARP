import React, { useState, useEffect } from 'react';
import { Table, message } from 'antd';
import axios from 'axios';

const TransactionHistory = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get('http://localhost:5030/api/transactions', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setData(res.data);
      } catch (error) {
        message.error('Failed to fetch transaction history');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const columns = [
    { title: 'Account ID', dataIndex: 'accountId', key: 'accountId' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    { title: 'Transaction Type', dataIndex: 'transactionType', key: 'transactionType' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'Timestamp', dataIndex: 'timestamp', key: 'timestamp' },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      rowKey={(record) => record.transactionId}
    />
  );
};

export default TransactionHistory;
