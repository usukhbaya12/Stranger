"use client";

import { useSession } from "next-auth/react";
import React, { useState, useEffect } from "react";
import { Rate, ConfigProvider, Select } from "antd";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";

const Rankings = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [albums, setAlbums] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);

  useEffect(() => {
    fetchTopAlbums();
  }, [session]);

  const fetchTopAlbums = async () => {
    try {
      const response = await fetch("/api/getTopAlbums");

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAlbums(data.data);
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

  const clickedAlbum = (albumID) => {
    router.replace(`/album/${albumID}`);
  };

  const handleYearChange = (value) => {
    setSelectedYear(value);
  };

  const filteredAlbums = selectedYear
    ? albums.filter((album) => {
        return album.released.slice(0, 4) === selectedYear;
      })
    : albums;

  return (
    <div className="mt-24">
      <div className="flex mt-8 items-center px-24">
        <p className="font-bold text-xl">Top albums</p>
        <Select
          showSearch
          style={{
            width: 110,
            marginLeft: "10px",
          }}
          placeholder="Overall"
          optionFilterProp="children"
          filterOption={(input, option) =>
            (option?.label ?? "").includes(input)
          }
          filterSort={(optionA, optionB) =>
            (optionA?.label ?? "")
              .toLowerCase()
              .localeCompare((optionB?.label ?? "").toLowerCase())
          }
          onChange={handleYearChange}
          options={[
            { value: null, label: "Overall" },
            {
              value: "2013",
              label: "2013",
            },
            {
              value: "2014",
              label: "2014",
            },
            {
              value: "2015",
              label: "2015",
            },
            {
              value: "2016",
              label: "2016",
            },
            {
              value: "2017",
              label: "2017",
            },
            {
              value: "2018",
              label: "2018",
            },
            {
              value: "2019",
              label: "2019",
            },
            {
              value: "2020",
              label: "2020",
            },
            {
              value: "2021",
              label: "2021",
            },
            {
              value: "2022",
              label: "2022",
            },
            {
              value: "2023",
              label: "2023",
            },
          ]}
        />
      </div>

      {filteredAlbums.length > 0 ? (
        <div className="mt-4 px-24">
          {filteredAlbums.map((album, index) => (
            <div
              className="flex rounded-lg items-center px-8 py-2 justify-between"
              key={album._id}
              style={{ background: index % 2 === 0 ? "#111827" : "#374151" }}
            >
              <p className="w-[50px] font-medium">#{index + 1}</p>
              <a
                className="flex items-center"
                href={`https://open.spotify.com/album/${album._id}`}
              >
                <img src="/images/spotify.png" style={{ height: "20px" }}></img>
                <p> 🎧</p>
              </a>

              <div
                className="flex w-[500px] items-center cursor-pointer"
                onClick={() => clickedAlbum(album._id)}
              >
                <img
                  src={album.image}
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "10%",
                  }}
                ></img>
                <div className="ml-4 leading-4">
                  <p className="font-bold">{album.name}</p>
                  <p>{album.artist}</p>
                </div>
              </div>
              <p className="w-[50px] text-center text-sm">
                {new Date(album.released).getFullYear()}
              </p>
              <div className="flex-col leading-4 text-center w-[150px]">
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
                  {" "}
                  <p>
                    <span className="font-bold text-lg text-sky-400">
                      {album.averageRating.toFixed(2)}
                    </span>
                    <span className="text-sm"> / 5.0</span>
                  </p>
                  <Rate
                    allowHalf
                    defaultValue={album.averageRating}
                    disabled
                    style={{
                      fontSize: "13px",
                      paddingBlock: "2px",
                      borderRadius: "10px",
                    }}
                  />
                </ConfigProvider>
              </div>

              <p className="w-[70px] text-sm font-medium">
                {album.reviews.length} rating(s)
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-24 mt-2">
          <p>No albums released in {selectedYear} were reviewed yet.</p>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Rankings;
