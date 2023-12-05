import { Modal, ConfigProvider, Rate } from "antd";
import html2canvas from "html2canvas";
import { DownloadOutlined } from "@ant-design/icons";

const Promo = ({ isModalOpen, onClose, selectedReview, userImage }) => {
  const handleCancel = () => {
    onClose();
  };

  const downloadImage = () => {
    const container = document.getElementById("canva");

    setTimeout(() => {
      html2canvas(container, { useCORS: true }).then((canvas) => {
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = `${selectedReview.name}_review.png`;
        link.click();
      });
    }, 1000);
  };

  return (
    <div>
      <ConfigProvider
        theme={{
          components: {
            Modal: {
              titleColor: "black",
              colorText: "black",
            },
          },
          token: {
            colorTextPlaceholder: "rgb(180, 180, 180)",
            fontFamily: "DM Sans",
            colorBgContainer: "rgba(31,41,55,255)",
            colorText: "rgba(255,255,255)",
            colorFillContent: "rgba(255,255,255, 0.4)",
            marginXS: "8",
          },
        }}
      >
        <Modal
          open={isModalOpen}
          onCancel={handleCancel}
          footer={null}
          width={"760px"}
        >
          <div className="flex gap-[10px]">
            <div id="canva" className="bg-black w-[400px] h-[400px]">
              {selectedReview && (
                <div className="flex justify-between pl-6 pr-8 mt-6">
                  <div className="text-white">
                    <img
                      src="/images/Stranger-PNG.png"
                      style={{ width: "80px" }}
                    ></img>
                    <p className="ml-1 mt-3 text-xl">
                      {selectedReview.reviews.username}
                      <span className="text-base">'s review of</span>
                    </p>
                    <p className="ml-1 text-xl font-black">
                      {selectedReview.name}
                    </p>
                    <p className="ml-1 text-base">by {selectedReview.artist}</p>
                    <div>
                      <p className=" absolute ml-1 mt-4 text-xl uppercase bg-white text-black font-bold px-1">
                        "{selectedReview.reviews.title}"
                      </p>
                      <div className="flex items-center">
                        <Rate
                          className="ml-1 mt-12"
                          allowHalf
                          value={selectedReview.reviews.rating}
                          disabled
                          style={{
                            fontSize: "22px",
                            paddingBlock: "2px",
                            borderRadius: "10px",
                          }}
                        />
                        <p className="mt-12 ml-2 print-adjust">
                          <span
                            className="font-black text-xl"
                            style={{ color: "#fadb15" }}
                          >
                            {selectedReview.reviews.rating.toFixed(1)}
                          </span>
                          /5.0
                        </p>
                      </div>
                      <img
                        className="mt-4"
                        src={selectedReview.image}
                        width={"100px"}
                      ></img>
                    </div>
                  </div>

                  <div>
                    <img
                      src={userImage}
                      style={{
                        width: "70px",
                        height: "70px",
                        objectFit: "cover",
                        borderRadius: "20%",
                      }}
                    ></img>
                    <p className="mt-[252px] text-white text-center leading-3 font-bold">
                      Stranger
                    </p>
                    <p className="text-white text-[11px] leading-3 text-center mt-1">
                      Join us now!
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="w-[290px] flex flex-col justify-center items-center">
              <img
                src="/images/Stranger-PNG-holo.png"
                style={{ width: "80px" }}
              ></img>
              <p className="text-xl font-bold mt-2">Share on social</p>
              <p className="leading-4 mt-2 text-center">
                Download to save this card and post <br></br>it on your social
                media accounts
              </p>
              <button
                className="mt-4 px-6 py-1 rounded-full text-sm bg-gray-700 text-white"
                onClick={downloadImage}
              >
                <DownloadOutlined /> Download
              </button>
            </div>
          </div>
        </Modal>
      </ConfigProvider>
    </div>
  );
};

export default Promo;
