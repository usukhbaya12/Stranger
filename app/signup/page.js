"use client";

import { Button, ConfigProvider, Form, Input } from "antd";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const checkUsername = async (rule, value) => {
    const resUserExists = await fetch("/api/userExists", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: value }),
    });

    const { user } = await resUserExists.json();

    if (user) {
      throw new Error("Your username already exists!");
    }
  };

  const checkEmail = async (rule, value) => {
    const resEmailExists = await fetch("/api/emailExists", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: value }),
    });

    const { usermail } = await resEmailExists.json();

    if (usermail) {
      throw new Error("Your email already exists!");
    }
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      if (res.ok) {
        router.push("/signin");
      } else {
        console.log("User registration failed.");
      }
    } catch (error) {
      console.log("An error occured.", error);
    }
  };

  const [form] = Form.useForm();

  const formItemLayout = {
    labelCol: {
      xs: { span: 9 },
      sm: { span: 10 },
    },
    wrapperCol: {
      xs: { span: 12 },
      sm: { span: 24 },
    },
  };
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="leading-6 px-36 py-8 border-solid border border-dashed rounded-3xl bg-gray-800">
        <h2 className="text-center mb-6 text-xl font-bold">Sign Up</h2>
        <ConfigProvider
          theme={{
            token: {
              // Seed Token
              colorTextHeading: "rgba(255,255,255)",
            },
          }}
        >
          <Form
            onFinish={handleSubmit}
            {...formItemLayout}
            form={form}
            name="register"
            style={{
              maxWidth: 600,
            }}
            scrollToFirstError
          >
            <Form.Item
              name="username"
              label="Username"
              rules={[
                {
                  required: true,
                  message: "Please input your username!",
                },
                {
                  validator: checkUsername,
                },
              ]}
            >
              <Input onChange={(e) => setUsername(e.target.value)} />
            </Form.Item>
            <Form.Item
              name="email"
              label="E-mail"
              rules={[
                {
                  type: "email",
                  message: "The input is not valid E-mail!",
                },
                {
                  required: true,
                  message: "Please input your E-mail!",
                },
                {
                  validator: checkEmail,
                },
              ]}
            >
              <Input onChange={(e) => setEmail(e.target.value)} />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                {
                  required: true,
                  message: "Please input your password!",
                },

                {
                  min: 6,
                  message: "Your assword must be at least 6 characters!",
                },
              ]}
              hasFeedback
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              name="confirm"
              label="Confirm Password"
              dependencies={["password"]}
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please confirm your password!",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error(
                        "The new password that you entered do not match!"
                      )
                    );
                  },
                }),
              ]}
            >
              <Input.Password onChange={(e) => setPassword(e.target.value)} />
            </Form.Item>

            <Form.Item className="-mb-1">
              <Button
                type="primary"
                htmlType="submit"
                className="text-white mx-auto flex justify-center bg-green-`800 hover:bg-green-900 focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
              >
                Sign up
              </Button>
              {error && (
                <p className="px-2 py-1 text-white bg-red-500 mt-4 rounded text-center">
                  {error}
                </p>
              )}
            </Form.Item>
          </Form>
        </ConfigProvider>
      </div>
    </div>
  );
}
