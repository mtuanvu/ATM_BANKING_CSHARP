import React, { useState, useEffect } from "react";
import { List, Button, message } from "antd";
import axios from "axios";
import CreateAccount from "./CreateAccount";

const AccountManagement = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const response = await axios.get("http://localhost:5030/api/accounts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAccounts(response.data);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      message.error("Failed to fetch accounts.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto", paddingTop: "50px" }}>
      <h2>Your Accounts</h2>
      <List
        loading={loading}
        dataSource={accounts}
        renderItem={(account) => (
          <List.Item>
            <div>
              <strong>Account ID:</strong> {account.accountId}{" "}
              <strong>Balance:</strong> ${account.balance}
              <strong>Type:</strong> {account.type === 0 ? "Saving" : "Checking"}
            </div>
          </List.Item>
        )}
      />
      <CreateAccount onAccountCreated={fetchAccounts} />
    </div>
  );
};

export default AccountManagement;
