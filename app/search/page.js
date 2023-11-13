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

  const clickedAlbum = (albumID) => {
    router.replace(`/album/${albumID}`);
  };

  const clickedArtist = (artistID) => {
    router.replace(`/artist/${artistID}`);
  };

  return (
    <div className="mt-24 justify-center items-center">
      <div className="ml-24 mb-4 font-bold">
        <button
          className={`border border-white border-solid rounded-xl px-2 py-1 ${
            resultType === "artists" ? "bg-white" : ""
          } ${resultType === "artists" ? "text-midnight" : "text-white"}`}
          onClick={() => setResultType("artists")}
        >
          Artists
        </button>
        <button
          className={`ml-2 border border-white border-solid rounded-xl px-2 py-1 ${
            resultType === "albums" ? "bg-white" : ""
          } ${resultType === "albums" ? "text-midnight" : "text-white"}`}
          onClick={() => setResultType("albums")}
        >
          Albums
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
      ) : (
        <>
          {albums.length === 0 ? (
            <p className="ml-24">😔 No results were found. Please try again!</p>
          ) : (
            <div className="grid grid-cols-6 gap-4 px-24">
              {albums.map((album) => (
                <Card key={album.id} sx={{ width: 190, borderRadius: "5%" }}>
                  <CardActionArea onClick={() => clickedAlbum(album.id)}>
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
      )}
    </div>
  );
}
