"use client";

import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Form, Input } from "antd";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import "app/globals.css";

export default function SignIn() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [grammysAlbums, setGrammysAlbums] = useState([]);
  const [accessToken, setAccessToken] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authResponse = await fetch(
          "https://accounts.spotify.com/api/token",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `grant_type=client_credentials&client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}&client_secret=${process.env.NEXT_PUBLIC_CLIENT_SECRET}`,
          }
        );
        const authData = await authResponse.json();
        setAccessToken(authData.access_token);
      } catch (error) {
        console.error("Error fetching access token: ", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchGrammysAlbums = async () => {
      try {
        const grammysResponse = await fetch(
          "https://api.spotify.com/v1/playlists/2LoI7SSDNjskpTMipZBvtB/tracks?fields=items.track.album",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + accessToken,
            },
          }
        );
        const grammysData = await grammysResponse.json();
        setGrammysAlbums(
          grammysData.items.map((item) => item.track.album.images[0].url)
        );
      } catch (error) {
        console.error("Error fetching Grammys data: ", error);
      }
    };
    fetchGrammysAlbums();
  }, [accessToken]);

  useEffect(() => {
    const snowfallContainer = document.getElementById("snowfall-container");

    if (snowfallContainer) {
      grammysAlbums.forEach((url, index) => {
        const snowflake = document.createElement("img");
        snowflake.src = url;
        snowflake.className = "snowflake";
        snowflake.style.left = `${Math.random() * 100}vw`;
        snowflake.style.animationDuration = `${Math.random() * 8 + 5}s`;
        snowflake.style.width = "40px";
        snowflake.style.height = "40px";

        snowfallContainer.appendChild(snowflake);
      });
    }
  }, [grammysAlbums]);

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
    <div className="flex justify-center items-center h-screen select-none">
      <div id="snowfall-container" className="snowfall-container"></div>
      <div className="leading-6 px-36 py-8 border-solid border border-dashed rounded-3xl bg-gray-800 z-10">
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
