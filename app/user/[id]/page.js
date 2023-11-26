"use client";

import { useSession } from "next-auth/react";
import React, { useState, useEffect } from "react";
import EditProfile from "@/components/EditProfile";
import Modal from "antd/es/modal/Modal";
import { useRouter } from "next/navigation";

export default function Profile() {
  const { data: session } = useSession();
  const [user, setUser] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [isFollowing, setIsFollowing] = useState("");
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [unfollowModalOpen, setUnfollowModalOpen] = useState(false);
  const [unfollowConfirmLoading, setUnfollowConfirmLoading] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false);
  const [followingList, setFollowingList] = useState([]);
  const [followersData, setFollowersData] = useState([]);
  const [followingData, setFollowingData] = useState([]);
  const [followsYou, setFollowsYou] = useState(0);

  const router = useRouter();

  useEffect(() => {
    refetchUserData();
  }, [user]);

  const refetchUserData = async () => {
    const path = window.location;
    const username = path.toString().split("/").pop();
    setUser(username);

    try {
      const resGetUser = await fetch("/api/getUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });

      if (!resGetUser.ok) {
        console.error("Failed to fetch user data:", resGetUser.statusText);
        return;
      }

      const userData = await resGetUser.json();
      console.log("User data:", userData);

      if (!userData.user) {
        setNotFound(true);
        return;
      }

      setNotFound(false);

      setName(userData.user.name);
      setBio(userData.user.bio);
      setAvatar(userData.user.image);
      setUsername(userData.user.username);
      setFollowers(userData.user.followers.length);
      setFollowing(userData.user.following.length);
      setFollowersList(userData.user.followers);
      setFollowingList(userData.user.following);

      if (userData.user.following.includes(session?.user?.id)) {
        setFollowsYou(1);
      } else {
        setFollowsYou(0);
      }

      if (userData.user.followers.includes(session?.user?.id)) {
        setIsFollowing(true);
      } else {
        setIsFollowing(false);
      }

      console.log(userData.user.followers, session?.user?.id);
      console.log("ses: ", session);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
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

  const showFollowersModal = async () => {
    try {
      const response = await fetch("/api/getFollowers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userIds: followersList,
        }),
      });

      if (!response.ok) {
        console.error("Failed to fetch followers:", response.statusText);
        return;
      }

      const data = await response.json();
      setFollowersData(data.followers);

      setIsFollowersModalOpen(true);
    } catch (error) {
      console.error("Error fetching followers:", error);
    }
  };

  const showFollowingModal = async () => {
    try {
      const response = await fetch("/api/getFollowers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userIds: followingList,
        }),
      });

      if (!response.ok) {
        console.error("Failed to fetch followers:", response.statusText);
        return;
      }

      const data = await response.json();
      setFollowingData(data.followers);

      setIsFollowingModalOpen(true);
    } catch (error) {
      console.error("Error fetching followers:", error);
    }
  };

  const isCurrentUser = session?.user?.username === username;

  const handleFollowToggle = async () => {
    try {
      const res = await fetch("/api/followUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usernameToFollow: username,
          currentUser: session?.user?.username,
        }),
      });

      if (!res.ok) {
        console.error("Failed to follow user:", res.statusText);
        return;
      }

      const data = await res.json();
      setIsFollowing(true);
      setFollowers((prevCount) => prevCount + 1);
      refetchUserData();
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  const handleUnfollowToggle = async () => {
    try {
      const res = await fetch("/api/unfollowUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usernameToUnfollow: username,
          currentUser: session?.user?.username,
        }),
      });

      if (!res.ok) {
        console.error("Failed to unfollow user:", res.statusText);
        return;
      }
      setUnfollowConfirmLoading(true);
      setTimeout(() => {
        setUnfollowModalOpen(false);
        setUnfollowConfirmLoading(false);
      }, 1000);

      const data = await res.json();
      setIsFollowing(false);
      setFollowers((prevCount) => Math.max(prevCount - 1, 0));
      refetchUserData();
    } catch (error) {
      console.error("Error unfollowing user:", error);
    }
  };

  const showUnfollowModal = () => {
    setUnfollowModalOpen(true);
  };

  const handleUnfollowCancel = () => {
    console.log("Clicked cancel button");
    setUnfollowModalOpen(false);
  };

  const okButtonProps = {
    style: {
      background: "#4096FF",
      borderColor: "sky",
    },
  };

  const handleUserRoute = (userroute) => {
    router.replace(`/user/${userroute}`);
  };

  return (
    <div>
      {notFound ? (
        <p className="flex justify-center mt-32">User not found.</p>
      ) : (
        <div className="mt-32 ml-24 flex justify-between">
          <div className="flex">
            <img
              src={avatar || "/images/profile.png"}
              style={{
                width: 180,
                height: 180,
                borderRadius: "50%",
              }}
              alt="Profile"
            />
            <div className="ml-4 mt-4">
              <div className="flex items-center">
                <p>@ </p>
                <p className="text-3xl font-bold">{username}</p>
                {followsYou > 0 ? (
                  <p className="ml-2 bg-gray-500 px-2 rounded text-xs">
                    Follows you
                  </p>
                ) : (
                  <p></p>
                )}
              </div>
              <p className="text-sky-400 font-semibold">{name}</p>
              <p className="mb-8">{bio}</p>

              <div>
                <EditProfile
                  isModalOpen={isModalOpen}
                  onClose={handleCloseModal}
                  onProfileUpdate={handleProfileUpdate}
                />
                {isCurrentUser ? (
                  <a
                    onClick={showModal}
                    className="-ml-28 font-semibold px-2 py-1 rounded cursor-pointer bg-white text-midnight hover:bg-midnight hover:text-white"
                  >
                    👤 Edit Profile
                  </a>
                ) : (
                  <button
                    onClick={
                      isFollowing ? showUnfollowModal : handleFollowToggle
                    }
                    className={`-ml-20 font-semibold px-2 py-1 rounded cursor-pointer ${
                      isFollowing
                        ? "bg-yellow-500 text-midnight hover:bg-red-500"
                        : "bg-white text-midnight hover:bg-midnight hover:text-white"
                    }`}
                  >
                    {isFollowing && (
                      <span
                        style={{ display: "inline-flex", alignItems: "center" }}
                      >
                        Following{"\u00A0"}
                        <span
                          style={{
                            fontSize: "1em",
                            fontWeight: "800",
                            marginTop: "-6px",
                          }}
                        >
                          {"\u2304"}
                        </span>
                      </span>
                    )}
                    {!isFollowing && "+ Follow"}
                  </button>
                )}

                <Modal
                  title="Unfollow user"
                  open={unfollowModalOpen}
                  onOk={handleUnfollowToggle}
                  confirmLoading={unfollowConfirmLoading}
                  onCancel={handleUnfollowCancel}
                  okButtonProps={okButtonProps}
                >
                  <p>
                    Are you sure you want to unfollow{" "}
                    <strong>{username}</strong>?
                  </p>
                </Modal>
              </div>
            </div>
          </div>

          <div className="justify-end mr-24 flex mt-8">
            <div className="px-4">
              <p className="text-2xl text-center font-bold">0</p>
              <p>Albums</p>
            </div>
            <div className="px-4">
              <p className="text-2xl text-center font-bold">
                {followers > 0 ? (
                  <span
                    className="text-sky-400 cursor-pointer"
                    onClick={showFollowersModal}
                  >
                    {followers}
                  </span>
                ) : (
                  <span className="text-gray-400">{followers}</span>
                )}
              </p>
              <p>Followers</p>
            </div>
            <div className="px-4">
              <p className="text-2xl text-center font-bold">
                {following > 0 ? (
                  <span
                    className="text-sky-400 cursor-pointer"
                    onClick={showFollowingModal}
                  >
                    {following}
                  </span>
                ) : (
                  <span className="text-gray-400">{following}</span>
                )}
              </p>
              <p>Following</p>
            </div>
            <Modal
              title="Followers"
              open={isFollowersModalOpen}
              onCancel={() => setIsFollowersModalOpen(false)}
              footer={null}
            >
              {Array.isArray(followersData) &&
                followersData.map((follower) => (
                  <div className="flex mt-3" key={follower._id}>
                    <img
                      className="cursor-pointer hover:border hover:rounded-full hover:border-midnight"
                      width={"50px"}
                      onClick={() => handleUserRoute(follower.username)}
                      src={follower.image || "/images/profile.png"}
                      alt={follower.name}
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                      }}
                    />
                    <div className="ml-2 leading-4">
                      <p
                        onClick={() => handleUserRoute(follower.username)}
                        className="mt-2 hover:text-sky-400 cursor-pointer font-semibold"
                      >
                        {follower.name}
                      </p>
                      <p>@{follower.username}</p>
                    </div>
                  </div>
                ))}
            </Modal>

            <Modal
              title="Following"
              open={isFollowingModalOpen}
              onCancel={() => setIsFollowingModalOpen(false)}
              footer={null}
            >
              {Array.isArray(followingData) &&
                followingData.map((following) => (
                  <div className="flex mt-3" key={following._id}>
                    <img
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                      }}
                      className="cursor-pointer hover:border hover:rounded-full hover:border-midnight"
                      onClick={() => handleUserRoute(following.username)}
                      src={following.image || "/images/profile.png"}
                      alt={following.name}
                    />
                    <div className="ml-2 leading-4">
                      <p
                        onClick={() => handleUserRoute(following.username)}
                        className="mt-2 hover:text-sky-400 cursor-pointer font-semibold"
                      >
                        {following.name}
                      </p>
                      <p>@{following.username}</p>
                    </div>
                  </div>
                ))}
            </Modal>
          </div>
        </div>
      )}
    </div>
  );
}
