import React, { useState } from "react";
import { Form, Select, Button, message } from "antd";
import axios from "axios";

const { Option } = Select;

const CreateAccount = ({ onAccountCreated }) => {
  const [loading, setLoading] = useState(false);
  const [accountType, setAccountType] = useState(null);

  const handleCreateAccount = async () => {
    if (accountType === null) {
      message.error("Please select an account type before creating an account.");
      return;
    }
  
    setLoading(true);
    const token = localStorage.getItem("token");
  
    try {
      const response = await axios.post(
        "http://localhost:5030/api/accounts",
        {
          type: accountType,
          balance: 0,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      message.success(response.data);
      if (onAccountCreated) {
        onAccountCreated();
      }
    } catch (error) {
      console.error("Error creating account:", error.response?.data || error);
      message.error(
        error.response?.data?.error || "Failed to create account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div style={{ maxWidth: "400px", margin: "auto", paddingTop: "50px" }}>
      <h2>Create New Account</h2>
      <Form layout="vertical" onFinish={handleCreateAccount}>
        <Form.Item
          label="Account Type"
          name="accountType"
          rules={[{ required: true, message: "Please select account type!" }]}
        >
          <Select
            placeholder="Select account type"
            onChange={(value) => setAccountType(value)}
          >
            <Option value={0}>Saving</Option>
            <Option value={1}>Checking</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
          >
            Create Account
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CreateAccount;
