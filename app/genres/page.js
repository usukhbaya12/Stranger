"use client";

import { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import { CardActionArea } from "@mui/material";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";

export default function Genres() {
  const [genres, setGenres] = useState([]);
  const [accessToken, setAccessToken] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authResponse = await fetch(
          "https://accounts.spotify.com/api/token",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `grant_type=client_credentials&client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}&client_secret=${process.env.NEXT_PUBLIC_CLIENT_SECRET}`,
          }
        );
        const authData = await authResponse.json();
        setAccessToken(authData.access_token);
      } catch (error) {
        console.error("Error fetching access token: ", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const GenresResponse = await fetch(
          "https://api.spotify.com/v1/recommendations/available-genre-seeds",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + accessToken,
            },
          }
        );
        const GenresData = await GenresResponse.json();
        console.log(GenresData.genres);
        setGenres(GenresData.genres);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };
    fetchGenres();
  }, [accessToken]);

  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const getRandomEmoji = () => {
    const emojis = [
      "🎵",
      "🎶",
      "🎸",
      "🥁",
      "🎹",
      "🎤",
      "🎷",
      "🎺",
      "🎙️",
      "🎻",
      "🎼",
      "🎧",
      "🧑‍🎤",
      "👩‍🎤",
      "👨‍🎤",
      "🪗",
      "🪇",
      "🪈",
      "🪕",
    ];
    return emojis[Math.floor(Math.random() * emojis.length)];
  };

  const filteredGenres = genres
    ? genres.filter((genre) =>
        genre.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  async function handleClickGenre({ genre }) {
    router.replace(`/genres/${genre}`);
  }

  return (
    <div className="mt-24 select-none">
      <p className=" px-24 mb-4 font-bold text-xl">Available Genres</p>
      <TextField
        className="text-white bg-gray-800 rounded-2xl ml-24"
        label="Search Genres"
        variant="outlined"
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          style: {
            color: "white",
            borderRadius: "14px",
            fontFamily: "DM Sans",
          },
          notched: false,
          inputMode: "search",
          endAdornment: (
            <InputAdornment
              style={{ color: "white", fontFamily: "DM Sans", paddingBlock: 0 }}
              position="end"
            >
              <button onClick={() => setSearchTerm("")}>Clear</button>
            </InputAdornment>
          ),
        }}
        InputLabelProps={{
          style: {
            color: "white",
            fontFamily: "DM Sans",
          },
        }}
      />
      <div className="px-24 grid grid-cols-6 gap-4 mt-6 cursor-pointer">
        {filteredGenres?.map((genre) => (
          <Card
            key={genre}
            sx={{
              backgroundColor: getRandomColor(),
              borderRadius: "14px",
              width: 180,
              boxShadow: "none",
            }}
          >
            <CardActionArea onClick={() => handleClickGenre({ genre })}>
              <CardContent>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color="white"
                  fontFamily={"DM Sans"}
                  textAlign="center"
                >
                  {getRandomEmoji()}
                  <br></br>
                  {genre}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </div>
      <Footer />
    </div>
  );
}
