import React, { useState, useEffect } from "react";
import { Form, Input, Button, message, Select } from "antd";
import axios from "axios";

const { Option } = Select;

const Transfer = () => {
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]); // Danh sách tài khoản của người gửi
  const [selectedAccount, setSelectedAccount] = useState(null); // Tài khoản người gửi được chọn
  const [receiverName, setReceiverName] = useState(""); // Tên người nhận

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Lấy danh sách tài khoản người gửi
  const fetchAccounts = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get("http://localhost:5030/api/accounts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAccounts(response.data); // Lưu danh sách tài khoản vào state
    } catch (error) {
      console.error("Error fetching accounts:", error);
      message.error("Failed to fetch your accounts. Please try again.");
    }
  };

  // Kiểm tra thông tin tài khoản người nhận
  const checkReceiver = async (receiverAccountId) => {
    try {
      const res = await axios.post(
        "http://localhost:5030/api/accounts/check/account", // API kiểm tra tài khoản người nhận
        { AccountId: receiverAccountId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data && res.data.receiver_name) {
        setReceiverName(res.data.receiver_name); // Lưu tên người nhận
      } else {
        message.error("Receiver account does not exist.");
        setReceiverName("");
      }
    } catch (error) {
      console.error("Error checking receiver:", error);
      message.error("Failed to check receiver account. Please try again.");
      setReceiverName("");
    }
  };

  // Xử lý chuyển tiền
  const handleTransfer = async (values) => {
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        "http://localhost:5030/api/transactions/transfer",
        {
          AccountId: selectedAccount, // ID tài khoản nguồn
          DestinationAccountId: values.to_account_id, // ID tài khoản đích
          Amount: parseFloat(values.amount), // Số tiền
          SenderName: accounts.find((a) => a.accountId === selectedAccount)
            ?.userName || "Unknown", // Lấy tên người gửi từ tài khoản được chọn
          ReceiverName: receiverName, // Tên người nhận
          Description: values.description || "No description provided",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.message) {
        message.success(response.data.message);
        setReceiverName("");
        fetchAccounts(); // Làm mới danh sách tài khoản
      } else {
        message.error("Unexpected response from the server.");
      }
    } catch (error) {
      console.error("Error during transfer:", error.response?.data || error);
      message.error(
        error.response?.data?.error || "Transfer failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReceiverChange = (e) => {
    const accountId = e.target.value;
    if (accountId) {
      checkReceiver(accountId); // Kiểm tra thông tin tài khoản người nhận
    } else {
      setReceiverName("");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", paddingTop: "50px" }}>
      <h2>Transfer Money</h2>
      <Form name="transfer" onFinish={handleTransfer} layout="vertical">
        {/* Chọn tài khoản nguồn */}
        <Form.Item
          label="From Account ID"
          name="from_account_id"
          rules={[{ required: true, message: "Please select your account!" }]}
        >
          <Select
            placeholder="Select your account"
            onChange={(value) => setSelectedAccount(value)} // Cập nhật tài khoản nguồn
          >
            {accounts.map((account) => (
              <Option key={account.accountId} value={account.accountId}>
                Account ID: {account.accountId} | Balance: ${account.balance}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Nhập ID tài khoản đích */}
        <Form.Item
          label="To Account ID"
          name="to_account_id"
          rules={[{ required: true, message: "Please input the receiver account ID!" }]}
        >
          <Input
            placeholder="Enter the receiver's account ID"
            onChange={handleReceiverChange} // Gọi hàm kiểm tra tài khoản người nhận
          />
        </Form.Item>

        {/* Hiển thị tên người nhận */}
        {receiverName && (
          <div style={{ marginBottom: "16px", color: "green" }}>
            Receiver Name: {receiverName}
          </div>
        )}

        {/* Nhập số tiền chuyển */}
        <Form.Item
          label="Amount"
          name="amount"
          rules={[{ required: true, message: "Please input the amount!" }]}
        >
          <Input type="number" placeholder="Enter amount to transfer" />
        </Form.Item>

        {/* Nhập mô tả giao dịch */}
        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: false }]} // Không bắt buộc nhập mô tả
        >
          <Input placeholder="Enter description (optional)" />
        </Form.Item>

        {/* Nút chuyển tiền */}
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Transfer
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Transfer;
