"use client";

import { useSession } from "next-auth/react";
import React, { useState, useEffect } from "react";
import EditProfile from "@/components/EditProfile";
import Modal from "antd/es/modal/Modal";
import { useRouter } from "next/navigation";
import { Rate, ConfigProvider } from "antd";
import { LikeFilled, DislikeFilled, CalendarFilled } from "@ant-design/icons";
import Footer from "@/components/Footer";

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
  const [isArtistModalOpen, setIsArtistModalOpen] = useState(false);
  const [followingList, setFollowingList] = useState([]);
  const [followersData, setFollowersData] = useState([]);
  const [followingData, setFollowingData] = useState([]);
  const [followsYou, setFollowsYou] = useState(0);
  const [starredArtists, setStarredArtists] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [likedReviews, setLikedReviews] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [pics, setPics] = useState([]);

  const router = useRouter();

  useEffect(() => {
    refetchUserData();
    fetchStarredArtists();
    fetchReviews();
    fetchLikedReviews();
  }, [user]);

  useEffect(() => {
    fetchStarredArtists();
    fetchReviews();
    fetchLikedReviews();
  }, []);

  useEffect(() => {
    showPics();
  });

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

  const fetchReviews = async () => {
    try {
      const response = await fetch("/api/getUserReviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: user,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setReviews(data.data);
        } else {
          console.error("Failed to fetch user reviews:", data.error);
        }
      } else {
        console.error("Failed to fetch user reviews:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching user reviews:", error);
    }
  };

  const fetchLikedReviews = async () => {
    try {
      const response = await fetch("/api/getLikedReviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: user,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setLikedReviews(data.data);
          const usernames = data.data.map((item) => item.likedReview.username);
          setReviewers(usernames);
        } else {
          console.error("Failed to fetch user reviews:", data.error);
        }
      } else {
        console.error("Failed to fetch user reviews:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching user reviews:", error);
    }
  };

  const showPics = async () => {
    try {
      const response = await fetch("/api/getReviewers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userIds: reviewers,
        }),
      });

      if (!response.ok) {
        console.error("Failed to fetch followers:", response.statusText);
        return;
      }

      const data = await response.json();
      setPics(data.followers);
    } catch (error) {
      console.error("Error fetching followers:", error);
    }
  };

  const fetchStarredArtistsModal = () => {
    setIsArtistModalOpen(true);
  };

  const fetchStarredArtists = async () => {
    try {
      const response = await fetch("/api/getUserArtists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: user,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStarredArtists(data.data);
        } else {
          console.error("Failed to fetch starred artists:", data.error);
        }
      } else {
        console.error("Failed to fetch starred artists:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching starred artists:", error);
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

  const clickedArtist = (artistID) => {
    router.replace(`/artist/${artistID}`);
  };

  const clickedAlbum = (albumID) => {
    router.replace(`/album/${albumID}`);
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

  const userImages = {};
  pics.forEach((pic) => {
    userImages[pic.username] = pic.image;
  });

  return (
    <div>
      <ConfigProvider
        theme={{
          components: {
            Modal: {
              titleColor: "black",
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
        {notFound ? (
          <p className="flex justify-center mt-32">User not found.</p>
        ) : (
          <div className="mt-28 ml-24 flex justify-between">
            <div className="flex">
              <img
                src={avatar || "/images/profile.png"}
                style={{
                  width: 180,
                  height: 180,
                  objectFit: "cover",
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
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                          }}
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
                <p className="text-2xl text-center font-bold">
                  {reviews.length}
                </p>
                <p>Albums</p>
              </div>
              <div className="px-4">
                <p className="text-2xl text-center font-bold">
                  {starredArtists.length > 0 ? (
                    <span
                      className="text-sky-400 cursor-pointer"
                      onClick={fetchStarredArtistsModal}
                    >
                      {starredArtists.length}
                    </span>
                  ) : (
                    <span className="text-gray-400">
                      {starredArtists.length}
                    </span>
                  )}
                </p>
                <p>⭐️ Artists</p>
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
                title="Favorite Artists"
                open={isArtistModalOpen}
                onCancel={() => setIsArtistModalOpen(false)}
                footer={null}
              >
                {Array.isArray(starredArtists) &&
                  starredArtists.map((artist) => (
                    <div className="flex mt-3 items-center" key={artist.id}>
                      <img
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                          borderRadius: "50%",
                        }}
                        className="cursor-pointer hover:border hover:rounded-full hover:border-midnight"
                        onClick={() => clickedArtist(artist._id)}
                        src={artist.image || "/images/profile.png"}
                        alt={artist.name}
                      />
                      <div className="ml-2 leading-4">
                        <p
                          onClick={() => clickedArtist(artist._id)}
                          className="hover:text-sky-400 cursor-pointer font-semibold"
                        >
                          {artist.name}
                        </p>
                      </div>
                    </div>
                  ))}
              </Modal>
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
                          objectFit: "cover",
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
                          objectFit: "cover",
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

        <div className="ml-24 mt-4">
          <p className="text-xl font-bold">
            ✨ Recent reviews - {reviews.length}
          </p>
          {reviews.length > 0 ? (
            <div className="mr-24 mt-2">
              {reviews.map((review, index) => (
                <React.Fragment key={review._id}>
                  <div
                    className="hover:bg-gray-700 rounded p-3 flex items-center rounded-lg mt-2 justify-between cursor-pointer"
                    onClick={() => clickedAlbum(review._id)}
                  >
                    <div className="flex w-80 items-center">
                      <img
                        src={review.image}
                        style={{ width: "50px", borderRadius: "10%" }}
                      ></img>
                      <div className="leading-5 ml-2">
                        <p className="font-bold">{review.name}</p>
                        <p>{review.artist}</p>
                      </div>
                    </div>

                    <div className="leading-5 w-40 text-center flex-col">
                      <p className="font-bold">{review.reviews[0]?.title}</p>
                      <Rate
                        allowHalf
                        defaultValue={review?.reviews[0]?.rating}
                        disabled
                        style={{
                          fontSize: "13px",
                          paddingBlock: "2px",
                          borderRadius: "10px",
                        }}
                      />
                    </div>
                    <div className="flex items-center">
                      <LikeFilled />
                      <p className="font-semibold text-sm ml-1 mr-3">
                        {review.reviews[0].liked.length}
                      </p>
                      <DislikeFilled />
                      <p className="font-semibold text-sm ml-1">
                        {review.reviews[0].disliked.length}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <CalendarFilled />
                      <p className="ml-1 text-sm font-semibold">
                        {new Date(review.reviews[0]?.date)
                          .toDateString()
                          .slice(-11)}
                      </p>
                    </div>
                  </div>
                  {index !== reviews.length - 1 && (
                    <hr className="border-t border-white my-2" />
                  )}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <p>{user} has not reviewed any albums yet.</p>
          )}
        </div>
        <div className="mt-4 ml-24">
          <p className="font-bold text-xl">👍 Liked reviews</p>
          {likedReviews.length > 0 ? (
            <div
              className="mt-4 mr-24 flex gap-4"
              style={{ overflowX: "auto" }}
            >
              {likedReviews.map((review) => (
                <div
                  key={review.likedReview._id}
                  className="border border-white rounded-lg p-3 hover:bg-gray-700 cursor-pointer"
                  style={{ minWidth: "200px" }}
                  onClick={() => clickedAlbum(review._id)}
                >
                  <div className="flex flex-col items-center mb-4">
                    <div className="flex items-center">
                      <img
                        src={review.image}
                        style={{ width: "30px", borderRadius: "10%" }}
                      ></img>
                      <div className="leading-5 ml-2">
                        <p className="font-semibold text-xs">{review.name}</p>
                        <p className="text-xs">{review.artist}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <img
                      src={
                        userImages[review.likedReview.username] ||
                        "/images/profile.png"
                      }
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                        borderRadius: "50%",
                      }}
                    ></img>
                    <div className="ml-2 leading-5 flex flex-col">
                      <p className="font-semibold">
                        @{review.likedReview.username}
                      </p>
                      <p>{review.likedReview.title}</p>
                      <Rate
                        allowHalf
                        defaultValue={review?.likedReview.rating}
                        disabled
                        style={{
                          fontSize: "13px",
                          paddingBlock: "2px",
                          borderRadius: "10px",
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>{user} has not liked any reviews yet.</div>
          )}
        </div>
      </ConfigProvider>
      <Footer />
    </div>
  );
}
