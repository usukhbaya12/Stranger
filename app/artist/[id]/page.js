"use client";

import { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { CardActionArea } from "@mui/material";
import { useRouter } from "next/navigation";

const defaultImageUrl =
  "https://i.scdn.co/image/ab6761610000e5eb867008a971fae0f4d913f63a";

const Artist = () => {
  const [artist, setArtist] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [relatedArtists, setRelatedArtists] = useState([]);
  const [accessToken, setAccessToken] = useState("");
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

  const handleClickAlbum = (albumID) => {
    router.replace(`/album/${albumID}`);
  };

  const handleClickArtist = (artistID) => {
    router.replace(`/artist/${artistID}`);
  };

  return (
    <div className="font-bold mt-32 ml-24">
      <div className="flex justify-between">
        {artist.length === 0 ? (
          <p className="ml-56">😔 No results were found. Please try again!</p>
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
                  <p className="text-3xl">{artist.name}</p>
                  <p className="ml-1 font-normal">Genres:</p>
                  <p className="ml-1 font-bold text-sky-400 cursor-pointer leading-4">
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
          <p className="text-right mb-2">Similar Artists</p>
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
                    onClick={() => handleClickArtist(relatedArtist.id)}
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
      <div className="mt-8 ml-2">
        <p className="mb-2">{artist.name}'s Albums</p>
        {Array.isArray(albums) && albums.length === 0 ? (
          <p className="font-normal">No albums were found.</p>
        ) : (
          <div className="grid grid-cols-6 gap-4 mr-24">
            {albums?.map((album) => (
              <Card key={album.id} sx={{ width: 190, borderRadius: "5%" }}>
                <CardActionArea onClick={() => handleClickAlbum(album.id)}>
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
    </div>
  );
};

export default Artist;
