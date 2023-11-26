import { signIn, signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { FacebookFilled, YoutubeFilled } from "@ant-design/icons";

export default function Footer() {
  const { data: session } = useSession();
  return (
    <div className="justify-between flex mt-12 bg-gray-800 border-t border-white border-dashed px-24">
      <div className="mt-8 pb-40">
        <img src="/images/Stranger-PNG.png" width="90px"></img>
        <p className="text-sm font-bold ml-1 leading-3">
          Your Online<br></br>Music Portal
        </p>
        <a className="ml-1" href="https://facebook.com/Strangerentnews">
          <FacebookFilled></FacebookFilled>
        </a>
        <a className="ml-1" href="https://youtube.com/@StrangerTVMongolia">
          <YoutubeFilled></YoutubeFilled>
        </a>
      </div>
      <div className="mt-10 -ml-16">
        <p className="font-bold">Links</p>
        <a
          href="/#NewMusic"
          className="text-sm cursor-pointer hover:text-sky-400"
        >
          {">"} New Music
        </a>
        <br></br>
        <a href="/genres" className="text-sm cursor-pointer hover:text-sky-400">
          {">"} Genres
        </a>
        <br></br>
        <a href="#" className="text-sm cursor-pointer hover:text-sky-400">
          {">"} Reviews
        </a>
        <br></br>
        <a
          href="/#Grammys2024"
          className="text-sm cursor-pointer hover:text-sky-400"
        >
          {">"} GRAMMYs 2024
        </a>
        <br></br>
        <a
          onClick={session ? () => signOut() : () => signIn()}
          className="text-sm cursor-pointer hover:text-sky-400"
        >
          {">"} {session ? "Sign Out" : "Sign In"}
        </a>
      </div>
      <div className="mt-10">
        <p className="font-bold leading-4">
          Made by<br></br>Usukhbayar
        </p>
        <p className="text-sm mt-1">
          Product of<img src="/images/ufe.png" width="67px"></img>
          <br></br>
        </p>
      </div>
      <div className="mt-10 text-sm -ml-48">
        <p>
          <strong>Contact me @:</strong>
          <br></br>📕 fb.com/usukhb
          <br></br>✉️ b20fa1714@ufe.edu.mn
          <br></br>💡 github.com/usukhbaya12
        </p>
      </div>
      <div className="mt-10 text-right">
        <p className="font-bold">Made with</p>
        <p className="text-sm">Next.js</p>
        <div className="flex">
          <img src="/images/spotify.png" style={{ height: "20px" }}></img>{" "}
          <p className="text-sm">API</p>
        </div>
      </div>
    </div>
  );
}
