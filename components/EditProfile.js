import React, { useState, useEffect } from "react";
import { Modal } from "antd";
import { useSession } from "next-auth/react";
import { get } from "mongoose";

const EditProfile = ({ isModalOpen, onClose, onProfileUpdate }) => {
  const { data: session } = useSession();
  const [id, setId] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("/images/profile.png");

  useEffect(() => {
    if (session) {
      setId(session.user.id);
      getUser();
    }
  }, [session]);

  const getUser = async () => {
    const resGetUser = await fetch("/api/getUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    const user = await resGetUser.json();

    setName(user.user.name);
    setBio(user.user.bio);
    setEmail(user.user.email);
    setUsername(user.user.username);
  };

  const onChange = (e) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (reader.readyState === 2) {
        setAvatarPreview(reader.result);
      }
    };

    setAvatar(e.target.files[0]);
    reader.readAsDataURL(e.target.files[0]);
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.set("name", name);
    formData.set("bio", bio);
    formData.set("image", avatar);

    try {
      const response = await fetch("/api/updateUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          name,
          bio,
          avatar,
        }),
      });

      if (response.ok) {
        getUser();
        onProfileUpdate();
        onClose();
      } else {
        console.error("Failed to update profile");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const okButtonProps = {
    style: {
      background: "#4096FF",
      borderColor: "sky",
    },
  };

  return (
    <>
      <Modal
        title="Edit Profile"
        open={isModalOpen}
        onOk={submitHandler}
        onCancel={handleCancel}
        width={380}
        okButtonProps={okButtonProps}
      >
        <form>
          <div className="justify-center">
            <div className="input-type flex justify-center">
              <img
                src={avatarPreview}
                style={{
                  borderRadius: "50%",
                  width: "120px",
                  height: "120px",
                  objectFit: "cover",
                }}
              ></img>
            </div>
            <div className="md:w-2/3 lg:w-80">
              <input
                className="form-control block w-full px-2.5 py-1.5 text-sm font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded-xl transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none mt-4"
                type="file"
                id="formFile"
                onChange={onChange}
              />
            </div>
          </div>
          <div className="input-type flex items-center mb-2 mt-4">
            <p className="w-3/12">Username:</p>
            <input
              disabled
              type="text"
              className="w-9/12 border px-3 py-1.5 focus:outline-none rounded-md"
              name="username"
              placeholder={username}
            />
          </div>
          <div className="input-type flex items-center mb-2">
            <p className="w-3/12">E-mail:</p>
            <input
              disabled
              type="email"
              className="w-9/12 border px-3 py-1.5 focus:outline-none rounded-md"
              name="email"
              placeholder={email}
            />
          </div>
          <div className="input-type flex items-center mb-2">
            <p className="w-3/12">Full name:</p>
            <input
              required
              type="text"
              className="w-9/12 border px-3 py-1.5 focus:outline-none rounded-md"
              name="name"
              value={name}
              placeholder="Full name"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="input-type flex items-center">
            <p className="w-3/12">Bio:</p>
            <input
              required
              type="text"
              className="w-9/12 border px-3 py-1.5 focus:outline-none rounded-md"
              name="bio"
              value={bio}
              placeholder="Your bio..."
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
        </form>
      </Modal>
    </>
  );
};

export default EditProfile;
