"use client";

import { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { CardActionArea } from "@mui/material";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import { StarFilled } from "@ant-design/icons";
import { Tooltip } from "antd";
import { useSession } from "next-auth/react";

const defaultImageUrl =
  "https://i.scdn.co/image/ab6761610000e5eb867008a971fae0f4d913f63a";

const Artist = () => {
  const { data: session } = useSession();
  const [artist, setArtist] = useState([]);
  const [localArtist, setLocalArtist] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [relatedArtists, setRelatedArtists] = useState([]);
  const [accessToken, setAccessToken] = useState("");
  const router = useRouter();
  const username = session?.user?.username;
  const userId = session?.user?.id;

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

  const fetchArtistData = async (url, setStateCallback) => {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + accessToken,
        },
      });
      const data = await response.json();
      setStateCallback(data);
      console.log(data);
    } catch (error) {
      console.error(`Error fetching data: ${error}`);
    }
  };

  useEffect(() => {
    if (accessToken) {
      const artistId = window.location.toString().slice(-22);
      fetchArtistData(
        `https://api.spotify.com/v1/artists/${artistId}`,
        setArtist
      );
      fetchArtistData(
        `https://api.spotify.com/v1/artists/${artistId}/related-artists`,
        (data) => setRelatedArtists(data.artists || [])
      );
    }
    fetchArtistLocal();
  }, [accessToken]);

  useEffect(() => {
    if (accessToken) {
      const artistId = window.location.toString().slice(-22);
      fetchArtistData(
        `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album&limit=20`,
        (data) => setAlbums(data.items || [])
      );
    }
  }, [accessToken]);

  const fetchArtistLocal = async () => {
    try {
      const response = await fetch("/api/getArtist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          artistId: window.location.toString().slice(-22),
        }),
      });
      if (response.ok) {
        const data = await response.json();

        setLocalArtist(data.data);
      } else {
        console.error("Failed to fetch artist:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching artist:", error);
    }

    console.log("haha", localArtist);
  };

  const handleClickAlbum = async (
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

  const handleLike = async (artistId, username) => {
    try {
      const response = await fetch("/api/starArtist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          artistId,
          username,
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log("Artist liked successfully!");
      } else {
        console.error("Failed to like artist:", data.error);
      }
    } catch (error) {
      console.error("Error liking artist:", error);
    }
    fetchArtistLocal();
  };

  const handleClickArtist = async (
    artistID,
    name,
    popularity,
    imageUrl,
    followers,
    genres
  ) => {
    try {
      const response = await fetch("/api/saveArtist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          artistID: artistID,
          name: name,
          popularity: popularity,
          imageUrl: imageUrl,
          followers: followers,
          genres: genres,
        }),
      });

      if (!response.ok) {
        console.error("Failed to save clicked artist:", response.statusText);
        return;
      }

      console.log("Artist saved successfully!");

      router.replace(`/artist/${artistID}`);
    } catch (error) {
      console.error("Error saving clicked album:", error);
    }
  };

  return (
    <div className=" mt-32 select-none">
      <div className="flex justify-between ml-24">
        {artist.length === 0 ? (
          <p className="ml-56"></p>
        ) : (
          <div className="flex">
            {artist && artist.images && artist.images[0] ? (
              <img
                src={artist.images[0].url}
                style={{ width: "180px", height: "180px", borderRadius: "50%" }}
                alt="Artist"
              />
            ) : (
              <p>No image available</p>
            )}
            <div className="ml-4 mt-4">
              {artist ? (
                <>
                  <div className="flex">
                    <p className="text-3xl font-black mr-2">{artist.name}</p>
                    <Tooltip
                      title={
                        localArtist &&
                        localArtist.starred &&
                        localArtist.starred.includes(username)
                          ? "Click to remove from your favorite artists."
                          : `Click the star button to add ${artist.name} to your favorite artists.`
                      }
                    >
                      <StarFilled
                        style={{
                          color:
                            localArtist &&
                            localArtist.starred &&
                            localArtist.starred.includes(username)
                              ? "gold"
                              : "white",
                        }}
                        onClick={() => handleLike(artist.id, username)}
                      />
                    </Tooltip>
                  </div>

                  <p className="ml-1 font-normal">Genres:</p>
                  <p className="ml-1 font-bold text-sky-400 cursor-default leading-4">
                    {artist.genres?.length > 0 &&
                      artist.genres.slice(0, 3).map((genre, index) => (
                        <span key={index}>
                          {genre}
                          {index < 2 && <br />}
                        </span>
                      ))}
                  </p>
                </>
              ) : (
                <p>Loading...</p>
              )}
            </div>
          </div>
        )}
        <div className="mr-24">
          <p className="text-right mb-2 font-bold">Similar Artists</p>
          <div className="grid grid-cols-4 gap-2 justify-right">
            {Array.isArray(relatedArtists) &&
              relatedArtists.slice(0, 4).map((relatedArtist) => (
                <Card
                  key={relatedArtist.id}
                  sx={{
                    backgroundColor: "transparent",
                    boxShadow: "none",
                    width: 100,
                  }}
                >
                  <CardActionArea
                    onClick={() =>
                      handleClickArtist(
                        relatedArtist.id,
                        relatedArtist.name,
                        relatedArtist.popularity,
                        relatedArtist.images[0].url,
                        relatedArtist.followers.total,
                        relatedArtist.genres
                      )
                    }
                  >
                    <CardMedia
                      component="img"
                      sx={{
                        marginLeft: "10px",
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                      }}
                      image={
                        relatedArtist.images[0]
                          ? relatedArtist.images[0].url
                          : defaultImageUrl
                      }
                      alt="album cover"
                    />
                    <CardContent>
                      <Typography
                        gutterBottom
                        component="div"
                        fontFamily={"DM Sans"}
                        fontWeight={500}
                        lineHeight={0.95}
                        color="white"
                        textAlign={"center"}
                        fontSize={14}
                      >
                        {relatedArtist.name}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              ))}
          </div>
        </div>
      </div>
      <div className="mt-8 ml-24">
        <p className="mb-2 font-bold">{artist.name}'s Albums</p>
        {Array.isArray(albums) && albums.length === 0 ? (
          <p className="font-normal">No albums were found.</p>
        ) : (
          <div className="grid grid-cols-6 gap-4 mr-24">
            {albums?.map((album) => (
              <Card key={album.id} sx={{ width: 190, borderRadius: "5%" }}>
                <CardActionArea
                  onClick={() =>
                    handleClickAlbum(
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
      <Footer />
    </div>
  );
};

export default Artist;
