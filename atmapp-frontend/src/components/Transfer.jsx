import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import axios from "axios"; // Import axios trực tiếp vào đây

const Transfer = () => {
  const [loading, setLoading] = useState(false); // Trạng thái loading khi xử lý yêu cầu
  const [receiverName, setReceiverName] = useState(""); // Trạng thái lưu tên người nhận

  // Hàm xử lý gọi API transfer tiền
  const transferMoney = async (data) => {
    try {
      const res = await axios.post("http://localhost:5000/transfer", data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
      return res;
    } catch (error) {
      console.error("Error during transfer request:", error);
      throw error; // Ném lỗi để xử lý tiếp trong catch block của onFinish
    }
  };

  // Hàm kiểm tra tài khoản người nhận
  const checkReceiver = async (account_id) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/check_receiver",  // Cập nhật URL cho chính xác với backend
        { account_id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (res.data && res.data.receiver_name) {
        setReceiverName(res.data.receiver_name); // Cập nhật tên người nhận
      }
    } catch (error) {
      message.error("Tài khoản người nhận không tồn tại");
      setReceiverName(""); // Xóa tên nếu tài khoản không tồn tại
    }
  };

  const onFinish = (values) => {
    console.log("Dữ liệu form:", values);  // Kiểm tra dữ liệu trước khi gửi lên server
    setLoading(true);  // Bật trạng thái loading khi bắt đầu xử lý
    transferMoney(values)
      .then((res) => {
        if (res && res.data && res.data.message) {
          message.success(res.data.message);  // Hiển thị thông báo thành công
        } else {
          message.error("Phản hồi không mong đợi từ server.");  // Hiển thị lỗi nếu server phản hồi không rõ ràng
        }
      })
      .catch((error) => {
        console.error("Error:", error.response?.data);  // Kiểm tra lỗi chi tiết
        message.error(
          error.response?.data?.error || "Chuyển tiền thất bại. Vui lòng thử lại."
        );
      })
      .finally(() => {
        setLoading(false);  // Tắt trạng thái loading sau khi xử lý xong
      });
  };
  

  // Hàm xử lý khi người dùng nhập account ID của người nhận
  const handleReceiverChange = (e) => {
    const account_id = e.target.value;
    if (account_id) {
      checkReceiver(account_id); // Kiểm tra tài khoản người nhận
    } else {
      setReceiverName(""); // Xóa tên nếu không có giá trị
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", paddingTop: "50px" }}>
      <h2>Transfer Money</h2>
      <Form
        name="transfer"
        onFinish={onFinish} // Sự kiện gửi form
        layout="vertical"
      >
        <Form.Item
          label="From Account ID"
          name="from_account_id"
          rules={[{ required: true, message: "Please input your account ID!" }]}
        >
          <Input placeholder="Enter your account ID" />
        </Form.Item>

        <Form.Item
          label="To Account ID"
          name="account_id" // Đảm bảo tên trường phải khớp với request trong backend
          rules={[
            {
              required: true,
              message: "Please input the receiver account ID!",
            },
          ]}
        >
          <Input
            placeholder="Enter the receiver's account ID"
            onChange={handleReceiverChange}  // Kiểm tra tài khoản người nhận khi thay đổi account_id
          />
        </Form.Item>
        {receiverName && (
          <div style={{ marginBottom: "16px", color: "green" }}>
            Receiver Name: {receiverName}  {/* Hiển thị tên người nhận */}
          </div>
        )}

        <Form.Item
          label="Amount"
          name="amount"
          rules={[{ required: true, message: "Please input the amount!" }]}
        >
          <Input type="number" placeholder="Enter amount to transfer" />
        </Form.Item>

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
