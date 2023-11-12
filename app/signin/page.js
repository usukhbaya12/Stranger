"use client";

import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Form, Input } from "antd";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function SignIn() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    try {
      const res = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (res.error) {
        setError("invalid");
      } else {
        router.replace("/");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className=" w-full max-w-xs">
        <div className="text-center leading-6 text-xl mb-6 font-bold">
          <h2>Sign In</h2>
        </div>
        <Form
          onFinish={handleSubmit}
          name="normal_login"
          className="login-form"
          initialValues={{
            remember: true,
          }}
        >
          <Form.Item
            name="username"
            rules={[
              {
                required: true,
                message: "Please input your Username!",
              },
            ]}
          >
            <Input
              onChange={(e) => setUsername(e.target.value)}
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="Username"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: "Please input your Password!",
              },
            ]}
          >
            <Input
              onChange={(e) => setPassword(e.target.value)}
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item className="text-white">
            <Button
              type="primary"
              htmlType="submit"
              className="bg-green-800 hover:bg-green-900 focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
            >
              Log in
            </Button>{" "}
            Don't have an account?{" "}
            <a className="font-bold" href="/signup">
              register now!
            </a>
            {error && (
              <p className="px-2 py-1 text-white bg-red-500 mt-4 rounded">
                {" "}
                😔 Your credentials didn't match. Try again!
              </p>
            )}
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
