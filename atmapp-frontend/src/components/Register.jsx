import React from 'react';
import { Form, Input, Button, message } from 'antd';

const Register = () => {
  const onFinish = async (values) => {
    try {
      const response = await fetch('http://localhost:5030/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (response.ok) {
        message.success('Registration successful');
      } else {
        const error = await response.json();
        message.error(error.message || 'Registration failed');
      }
    } catch (error) {
      message.error('Error during registration');
    }
  };

  return (
    <Form name="register" onFinish={onFinish} layout="vertical">
      <Form.Item name="name" label="Name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="email" label="Email" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="password" label="Password" rules={[{ required: true }]}>
        <Input.Password />
      </Form.Item>
      <Button type="primary" htmlType="submit">
        Register
      </Button>
    </Form>
  );
};

export default Register;
