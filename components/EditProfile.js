import React, { useState, useEffect } from "react";
import { Modal, ConfigProvider } from "antd";
import { useSession } from "next-auth/react";

const EditProfile = ({ isModalOpen, onClose, onProfileUpdate }) => {
  const { data: session } = useSession();
  const [user, setUser] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("/images/profile.png");

  const getUser = async () => {
    const path = window.location;
    const waht = path.toString().split("/").pop();
    setUser(waht);
    console.log("bolju?", waht);

    try {
      const resGetUser = await fetch("/api/getUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: waht }),
      });

      if (!resGetUser.ok) {
        console.error("Failed to fetch user data:", resGetUser.statusText);
        return;
      }

      const userData = await resGetUser.json();
      console.log("User data:", userData);

      setName(userData.user.name);
      setBio(userData.user.bio);
      setEmail(userData.user.email);
      setUsername(userData.user.username);
      if (userData.user.image !== null) {
        setAvatarPreview(userData.user.image);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    getUser();
  }, [user]);

  const onChange = (e) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (reader.readyState === 2) {
        setAvatarPreview(reader.result);
      }
    };

    if (e.target.files[0]) {
      setAvatar(e.target.files[0]);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("file", avatar);
    formData.append("upload_preset", "sofn5e9n");

    try {
      const cloudinaryResponse = await fetch(
        "https://api.cloudinary.com/v1_1/dph5fxr7i/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      console.log("Cloudinary Response:", cloudinaryResponse);

      if (!cloudinaryResponse.ok) {
        console.error("Failed to upload image to Cloudinary");
        return;
      }

      const cloudinaryData = await cloudinaryResponse.json();
      console.log("Cloudinary Data:", cloudinaryData);

      const avatarUrl = cloudinaryData.secure_url;

      const response = await fetch("/api/updateUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          name,
          bio,
          avatar: avatarUrl,
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
  const cancelButtonProps = {
    style: {
      color: "#4096FF",
      borderColor: "sky",
      marginRight: "8px",
    },
  };

  return (
    <>
      <ConfigProvider
        theme={{
          components: {
            Modal: {
              titleColor: "black",
              colorText: "black",
            },
          },
          token: {
            colorTextPlaceholder: "rgb(180, 180, 180)",
            fontFamily: "DM Sans",
            colorBgContainer: "rgba(31,41,55,255)",
            colorText: "rgba(255,255,255)",
            colorFillContent: "rgba(255,255,255, 0.4)",
            marginXS: "6",
          },
        }}
      >
        <Modal
          title="Edit Profile"
          open={isModalOpen}
          onOk={submitHandler}
          onCancel={handleCancel}
          width={380}
          okButtonProps={okButtonProps}
          cancelButtonProps={cancelButtonProps}
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
                  name="file"
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
      </ConfigProvider>
    </>
  );
};

export default EditProfile;
