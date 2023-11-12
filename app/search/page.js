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
          const artistParameters = {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + accessToken,
            },
          };

          const response = await fetch(
            `https://api.spotify.com/v1/search?q=${searchParams.q}&type=album%2Cartist&limit=4`,
            artistParameters
          );
          const data = await response.json();
          console.log(data);

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
    <div className="mt-28 justify-center items-center">
      <div className="ml-56 mb-4 font-bold text-xl">
        <p>Artists</p>
      </div>
      {artists.length === 0 ? (
        <p className="ml-56">😔 No results were found. Please try again!</p>
      ) : (
        <div className="grid grid-cols-4 gap-10 px-56">
          {artists.map((artist) => (
            <Card
              key={artist.id}
              sx={{ backgroundColor: "transparent", boxShadow: "none" }}
            >
              <CardActionArea onClick={() => clickedArtist(artist.id)}>
                <CardMedia
                  component="img"
                  sx={{ width: 180, height: 180, borderRadius: "50%" }}
                  image={
                    artist.images[0] ? artist.images[0].url : defaultImageUrl
                  }
                  alt="artist cover"
                />
                <CardContent>
                  <Typography
                    gutterBottom
                    component="div"
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
      <div className="ml-56 mb-4 font-bold text-xl mt-8">
        <p>Albums</p>
      </div>
      {albums.length === 0 ? (
        <p className="ml-56">😔 No results were found. Please try again!</p>
      ) : (
        <div className="grid grid-cols-4 gap-10 px-56">
          {albums.map((album) => (
            <Card key={album.id} sx={{ width: 220, borderRadius: "5%" }}>
              <CardActionArea onClick={() => clickedAlbum(album.id)}>
                <CardMedia
                  component="img"
                  width="180"
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
    </div>
  );
}
