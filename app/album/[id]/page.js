"use client";

import { useState, useEffect } from "react";
import { Card, CardMedia, CardContent, Typography } from "@mui/material";
import { Rate, Input, ConfigProvider, Modal } from "antd";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button, Form, Tooltip } from "antd";
import ShareCard from "@/components/ShareCard";
import Footer from "@/components/Footer";
import {
  LikeFilled,
  DislikeFilled,
  ThunderboltFilled,
} from "@ant-design/icons";

export default function Album() {
  const { data: session } = useSession();
  const { TextArea } = Input;
  const router = useRouter();
  const [album, setAlbum] = useState([]);
  const [accessToken, setAccessToken] = useState("");
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [userRating, setUserRating] = useState(0);
  const [userTitle, setUserTitle] = useState("");
  const [userComment, setUserComment] = useState("");
  const [allReviews, setAllReviews] = useState([]);
  const [userReview, setUserReview] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false);
  const [reviewers, setReviewers] = useState([]);
  const [pics, setPics] = useState([]);
  const [topAlbums, setTopAlbums] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [promoAlbum, setPromoAlbum] = useState(null);
  const [userImage, setUserImage] = useState(null);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const username = session?.user?.username;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authParameters = {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body:
            "grant_type=client_credentials&client_id=" +
            process.env.NEXT_PUBLIC_CLIENT_ID +
            "&client_secret=" +
            process.env.NEXT_PUBLIC_CLIENT_SECRET,
        };
        const response = await fetch(
          "https://accounts.spotify.com/api/token",
          authParameters
        );
        const data = await response.json();
        setAccessToken(data.access_token);
      } catch (error) {
        console.error("Error fetching access token: ", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    fetchReviewData();
    fetchTopAlbums();
  }, [accessToken, username]);

  useEffect(() => {
    fetchAllReviews();
  }, [album]);

  useEffect(() => {
    showFollowersModal();
  });

  const fetchReviewData = async () => {
    try {
      const path = window.location;
      const id = path.toString().slice(-22);

      const artistParameters = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + accessToken,
        },
      };

      const response = await fetch(
        `https://api.spotify.com/v1/albums/${id}`,
        artistParameters
      );
      const data = await response.json();
      setAlbum(data);

      if (username && data.id) {
        const reviewResponse = await fetch("/api/getUserReview", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            albumId: data.id,
            username: username,
          }),
        });

        if (reviewResponse.ok) {
          const reviewData = await reviewResponse.json();
          if (reviewData.success) {
            setUserReview(true);
            setUserRating(reviewData.data.rating || 0);
            setUserTitle(reviewData.data.title || "");
            setUserComment(reviewData.data.comment || "");
          } else {
            setUserReview(false);
          }
        } else {
          console.error(
            "Failed to fetch user review:",
            reviewResponse.statusText
          );
        }
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  const fetchAllReviews = async () => {
    try {
      const response = await fetch("/api/getAlbumReviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          albumId: album.id,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAllReviews(data.data);
          const usernames = data.data.map((item) => item.username);
          setReviewers(usernames);
        } else {
          console.error("Failed to fetch all reviews:", data.error);
        }
      } else {
        console.error("Failed to fetch all reviews:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching all reviews:", error);
    }
  };

  const showFollowersModal = async () => {
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

  const fetchTopAlbums = async () => {
    try {
      const response = await fetch("/api/getTopAlbums");

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTopAlbums(data.data);
        } else {
          console.error("Failed to fetch top albums:", data.error);
        }
      } else {
        console.error("Failed to fetch top albums:");
      }
    } catch (error) {
      console.error("Error fetching top albums:", error);
    }
  };

  const formatDuration = (durationMs) => {
    const minutes = Math.floor(durationMs / 60000);
    const seconds = ((durationMs % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const showFollowingModal = () => {
    setIsFollowingModalOpen(true);
  };

  const handleRatingChange = (value) => {
    setRating(value);
  };

  const clickedArtist = (artistID) => {
    router.replace(`/artist/${artistID}`);
  };

  const showModal = () => {
    handleReview();
    setInfoModalVisible(true);
  };

  const handleOk = () => {
    setInfoModalVisible(false);
    fetchReviewData();
    fetchAllReviews();
    fetchTopAlbums();
  };

  const okButtonProps = {
    style: {
      background: "#4096FF",
      borderColor: "sky",
    },
  };
  const cancelButtonProps = {
    style: {
      display: "none",
    },
  };

  const handleReview = async () => {
    try {
      const response = await fetch("/api/saveReview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          albumId: album.id,
          username: username,
          title: title,
          comment: comment,
          rating: rating,
        }),
      });

      if (!response.ok) {
        console.error("Failed to save review:", response.statusText);
        return;
      }

      console.log("Review saved successfully!");
    } catch (error) {
      console.error("Error saving review:", error);
    }
  };

  const handleDeleteReview = async () => {
    try {
      const response = await fetch("/api/deleteReview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          albumId: album.id,
          username: username,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log("Review deleted successfully!");
          fetchReviewData();
        } else {
          console.error("Failed to delete review:", data.message);
        }
      } else {
        console.error("Failed to delete review:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting review:", error);
    }
    setIsFollowingModalOpen(false);
    fetchAllReviews();
    fetchTopAlbums();
  };

  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) {
      return 0;
    }

    const totalRating = reviews.reduce(
      (sum, review) => sum + (review.rating || 0),
      0
    );
    return totalRating / reviews.length;
  };

  const averageRating = calculateAverageRating(allReviews || []);
  const totalRatings = (allReviews || []).length;

  const userImages = {};
  pics.forEach((pic) => {
    userImages[pic.username] = pic.image;
  });

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

    fetchAllReviews();
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
    fetchAllReviews();
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

  const handleUserRoute = (userroute) => {
    router.replace(`/user/${userroute}`);
  };

  const albumIndex = topAlbums.findIndex(
    (topAlbum) => topAlbum._id === album.id
  );

  const albumYear = new Date(album.release_date).getFullYear();

  const filteredAlbums = albumYear
    ? topAlbums.filter((topAlbum) => {
        return topAlbum.released.slice(0, 4) === albumYear.toString();
      })
    : topAlbums;

  const albumIndexYear = filteredAlbums.findIndex(
    (filteredAlbum) => filteredAlbum._id === album.id
  );

  const showPromo = (review, userImage, album) => {
    setUserImage(userImage);
    setSelectedReview(review);
    setIsPromoModalOpen(true);
    setPromoAlbum(album);
  };

  const handleClosePromo = () => {
    setIsPromoModalOpen(false);
  };

  useEffect(() => {
    const calculateChartData = () => {
      const data = [0, 0, 0, 0, 0];

      allReviews.forEach((review) => {
        const rating = review.rating;
        if (rating >= 0 && rating <= 1) {
          data[0]++;
        } else if (rating > 1 && rating <= 2) {
          data[1]++;
        } else if (rating > 2 && rating <= 3) {
          data[2]++;
        } else if (rating > 3 && rating <= 4) {
          data[3]++;
        } else if (rating > 4 && rating <= 5) {
          data[4]++;
        }
      });

      return data;
    };

    const drawChart = () => {
      const canvas = document.getElementById("albumChart");
      const ctx = canvas.getContext("2d");

      // Clear previous chart
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const chartData = calculateChartData();
      const barHeight = 30;
      const maxBarWidth = 140;
      const margin = 5; // Adjust the margin as needed

      chartData.forEach((value, index) => {
        const y = index * (barHeight + margin);

        // Draw the label (star range) with "DM Sans" font
        ctx.fillStyle = "white";
        ctx.font = "bold 14px 'DM Sans'";
        ctx.textBaseline = "middle";
        ctx.fillText(`${index}-${index + 1} ⭐️`, 10, y + barHeight / 2);

        // Draw the bar
        ctx.fillStyle = "rgba(75, 192, 192, 0.2)";
        ctx.fillRect(
          70,
          y,
          (value / Math.max(...chartData)) * maxBarWidth,
          barHeight
        );

        // Draw the bar border
        ctx.strokeStyle = "rgba(75, 192, 192, 1)";
        ctx.strokeRect(
          70,
          y,
          (value / Math.max(...chartData)) * maxBarWidth,
          barHeight
        );

        // Draw the count on the right side of the bar
        ctx.fillStyle = "white";
        ctx.font = "bold 14px 'DM Sans'";
        ctx.fillText(
          value,
          70 + (value / Math.max(...chartData)) * maxBarWidth + 10,
          y + barHeight / 2
        );
      });
    };

    drawChart();
  }, [allReviews]);

  return (
    <div className="mt-72 select-none">
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
          },
        }}
      >
        <ShareCard
          isModalOpen={isPromoModalOpen}
          onClose={handleClosePromo}
          selectedReview={selectedReview}
          userImage={userImage}
          promoAlbum={promoAlbum}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: "-1",
            width: "100%",
            height: "50%",
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0), rgba(13, 23, 34)), url(${
              album.images?.[0]?.url ||
              "https://i.scdn.co/image/ab6761610000e5eb867008a971fae0f4d913f63a"
            })`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="flex justify-between ml-24 mr-24">
          <div className="flex">
            <Card
              sx={{
                width: 310,
                backgroundColor: "transparent",
                boxShadow: "none",
                position: "relative",
              }}
            >
              <CardMedia
                sx={{
                  borderRadius: "5%",
                  borderColor: "white",
                  borderStyle: "solid",
                  borderWidth: "0.5px",
                }}
                component="img"
                width="180"
                image={
                  album.images?.[0]?.url ||
                  "https://i.scdn.co/image/ab6761610000e5eb867008a971fae0f4d913f63a"
                }
                alt="album cover"
              />
              <CardContent
                sx={{
                  padding: "0",
                  paddingTop: "12px",
                  paddingLeft: "3px",
                }}
              ></CardContent>
            </Card>
            <div className="ml-4">
              <p
                id="albumname"
                className="ml-5 text-3xl mb-1 font-black"
                style={{ maxWidth: "460px" }}
              >
                {album.name}
              </p>
              <Typography
                className="cursor-pointer text-sky-400"
                onClick={() => clickedArtist(album.artists?.[0]?.id)}
                fontSize={17}
                marginTop={-1}
                marginLeft={"20px"}
                variant="body2"
                fontWeight={700}
                fontFamily={"DM Sans"}
              >
                {album.artists?.[0]?.name || "Unknown Artist"}
              </Typography>

              <table
                style={{
                  color: "white",
                  marginLeft: "20px",
                  fontSize: "16px",
                  marginTop: "4px",
                }}
              >
                <tbody>
                  <tr>
                    <td className="font-semibold">Released</td>
                    <td>
                      <Typography
                        variant="body2"
                        fontFamily={"DM Sans"}
                        marginLeft={2}
                        fontSize={16}
                      >
                        {album.release_date}
                      </Typography>
                    </td>
                  </tr>

                  <tr>
                    <td className="font-semibold">Label</td>
                    <td>
                      <Typography
                        variant="body2"
                        fontFamily={"DM Sans"}
                        marginLeft={2}
                        fontSize={16}
                      >
                        {album.label || "N/A"}
                      </Typography>
                    </td>
                  </tr>
                  <tr>
                    <td className="font-semibold">Rating</td>
                    <td>
                      <Typography
                        variant="body2"
                        fontFamily={"DM Sans"}
                        marginLeft={2}
                        fontSize={16}
                      >
                        {" "}
                        {totalRatings > 0 ? (
                          <>
                            <span className="text-sky-400 font-black text-xl">
                              {averageRating.toFixed(2)}
                            </span>{" "}
                            / 5.0 from{" "}
                            <span className="text-gray-400">
                              <span className="font-bold">{totalRatings}</span>{" "}
                              ratings
                            </span>
                          </>
                        ) : (
                          <span className="font-medium">N/A</span>
                        )}
                      </Typography>
                    </td>
                  </tr>
                  <tr>
                    <td className="font-semibold">Ranked</td>
                    <td>
                      <Typography
                        variant="body2"
                        fontFamily={"DM Sans"}
                        marginLeft={2}
                        fontSize={16}
                      >
                        {albumIndex !== -1 ? (
                          <>
                            <span className="font-black">
                              #{albumIndexYear + 1}
                            </span>{" "}
                            for{" "}
                            <a
                              className="font-semibold cursor-pointer text-sky-400"
                              href="/rankings"
                            >
                              {new String(album.release_date).slice(0, 4)}
                            </a>
                            ,{" "}
                            <span className="font-black">
                              #{albumIndex + 1}{" "}
                              <span className="font-normal">
                                of {topAlbums.length}
                              </span>
                            </span>{" "}
                            <a
                              className="font-semibold cursor-pointer text-sky-400"
                              href="/rankings"
                            >
                              overall
                            </a>
                          </>
                        ) : (
                          <span className="font-medium">Not reviewed yet</span>
                        )}
                      </Typography>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div
                style={{
                  color: "white",
                  fontWeight: "400",
                  marginTop: "10px",
                  marginLeft: "20px",
                  fontSize: "14px",
                  lineHeight: "1.2",
                  height: "123px",
                  maxWidth: "420px",
                  overflowX: "auto",
                  overflowY: "scroll",
                  background: "rgb(31 41 55)",
                  border: "white solid 1px",
                  borderRadius: "10px",
                  padding: "5px",
                }}
              >
                <table>
                  <tbody>
                    {album.tracks?.items.map((track, index) => (
                      <tr key={track.id}>
                        <td className="text-center">{index + 1}</td>
                        <td className="pl-2">
                          <strong>{track.name}</strong>{" "}
                          {formatDuration(track.duration_ms)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {userReview && (
            <div>
              <p className="text-center font-semibold">Your rating</p>
              <div className="flex items-center justify-center">
                <Rate
                  allowHalf
                  defaultValue={userRating}
                  disabled
                  style={{
                    fontSize: "30px",
                    paddingInline: "10px",
                    paddingBlock: "5px",
                    borderRadius: "10px",
                  }}
                />
              </div>
              <p className="text-center font-normal">
                <span className="text-2xl font-black text-sky-400">
                  {userRating.toFixed(1)}
                </span>{" "}
                / 5.0
              </p>
              <p className="text-sm font-normal text-center mt-4 -mb-2">
                👇 Click below to modify your review.
              </p>
              <div
                onClick={showFollowingModal}
                className="flex mt-3 border border-white p-2 rounded-xl cursor-pointer hover:bg-gray-600"
                style={{ minWidth: "250px", maxWidth: "350px" }}
              >
                <img
                  className="cursor-pointer"
                  style={{
                    width: "40px",
                    height: "40px",
                    objectFit: "cover",
                    borderRadius: "50%",
                  }}
                  src={userImages[username] || "/images/profile.png"}
                />
                <div className="ml-2 leading-5 font-normal">
                  <p className="cursor-pointer">@{username}</p>
                  <p className="font-semibold">"{userTitle}"</p>
                </div>
              </div>

              <Modal
                title={`My review of ${album.name}`}
                style={{ color: "black" }}
                open={isFollowingModalOpen}
                onCancel={() => setIsFollowingModalOpen(false)}
                footer={
                  <Tooltip
                    className="text-center"
                    title="Are you sure? This action can't be undone."
                  >
                    <Button
                      key="delete"
                      onClick={handleDeleteReview}
                      style={{ color: "red", borderColor: "red" }}
                    >
                      Delete
                    </Button>
                  </Tooltip>
                }
              >
                <p className="font-semibold mt-2">@{username}</p>
                <p className="mt-2 font-semibold">{userTitle}</p>
                <p className="text-justify">{userComment}</p>
              </Modal>
            </div>
          )}
          {!userReview && (
            <div>
              <p className="text-center font-semibold">Rate now 🎯</p>
              <div className="flex items-center justify-center">
                <Rate
                  allowHalf
                  defaultValue={0}
                  onChange={handleRatingChange}
                  style={{
                    fontSize: "30px",
                    paddingInline: "10px",
                    paddingBlock: "5px",
                    borderRadius: "10px",
                  }}
                />
              </div>
              <div className="block font-normal">
                <p className="mt-4 mb-1 font-semibold">
                  Write a review
                  <span className="text-red-600">*</span>
                </p>

                <Form onFinish={showModal} name="title">
                  <Form.Item name="title">
                    <Input
                      style={{
                        color: "white",
                      }}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Title"
                      required={true}
                      value={userTitle}
                    />
                  </Form.Item>
                  <Form.Item name="comment">
                    <TextArea
                      className="bg-gray-800 text-white border"
                      onChange={(event) => setComment(event.target.value)}
                      maxLength={1000}
                      required={true}
                      placeholder="Review"
                      style={{
                        height: 100,
                        color: "white",
                        marginTop: "-16px",
                        minWidth: "250px",
                      }}
                    />
                  </Form.Item>

                  <Form.Item
                    className="text-white -mt-4 items-end flex"
                    style={{ display: "flex", justifyContent: "flex-end" }}
                  >
                    <Button
                      htmlType="submit"
                      style={{
                        backgroundColor: "green",
                        color: "white",
                        borderColor: "white",
                      }}
                    >
                      Submit
                    </Button>
                  </Form.Item>
                </Form>
                <Modal
                  style={{
                    color: "black",
                    titleColor: "black",
                    maxWidth: "400px",
                  }}
                  className="text-gray-800"
                  title="Review Submitted"
                  okButtonProps={okButtonProps}
                  open={infoModalVisible}
                  onOk={handleOk}
                  cancelButtonProps={cancelButtonProps}
                  closeIcon={false}
                >
                  <p>Your review has been submitted successfully!</p>
                </Modal>
              </div>
            </div>
          )}
        </div>
      </ConfigProvider>
      <div className="-mt-3 flex justify-between ml-24 mr-24 font-normal">
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
          <div className="max-w-[800px]">
            <p className="font-bold text-xl">✨ Popular reviews</p>
            {allReviews.length === 0 ? (
              <p className="leading-4 mt-1">
                No reviews found.<br></br>Be the first to review this album!
              </p>
            ) : (
              <ul>
                {allReviews.map((review) => (
                  <li key={review._id}>
                    <div className="flex items-center mt-4 bg-gray-700 rounded-full p-2">
                      <img
                        className="cursor-pointer"
                        style={{
                          width: "40px",
                          height: "40px",
                          objectFit: "cover",
                          borderRadius: "50%",
                        }}
                        src={
                          userImages[review.username] || "/images/profile.png"
                        }
                        onClick={() => handleUserRoute(review.username)}
                      />
                      <div className="ml-2 leading-5 font-normal">
                        <p
                          onClick={() => handleUserRoute(review.username)}
                          className="cursor-pointer"
                        >
                          @{review.username}
                        </p>
                        <Rate
                          allowHalf
                          defaultValue={review.rating}
                          disabled
                          style={{
                            fontSize: "13px",
                            paddingBlock: "2px",
                            borderRadius: "10px",
                          }}
                        />
                      </div>
                      <div className="ml-4 flex items-center">
                        <Tooltip title={getTooltipTextLiked(review.liked)}>
                          <LikeFilled
                            style={{
                              color: review.liked.includes(username)
                                ? "darkseagreen"
                                : "white",
                            }}
                            onClick={() =>
                              handleLike(album.id, review._id, username)
                            }
                          />
                        </Tooltip>
                        <p className="px-2 text-sm font-semibold">
                          {review.liked.length - review.disliked.length}
                        </p>
                        <Tooltip
                          title={getTooltipTextDisliked(review.disliked)}
                        >
                          <DislikeFilled
                            style={{
                              color: review.disliked.includes(username)
                                ? "red"
                                : "white",
                            }}
                            onClick={() =>
                              handleDislike(album.id, review._id, username)
                            }
                          />
                        </Tooltip>
                        <span className="text-sm px-4">{" • "}</span>
                        <ThunderboltFilled
                          className="cursor-pointer"
                          onClick={() =>
                            showPromo(
                              review,
                              userImages[review.username],
                              album
                            )
                          }
                        />
                      </div>
                    </div>
                    <div className="ml-[58px] mt-2">
                      <div className="flex items-center">
                        <p className="font-semibold">{review.title} </p>
                        <span className="text-sm px-2">{" • "}</span>
                        <p className="text-xs font-semibold text-gray-400">
                          {new Date(review.date).toDateString().slice(-11)}
                        </p>
                      </div>

                      <p className="mr-8 text-justify">{review.comment}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <p
              style={{ width: "250px" }}
              className="text-center font-bold items-end"
            >
              Explore {album.name} 🎧
            </p>
            <canvas
              id="albumChart"
              width={240}
              height={200}
              className="mt-4 ml-2"
            ></canvas>
            <p className="text-center -mt-3">Listen on </p>
            <div className="flex justify-center items-center">
              <a href={`https://open.spotify.com/album/${album.id}`}>
                <img
                  className="ml-1 cursor-pointer"
                  src="/images/spotify.png"
                  style={{ height: "24px" }}
                ></img>
              </a>
              <p className="ml-1 bg-green-600 rounded-full w-7 h-7 flex items-center justify-center text-xs font-semibold">
                {album.popularity}
              </p>
            </div>
          </div>
        </ConfigProvider>
      </div>
      <Footer />
    </div>
  );
}
