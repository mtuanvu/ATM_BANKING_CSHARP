import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Select } from 'antd';
import axios from 'axios';

const { Option } = Select;

function Withdraw() {
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]); // Danh sách tài khoản
  const [selectedAccount, setSelectedAccount] = useState(null); // Tài khoản được chọn

  useEffect(() => {
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
      setAccounts(response.data);
      if (response.data.length > 0) {
        setSelectedAccount(response.data[0].accountId); // Tự động chọn tài khoản đầu tiên
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách tài khoản:', error);
      message.error('Không thể lấy danh sách tài khoản.');
    }
  };

  const handleWithdraw = async (values) => {
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:5030/api/transactions/enqueue', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId: selectedAccount,
          amount: values.amount,
          transactionType: 'withdraw', // Mặc định là "Withdraw"
        }),
      });

      const data = await response.json();

      if (response.ok) {
        message.success('Giao dịch rút tiền thành công!');
        await fetchAccounts(); // Cập nhật danh sách tài khoản
      } else {
        message.error(data.error || 'Giao dịch thất bại.');
      }
    } catch (error) {
      console.error('Error:', error);
      message.error('Lỗi máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', paddingTop: '50px' }}>
      <h2>Rút Tiền</h2>
      <Form name="withdraw" onFinish={handleWithdraw} layout="vertical">
        <Form.Item label="Chọn Tài Khoản" required>
          <Select
            placeholder="Chọn tài khoản"
            onChange={(value) => setSelectedAccount(value)}
          >
            {accounts.map((account) => (
              <Option key={account.accountId} value={account.accountId}>
                Tài Khoản ID: {account.accountId} | Số Dư: ${account.balance}
              </Option>
            ))}
          </Select>
        </Form.Item>

       

        <Form.Item
          label="Số Tiền"
          name="amount"
          rules={[
            { required: true, message: 'Vui lòng nhập số tiền!' },
            { validator: (_, value) => value > 0 ? Promise.resolve() : Promise.reject(new Error('Số tiền phải lớn hơn 0!')) },
          ]}
        >
          <Input type="number" placeholder="Nhập số tiền muốn rút" />
        </Form.Item>
        <Form.Item label="Loại Giao Dịch">
          <Input value="Withdraw" disabled />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Rút Tiền
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default Withdraw;
