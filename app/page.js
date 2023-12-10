"use client";

import Head from "next/head";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { CardActionArea } from "@mui/material";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import { FacebookFilled, YoutubeFilled } from "@ant-design/icons";

export default function Home() {
  const { data: session } = useSession();
  const [grammysAlbums, setGrammysAlbums] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [accessToken, setAccessToken] = useState("");
  const date = new Date();
  const router = useRouter();
  const username = session?.user?.username;

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
        // console.error("Error fetching access token: ", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchNewReleases = async () => {
      try {
        const artistParameters = {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + accessToken,
          },
        };

        const response = await fetch(
          `https://api.spotify.com/v1/browse/new-releases?limit=50`,
          artistParameters
        );
        const data = await response.json();
        setAlbums(data.albums.items);
      } catch (error) {
        // console.error("Error fetching data: ", error);
      }
    };

    const fetchGrammysAlbums = async () => {
      try {
        const grammysResponse = await fetch(
          "https://api.spotify.com/v1/playlists/2LoI7SSDNjskpTMipZBvtB/tracks?fields=items.track.album&limit=16",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + accessToken,
            },
          }
        );
        const grammysData = await grammysResponse.json();
        setGrammysAlbums(grammysData.items.map((item) => item.track.album));
      } catch (error) {
        // console.error("Error fetching Grammys data: ", error);
      }
    };

    fetchNewReleases();
    fetchGrammysAlbums();
  }, [accessToken]);

  const filteredAlbums = grammysAlbums.filter(
    (album) => album.album_type === "album"
  );

  const New = albums.filter((album) => album.album_type === "album");
  const NewAlbums = New.slice(0, 6);

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

  return (
    <main className="select-none">
      <Head>
        <title>Stranger</title>
      </Head>
      <img src="/images/tswift.png" alt="Taylor Swift"></img>
      {session ? (
        <div className="text-center -mt-32 leading-6 ">
          <h2 className="text-2xl font-bold">Welcome, {username} 🪩</h2>
          <p>Here's what we've been listening...</p>
        </div>
      ) : (
        <div className="text-center -mt-20 leading-6 text-2xl font-bold">
          <h2>Track albums you listened.</h2>
          <h2>Save those you want to listen.</h2>
          <h2>Tell your friends what's good.</h2>
          <div className="flex justify-center mt-4 items-center">
            <img src={"/images/Stranger-PNG.png"} width={"100px"}></img>
            <a className="ml-1" href="https://facebook.com/Strangerentnews">
              <FacebookFilled></FacebookFilled>
            </a>
            <a className="ml-1" href="https://youtube.com/@StrangerTVMongolia">
              <YoutubeFilled></YoutubeFilled>
            </a>
          </div>
          <div
            id="NewMusic"
            className="container mx-auto flex justify-center mt-4"
          >
            <Link
              href="/signup"
              className="font-semibold text-white bg-green-800 hover:bg-green-900 focus:ring-green-300 rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 focus:outline-none dark:focus:ring-green-800"
            >
              🎙️ Get started now.
            </Link>
          </div>
        </div>
      )}

      <div>
        <p className="ml-24 mt-6 font-bold text-xl">New Releases</p>
        <p className="ml-24 -mt-2 mb-4">
          As of <i>{date.toDateString()}</i>
        </p>
        {NewAlbums.length === 0 ? (
          <p className="ml-56"></p>
        ) : (
          <div className="grid grid-cols-6 gap-10 px-24 mr-16">
            {NewAlbums.map((album) => (
              <Card key={album.id} sx={{ width: 220, borderRadius: "5%" }}>
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
                    width="180"
                    image={
                      album.images && album.images[0]
                        ? album.images[0].url
                        : defaultImageUrl
                    }
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
      <div className="mt-8 px-56">
        <p className="mb-4 text-center">
          With <strong>Stranger,</strong> you can...
        </p>
        <div className="flex justify-center gap-6">
          <Card
            className="border-solid border border-dashed rounded-3xl bg-gray-800 hover:bg-red-900 cursor-pointer"
            sx={{ maxWidth: 240 }}
          >
            <CardContent>
              <Typography
                className="text-center"
                sx={{ fontFamily: "DM Sans" }}
                variant="h3"
                component="div"
              >
                👁️
              </Typography>
              <Typography
                className="text-center"
                sx={{
                  fontFamily: "DM Sans",
                  color: "white",
                  lineHeight: "0.95",
                }}
                variant="body2"
              >
                Keep track of every album you've ever listened.
              </Typography>
            </CardContent>
          </Card>
          <Card
            className="border-solid border border-dashed rounded-3xl bg-gray-800 hover:bg-blue-900 cursor-pointer"
            sx={{ maxWidth: 240 }}
          >
            <CardContent>
              <Typography
                className="text-center"
                sx={{ fontFamily: "DM Sans" }}
                variant="h3"
                component="div"
              >
                🖋️
              </Typography>
              <Typography
                className="text-center"
                sx={{
                  fontFamily: "DM Sans",
                  color: "white",
                  lineHeight: "0.95",
                }}
                variant="body2"
              >
                Write and share reviews, and follow friends and other members to
                read theirs.
              </Typography>
            </CardContent>
          </Card>
          <Card
            className="border-solid border border-dashed rounded-3xl bg-gray-800 hover:bg-green-900 cursor-pointer"
            sx={{ maxWidth: 240 }}
          >
            <CardContent>
              <Typography
                className="text-center"
                sx={{ fontFamily: "DM Sans" }}
                variant="h3"
                component="div"
              >
                ⭐️
              </Typography>
              <Typography
                className="text-center"
                sx={{
                  fontFamily: "DM Sans",
                  color: "white",
                  lineHeight: "0.95",
                }}
                variant="body2"
              >
                Rate each album on a five-star scale (with halves) to share your
                reaction.
              </Typography>
            </CardContent>
          </Card>
        </div>
      </div>
      <div id="Grammys2024">
        <p className="ml-24 mt-12 font-bold text-xl">Grammys 2024 🏆</p>
        <p className="ml-24 -mt-2 mb-4">
          Rate this year's Grammy-nominated albums.
        </p>
        {filteredAlbums.length === 0 ? (
          <p className="ml-56"></p>
        ) : (
          <div className="grid grid-cols-8 gap-2 px-24 mr-8">
            {filteredAlbums.map((album) => (
              <Card
                className="bg-transparent"
                key={album.id}
                sx={{ width: 170, boxShadow: "none" }}
              >
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
                    sx={{ borderRadius: "10%" }}
                    component="img"
                    width="180"
                    image={
                      album.images && album.images[0]
                        ? album.images[0].url
                        : defaultImageUrl
                    }
                    alt="album cover"
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
                      {album.name}
                    </Typography>
                    <Typography
                      className="text-slate-300"
                      variant="body2"
                      fontFamily={"DM Sans"}
                    >
                      {album.artists[0].name}
                    </Typography>
                    <Typography
                      className="text-slate-200"
                      variant="body2"
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
      <Footer />
    </main>
  );
}
