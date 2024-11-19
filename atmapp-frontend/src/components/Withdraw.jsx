import React, { useState, useEffect } from "react";
import { Form, Input, Button, message, Select } from "antd";
import axios from "axios";

const { Option } = Select;

function Withdraw() {
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get("http://localhost:5030/api/accounts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAccounts(response.data);
      if (response.data.length > 0) {
        setSelectedAccount(response.data[0].accountId);
      }
    } catch (error) {
      console.error("Error while getting account list:", error);
      message.error("Unable to get account list.");
    }
  };

  const handleWithdraw = async (values) => {
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        "http://localhost:5030/api/transactions/enqueue",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accountId: selectedAccount,
            amount: values.amount,
            transactionType: "Withdraw",
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        message.success("Withdrawal transaction successful!");
        await fetchAccounts();
      } else {
        message.error(data.error || "Transaction failed.");
      }
    } catch (error) {
      console.error("Error:", error);
      message.error("Server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", paddingTop: "50px" }}>
      <h2>Withdraw</h2>
      <Form name="withdraw" onFinish={handleWithdraw} layout="vertical">
        <Form.Item label="Select Account" required>
          <Select
            placeholder="Select Account"
            onChange={(value) => setSelectedAccount(value)}
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
          rules={[
            { required: true, message: "Please enter amount!" },
            {
              validator: (_, value) =>
                value > 0
                  ? Promise.resolve()
                  : Promise.reject(new Error("Amount must be greater than 0!")),
            },
          ]}
        >
          <Input
            type="number"
            placeholder="Enter the amount you want to withdraw"
          />
        </Form.Item>
        <Form.Item label="Transaction Type">
          <Input value="Withdraw" disabled />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Withdraw
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default Withdraw;
