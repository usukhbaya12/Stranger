"use client";

import { useSession } from "next-auth/react";
import React, { useState, useEffect } from "react";
import { Rate, ConfigProvider, Select } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";

const Reviews = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [followingData, setFollowingData] = useState([]);
  const [pics, setPics] = useState([]);
  const username = session?.user?.username;

  useEffect(() => {
    const fetchOnPage = async () => {
      if (username) {
        fetchData();
        fetchFollowingUsers();
        fetchReviews();
      }
    };

    fetchOnPage();
  }, [session]);

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

  return (
    <div className="mt-24">
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

            <div className="grid grid-cols-4 gap-4">
              {reviews.map((review) => (
                <div key={review.reviews._id}>
                  <div className="flex items-center bg-gray-700 p-2 rounded-full w-[299px] mt-6">
                    <div className="flex">
                      <img
                        className="cursor-pointer"
                        onClick={() => handleUserRoute(review.reviews.username)}
                        style={{
                          width: "40px",
                          height: "40px",
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
                        onClick={() => handleUserRoute(review.reviews.username)}
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
                    </div>
                  </div>
                  <div>
                    <p className="p-4 w-[299px] h-[176px] text-justify">
                      "
                      {review.reviews.comment.length <= 185
                        ? review.reviews.comment
                        : `${review.reviews.comment.slice(0, 185)}...`}
                      "
                    </p>
                  </div>
                  <div
                    className="flex items-center ml-3 cursor-pointer hover:bg-gray-700 hover:rounded-lg"
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
                </div>
              ))}
            </div>
          </div>
        )}
      </ConfigProvider>
      <Footer />
    </div>
  );
};

export default Reviews;
