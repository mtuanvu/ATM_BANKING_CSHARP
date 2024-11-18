import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Select } from 'antd';
import axios from 'axios';

const { Option } = Select;

function Deposit() {
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]); // Danh sách tài khoản
  const [selectedAccount, setSelectedAccount] = useState(null); // Tài khoản được chọn

  useEffect(() => {
    // Fetch danh sách tài khoản khi component được mount
    const fetchAccounts = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://localhost:5030/api/accounts', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAccounts(response.data); // Lưu danh sách tài khoản vào state
      } catch (error) {
        console.error('Error fetching accounts:', error);
        message.error('Failed to fetch accounts.');
      }
    };
    fetchAccounts();
  }, []);

  const handleDeposit = async (values) => {
    if (!selectedAccount) {
      message.error('Please select an account!');
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(
        `http://localhost:5030/api/accounts/${selectedAccount}/balance`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`, // Gửi token trong header
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ amount: values.amount }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        message.success(data.message || 'Deposit successful');
      } else {
        const error = await response.json();
        message.error(error.message || 'Error occurred while depositing money');
      }
    } catch (err) {
      console.error(err);
      message.error('Server error occurred.');
    } finally {
      setLoading(false); // Tắt trạng thái loading sau khi xử lý xong
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', paddingTop: '50px' }}>
      <h2>Deposit Money</h2>
      <Form name="deposit" onFinish={handleDeposit} layout="vertical">
        <Form.Item label="Select Account" required>
          <Select
            placeholder="Select an account"
            onChange={(value) => setSelectedAccount(value)} // Cập nhật tài khoản được chọn
          >
            {accounts.map((account) => (
              <Option key={account.accountId} value={account.accountId}>
                Account ID: {account.accountId} | Balance: ${account.balance}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Amount"
          name="amount"
          rules={[{ required: true, message: 'Please input the amount!' }]}
        >
          <Input type="number" placeholder="Enter amount to deposit" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Deposit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default Deposit;
