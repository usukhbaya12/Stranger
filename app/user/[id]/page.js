"use client";

import { signOut, useSession } from "next-auth/react";
import React, { useState, useEffect } from "react";
import EditProfile from "@/components/EditProfile";

export default function Profile() {
  const { data: session } = useSession();
  const [id, setId] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (session) {
      setId(session.user.id);
      refetchUserData();
    }
  }, [session]);

  const refetchUserData = async () => {
    const resGetUser = await fetch("/api/getUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    const user = await resGetUser.json();

    console.log("data: ", user);

    setName(user.user.name);
    setBio(user.user.bio);
    setEmail(user.user.email);
    setUsername(user.user.username);
  };

  const handleProfileUpdate = () => {
    refetchUserData();
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="mt-32 ml-24 flex justify-between">
        <div className="flex">
          <img src="/images/profile.png" width="180px" alt="Profile" />
          <div className="ml-4 mt-4">
            <div className="flex items-center">
              <p>@ </p>
              <p className="text-3xl font-bold">{username}</p>
            </div>
            <p className="text-sky-400 font-semibold">{name}</p>
            <p className="mb-8">{bio}</p>

            <div>
              <EditProfile
                isModalOpen={isModalOpen}
                onClose={handleCloseModal}
                onProfileUpdate={handleProfileUpdate}
              />
              <a
                onClick={showModal}
                className="-ml-28 font-semibold px-2 py-1 rounded cursor-pointer bg-white text-midnight hover:bg-midnight hover:text-white"
              >
                👤 Edit Profile
              </a>
            </div>
          </div>
        </div>

        <div className="justify-end mr-24 flex mt-8">
          <div className="px-4">
            <p className="text-2xl text-center font-bold">0</p>
            <p>Albums</p>
          </div>
          <div className="px-4">
            <p className="text-2xl text-center font-bold">0</p>
            <p>Following</p>
          </div>
          <div className="px-4">
            <p className="text-2xl text-center font-bold">0</p>
            <p>Followers</p>
          </div>
        </div>
      </div>
      <div></div>
    </div>
  );
}
