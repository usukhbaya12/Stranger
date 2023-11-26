"use client";

import React, { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { CardActionArea } from "@mui/material";
import { useRouter } from "next/navigation";

const defaultImageUrl =
  "https://i.scdn.co/image/ab6761610000e5eb867008a971fae0f4d913f63a";
require("dotenv").config();

export default function Search({ searchParams }) {
  const [accessToken, setAccessToken] = useState("");
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [users, setUsers] = useState([]);
  const [resultType, setResultType] = useState("artists");
  const router = useRouter();

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
    if (accessToken) {
      const fetchResults = async () => {
        try {
          const response = await fetch(
            `https://api.spotify.com/v1/search?q=${searchParams.q}&type=album%2Cartist&limit=10`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + accessToken,
              },
            }
          );
          const data = await response.json();

          setAlbums(data.albums.items);
          setArtists(data.artists.items);
        } catch (error) {
          console.error("Error fetching data: ", error);
        }
      };

      fetchResults();
    }
  }, [accessToken, searchParams]);

  const getUsers = async () => {
    try {
      const resGetUsers = await fetch("/api/getUsers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: searchParams.q }),
      });

      if (!resGetUsers.ok) {
        console.error("Failed to fetch user data:", resGetUsers.statusText);
        return;
      }

      const users = await resGetUsers.json();
      setUsers(users.users);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    getUsers();
  }, [searchParams.q]);

  const clickedAlbum = async (
    albumID,
    albumName,
    artistName,
    releaseDate,
    imageUrl,
    label,
    tracks
  ) => {
    try {
      const response = await fetch("/api/saveAlbum", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          albumId: albumID,
          name: albumName,
          artist: artistName,
          released: releaseDate,
          image: imageUrl,
          label: label,
          total_tracks: tracks,
        }),
      });

      if (!response.ok) {
        console.error("Failed to save clicked album:", response.statusText);
        return;
      }

      console.log("Album saved successfully!");

      router.replace(`/album/${albumID}`);
    } catch (error) {
      console.error("Error saving clicked album:", error);
    }
  };

  const clickedArtist = (artistID) => {
    router.replace(`/artist/${artistID}`);
  };

  const clickedUser = (username) => {
    router.replace(`/user/${username}`);
  };

  return (
    <div className="mt-24 justify-center items-center">
      <div className="ml-24 mb-4 font-bold">
        <button
          onClick={() => setResultType("artists")}
          className={`border border-white border-solid rounded-xl px-2 py-1 ${
            resultType === "artists" ? "bg-white" : ""
          } ${resultType === "artists" ? "text-midnight" : "text-white"}`}
        >
          Artists
        </button>
        <button
          onClick={() => setResultType("albums")}
          className={`ml-2 border border-white border-solid rounded-xl px-2 py-1 ${
            resultType === "albums" ? "bg-white" : ""
          } ${resultType === "albums" ? "text-midnight" : "text-white"}`}
        >
          Albums
        </button>
        <button
          onClick={() => setResultType("users")}
          className={`ml-2 border border-white border-solid rounded-xl px-2 py-1 ${
            resultType === "users" ? "bg-white" : ""
          } ${resultType === "users" ? "text-midnight" : "text-white"}`}
        >
          Users
        </button>
      </div>
      {resultType === "artists" ? (
        <>
          {artists.length === 0 ? (
            <p className="ml-24">😔 No results were found. Please try again!</p>
          ) : (
            <div className="grid grid-cols-6 gap-4 px-24">
              {artists.map((artist) => (
                <Card
                  key={artist.id}
                  sx={{
                    backgroundColor: "transparent",
                    boxShadow: "none",
                    width: 180,
                  }}
                >
                  <CardActionArea onClick={() => clickedArtist(artist.id)}>
                    <CardMedia
                      component="img"
                      sx={{
                        width: 180,
                        height: 180,
                        borderRadius: "50%",
                      }}
                      image={
                        artist.images[0]
                          ? artist.images[0].url
                          : defaultImageUrl
                      }
                      alt="artist cover"
                    />
                    <CardContent>
                      <Typography
                        gutterBottom
                        component="div"
                        textAlign={"center"}
                        fontFamily={"DM Sans"}
                        fontWeight={600}
                        lineHeight={0.95}
                        color="white"
                      >
                        {artist.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="white"
                        textAlign={"center"}
                        fontFamily={"DM Sans"}
                        fontStyle={"italic"}
                      >
                        {artist.genres[0]}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : resultType === "albums" ? (
        <>
          {albums.length === 0 ? (
            <p className="ml-24">😔 No results were found. Please try again!</p>
          ) : (
            <div className="grid grid-cols-6 gap-4 px-24">
              {albums.map((album) => (
                <Card key={album.id} sx={{ width: 190, borderRadius: "5%" }}>
                  <CardActionArea
                    onClick={() =>
                      clickedAlbum(
                        album.id,
                        album.name,
                        album.artists[0].name,
                        album.release_date,
                        album.images[0].url,
                        album.label,
                        album.total_tracks
                      )
                    }
                  >
                    <CardMedia
                      component="img"
                      width="120"
                      image={album.images[0].url}
                      alt="album cover"
                    />
                    <CardContent>
                      <Typography
                        gutterBottom
                        component="div"
                        fontFamily={"DM Sans"}
                        fontWeight={600}
                        lineHeight={0.95}
                      >
                        {album.name}
                      </Typography>
                      <Typography variant="body2" fontFamily={"DM Sans"}>
                        {album.artists[0].name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontFamily={"DM Sans"}
                        fontStyle={"italic"}
                      >
                        {album.release_date.substring(0, 4)}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {Array.isArray(users) && users.length === 0 ? (
            <p className="ml-24">😔 No results were found. Please try again!</p>
          ) : (
            <div className="grid grid-cols-6 gap-4 px-24">
              {Array.isArray(users) &&
                users.map((user) => (
                  <Card
                    key={user._id.$oid}
                    sx={{
                      backgroundColor: "transparent",
                      boxShadow: "none",
                      width: 180,
                    }}
                  >
                    <CardActionArea onClick={() => clickedUser(user.username)}>
                      <CardMedia
                        component="img"
                        sx={{
                          width: 180,
                          height: 180,
                          borderRadius: "50%",
                        }}
                        image={user.image || "/images/profile.png"}
                        alt="user profile"
                      />
                      <CardContent>
                        <Typography
                          gutterBottom
                          component="div"
                          textAlign={"center"}
                          fontFamily={"DM Sans"}
                          fontWeight={600}
                          lineHeight={0.95}
                          color="white"
                        >
                          {user.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="white"
                          textAlign={"center"}
                          fontFamily={"DM Sans"}
                          fontStyle={"italic"}
                        >
                          @{user.username}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
