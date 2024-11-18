import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Select } from 'antd';
import axios from 'axios';

const { Option } = Select;

function Deposit() {
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]); // Danh sách tài khoản
  const [selectedAccount, setSelectedAccount] = useState(null); // Tài khoản được chọn
  const [form] = Form.useForm(); // Ant Design Form instance

  useEffect(() => {
    // Fetch danh sách tài khoản khi component được mount
    fetchAccounts();
  }, []);

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

  const handleDeposit = async (values) => {
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:5030/api/accounts/update-balance', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId: selectedAccount, // Lấy từ dropdown
          amount: values.amount,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        message.success(data.message || 'Deposit successful');
        // Gọi lại API để lấy danh sách tài khoản mới
        await fetchAccounts();

        // Reset form về trạng thái ban đầu
        form.resetFields();
        setSelectedAccount(null);
      } else {
        message.error(data.error || 'Error occurred while depositing money');
      }
    } catch (error) {
      console.error('Error:', error);
      message.error('Server error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', paddingTop: '50px' }}>
      <h2>Deposit Money</h2>
      <Form form={form} name="deposit" onFinish={handleDeposit} layout="vertical">
        <Form.Item
          label="Select Account"
          name="account"
          rules={[{ required: true, message: 'Please select an account!' }]}
        >
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
