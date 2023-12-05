"use client";

import { useSession } from "next-auth/react";
import React, { useState, useEffect } from "react";
import { Rate, ConfigProvider, Tooltip } from "antd";
import {
  CalendarOutlined,
  LikeFilled,
  DislikeFilled,
  ThunderboltFilled,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import Promo from "@/components/Promo";

const Reviews = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [followingData, setFollowingData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [userImage, setUserImage] = useState(null);
  const [pics, setPics] = useState([]);
  const [popular, setPopular] = useState([]);
  const username = session?.user?.username;

  useEffect(() => {
    fetchData();
    fetchFollowingUsers();
    fetchReviews();
  }, [userData]);

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchData = async () => {
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

      const data = await resGetUser.json();

      setUserData(data.user);
      setFollowingList(data.user.following);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchFollowingUsers = async () => {
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
        console.error("Failed to fetch followers:");
        return;
      }

      const data = await response.json();
      setPics(data.followers);

      const usernames = data.followers.map((item) => item.username);
      setFollowingData(usernames);
    } catch (error) {
      console.error("Error fetching followers:", error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch("/api/getFollowingReviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userIds: followingData,
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
        console.error("Failed to fetch user reviews:");
      }
    } catch (error) {
      console.error("Error fetching user reviews:", error);
    }
  };

  const fetchAlbums = async () => {
    try {
      const response = await fetch("/api/getPopularAlbums", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPopular(data.data);
        } else {
          console.error("Failed to fetch albums:", data.error);
        }
      } else {
        console.error("Failed to fetch albums:");
      }
    } catch (error) {
      console.error("Error fetching albums:", error);
    }
  };

  const userImages = {};
  pics.forEach((pic) => {
    userImages[pic.username] = pic.image;
  });

  const handleUserRoute = (userroute) => {
    router.replace(`/user/${userroute}`);
  };

  const clickedAlbum = (albumID) => {
    router.replace(`/album/${albumID}`);
  };

  const getTooltipTextLiked = (usernames) => {
    if (usernames.length === 0) {
      return "Like";
    }
    return usernames.join(", ");
  };

  const getTooltipTextDisliked = (usernames) => {
    if (usernames.length === 0) {
      return "Dislike";
    }
    return usernames.join(", ");
  };

  const handleLike = async (albumId, reviewId, username) => {
    try {
      const response = await fetch("/api/likeReview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          albumId,
          reviewId,
          username,
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log("Review liked successfully!");
      } else {
        console.error("Failed to like review:", data.error);
      }
    } catch (error) {
      console.error("Error liking review:", error);
    }

    fetchReviews();
  };

  const handleDislike = async (albumId, reviewId, username) => {
    try {
      const response = await fetch("/api/dislikeReview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          albumId,
          reviewId,
          username,
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log("Review disliked successfully!");
      } else {
        console.error("Failed to dislike review:", data.error);
      }
    } catch (error) {
      console.error("Error disliking review:", error);
    }
    fetchReviews();
  };

  const showModal = (review, userImage) => {
    setUserImage(userImage);
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="mt-24 select-none">
      <Promo
        isModalOpen={isModalOpen}
        onClose={handleCloseModal}
        selectedReview={selectedReview}
        userImage={userImage}
      />
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
        {reviews.length > 0 && (
          <div className="px-24">
            <p className="font-bold text-xl">Your friends are saying...</p>
            <div className="flex gap-16">
              <div className="grid grid-cols-1 gap-4 w-4/5">
                {reviews.map((review) => (
                  <div key={`${review._id}-${review.reviews._id}`}>
                    <div className="flex items-center bg-gray-700 p-2 rounded-full mt-6">
                      <div className="flex">
                        <img
                          className="cursor-pointer"
                          onClick={() =>
                            handleUserRoute(review.reviews.username)
                          }
                          style={{
                            width: "50px",
                            height: "50px",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                          src={
                            userImages[review.reviews.username] ||
                            "/images/profile.png"
                          }
                        ></img>
                      </div>
                      <div className="leading-3 ml-2">
                        <p
                          className="font-bold text-sm cursor-pointer hover:text-sky-400"
                          onClick={() =>
                            handleUserRoute(review.reviews.username)
                          }
                        >
                          @{review.reviews.username}
                        </p>
                        <Rate
                          allowHalf
                          defaultValue={review?.reviews.rating}
                          disabled
                          style={{
                            fontSize: "13px",
                            paddingBlock: "2px",
                            borderRadius: "10px",
                          }}
                        />
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm px-4">{" • "}</span>
                        <CalendarOutlined style={{ color: "#9ca3af" }} />
                        <p className="text-xs font-semibold text-gray-400 ml-1 mr-2">
                          {new Date(review.reviews.date)
                            .toDateString()
                            .slice(-11)}
                        </p>
                        <span className="text-sm px-4">{" • "}</span>
                        <div>
                          <ThunderboltFilled
                            className="cursor-pointer"
                            onClick={() =>
                              showModal(
                                review,
                                userImages[review.reviews.username]
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <div
                      className=" absolute pr-2 flex items-center ml-4 mt-4 cursor-pointer hover:bg-gray-700 hover:rounded-lg"
                      onClick={() => clickedAlbum(review._id.albumId)}
                    >
                      <img
                        style={{
                          width: "50px",
                          height: "50px",
                          borderRadius: "10%",
                        }}
                        src={review.image}
                      ></img>
                      <div className="leading-3 ml-2 items-center">
                        <p className="font-bold text-sm">{review.name}</p>
                        <p className="font-normal text-sm">{review.artist}</p>
                      </div>
                    </div>
                    <div className="mt-20">
                      <p className="ml-4 mt-4 font-bold">
                        {review.reviews.title}
                      </p>
                      <p className="p-4 pt-0 mr-4 text-justify">
                        {review.reviews.comment}
                      </p>
                    </div>
                    <div className="ml-4 flex items-center">
                      <Tooltip
                        title={getTooltipTextLiked(review.reviews.liked)}
                      >
                        <LikeFilled
                          style={{
                            color: review.reviews.liked.includes(username)
                              ? "darkseagreen"
                              : "white",
                          }}
                          onClick={() =>
                            handleLike(
                              review._id.albumId,
                              review.reviews._id,
                              username
                            )
                          }
                        />
                      </Tooltip>
                      <p className="px-2 text-sm font-semibold">
                        {review.reviews.liked.length -
                          review.reviews.disliked.length}
                      </p>
                      <Tooltip
                        title={getTooltipTextDisliked(review.reviews.disliked)}
                      >
                        <DislikeFilled
                          style={{
                            color: review.reviews.disliked.includes(username)
                              ? "red"
                              : "white",
                          }}
                          onClick={() =>
                            handleDislike(
                              review._id.albumId,
                              review.reviews._id,
                              username
                            )
                          }
                        />
                      </Tooltip>
                    </div>
                  </div>
                ))}
              </div>
              <div className="w-2/5 -mt-4">
                <p className="text-5xl mb-2 text-center">🪩</p>
                <p className="font-bold text-center leading-4">
                  Popular albums<br></br>this week
                </p>
                {popular.map((album, index) => (
                  <div
                    className="flex rounded mt-4 p-2 items-center hover:bg-gray-700 cursor-pointer"
                    key={album.name}
                    onClick={() => clickedAlbum(album._id.albumId)}
                  >
                    <p className="w-[50px] text-center">#{index + 1}</p>
                    <img
                      src={album.image}
                      style={{
                        width: "50px",
                        borderRadius: "10%",
                      }}
                    ></img>
                    <div className="text-sm leading-4 ml-4 w-[220px]">
                      <p className="font-bold">{album.name}</p>
                      <Rate
                        allowHalf
                        defaultValue={album.averageRating}
                        disabled
                        style={{
                          fontSize: "13px",
                          paddingBlock: "2px",
                          borderRadius: "10px",
                        }}
                      />
                      <p>{album.artist}</p>
                    </div>

                    <p className="text-center w-[50px] font-semibold text-sm">
                      ✍️ {album.reviews.length}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </ConfigProvider>
      <Footer />
    </div>
  );
};

export default Reviews;
