"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
} from "@mui/material";
import { Rate, Flex, Input } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Album() {
  const { TextArea } = Input;
  const router = useRouter();
  const [album, setAlbum] = useState([]);
  const [accessToken, setAccessToken] = useState("");
  const [isTracklistExpanded, setTracklistExpanded] = useState(false);
  const [rating, setRating] = useState(0);

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
    const fetchAlbum = async () => {
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
        console.log(data);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchAlbum();
  }, [accessToken]);

  const handleToggleTracklist = () => {
    setTracklistExpanded(!isTracklistExpanded);
  };

  const formatDuration = (durationMs) => {
    const minutes = Math.floor(durationMs / 60000);
    const seconds = ((durationMs % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleRatingChange = (value) => {
    setRating(value);
  };

  const clickedArtist = (artistID) => {
    router.replace(`/artist/${artistID}`);
  };

  return (
    <div className="mt-28 font-bold">
      <div className="flex justify-between ml-24 mr-24">
        <div className="flex">
          <Card
            sx={{
              width: 400,
              backgroundColor: "transparent",
              boxShadow: "none",
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
            >
              <Typography
                gutterBottom
                component="div"
                fontFamily={"DM Sans"}
                fontWeight={600}
                lineHeight={0.95}
                color="white"
                fontSize={24}
              >
                {album.name}
              </Typography>
              <Typography
                className="cursor-pointer text-sky-400"
                onClick={() => clickedArtist(album.artists?.[0]?.id)}
                fontSize={17}
                marginTop={-1}
                variant="body2"
                fontWeight={600}
                fontFamily={"DM Sans"}
              >
                {album.artists?.[0]?.name || "Unknown Artist"}
              </Typography>
              <Button
                className="bg-white hover:bg-midnight border-transparent"
                variant="outlined"
                sx={{
                  borderColor: "white",
                  marginTop: "4px",
                  textTransform: "none",
                  marginBottom: "4px",
                  padding: "0px",
                  paddingLeft: "6px",
                  paddingRight: "6px",
                  fontWeight: "500",
                  fontFamily: "DM Sans",
                  backgroundColor: "white",
                  "&:hover": {
                    backgroundColor: "white",
                  },
                }}
                onClick={handleToggleTracklist}
              >
                {isTracklistExpanded ? "Hide Tracklist" : "See Tracklist"}
              </Button>
              {isTracklistExpanded && (
                <div
                  style={{ color: "white", fontWeight: "400", marginTop: "2" }}
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
              )}
            </CardContent>
          </Card>
          <div className="ml-4 max-w-sm">
            <p className="ml-5 text-2xl">💽 {album.name}</p>
            <table
              style={{ color: "white", marginLeft: "20px", fontSize: "16px" }}
            >
              <tbody>
                <tr>
                  <td>Artist</td>
                  <td>
                    <Typography
                      className="cursor-pointer text-sky-400"
                      variant="body2"
                      fontFamily={"DM Sans"}
                      marginLeft={2}
                      fontSize={16}
                      fontWeight={800}
                      onClick={() => clickedArtist(album.artists?.[0]?.id)}
                    >
                      {album.artists?.[0]?.name || "Unknown Artist"}
                    </Typography>
                  </td>
                </tr>
                <tr>
                  <td>Type</td>
                  <td>
                    <Typography
                      variant="body2"
                      textTransform="capitalize"
                      fontFamily={"DM Sans"}
                      marginLeft={2}
                      fontSize={16}
                    >
                      {album.type}
                    </Typography>
                  </td>
                </tr>
                <tr>
                  <td>Released</td>
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
                  <td>Popularity</td>
                  <td>
                    <Typography
                      variant="body2"
                      fontFamily={"DM Sans"}
                      marginLeft={2}
                      fontSize={16}
                    >
                      {album.popularity}
                    </Typography>
                  </td>
                </tr>
                <tr>
                  <td>Label</td>
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
                  <td>Rating</td>
                  <td>
                    <Typography
                      variant="body2"
                      fontFamily={"DM Sans"}
                      marginLeft={2}
                      fontSize={16}
                    >
                      4.93/5.0 from 17 ratings
                    </Typography>
                  </td>
                </tr>
                <tr>
                  <td>Ranked</td>
                  <td>
                    <Typography
                      variant="body2"
                      fontFamily={"DM Sans"}
                      marginLeft={2}
                      fontSize={16}
                    >
                      #1 for 2017, #5 for overall
                    </Typography>
                  </td>
                </tr>
              </tbody>
            </table>
            <p className="mt-4 ml-5 text-xl mb-1">🎯 Rate now</p>
            <div>
              <div className="flex items-center">
                <Rate
                  allowHalf
                  defaultValue={0}
                  onChange={handleRatingChange}
                  style={{
                    marginLeft: "20px",
                    fontSize: "20px",
                    border: "1px solid #ccc",
                    paddingInline: "10px",
                    paddingBlock: "5px",
                    backgroundColor: "#fff",
                    borderRadius: "10px",
                  }}
                />
                <p
                  style={{
                    marginLeft: "10px",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  {rating.toFixed(2)}
                </p>
              </div>
              <div className="block ml-5 font-normal">
                <p className="mt-4 mb-1">
                  <strong>Write a review</strong>
                </p>
                <Flex vertical gap={8}>
                  <Input
                    placeholder="Title"
                    maxLength={20}
                    required={true}
                    style={{ fontFamily: "DM Sans" }}
                  />
                  <TextArea
                    showCount
                    maxLength={250}
                    required={true}
                    placeholder="Review"
                    style={{
                      height: 120,
                    }}
                  />
                </Flex>
                <Link
                  type="button"
                  href="#"
                  className="mt-2 font-semibold text-white bg-green-800 hover:bg-green-900 focus:ring-green-300 rounded-lg text-sm px-2 py-1.5 mr-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 focus:outline-none dark:focus:ring-green-800"
                >
                  Submit
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="ml-8 max-w-sm font-normal">
          <p className="text-right text-xl font-bold">Reviews</p>
          <p className="text-right">Usukhu</p>
          <p className="text-right">
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text
            ever since the 1500s, when an unknown printer took a galley of type
            and scrambled it to make a type specimen book. It has survived not
            only five centuries, but also the leap into electronic typesetting,
            remaining essentially unchanged. It was popularised in the 1960s
            with the release of Letraset sheets containing Lorem Ipsum passages,
            and more recently with desktop publishing software like Aldus
            PageMaker including versions of Lorem Ipsum.
          </p>
        </div>
      </div>
    </div>
  );
}
