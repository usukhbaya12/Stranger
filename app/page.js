import Head from "next/head";
import Link from "next/link";

export default function Home() {
  return (
    <main>
      <Head>
        <title>Stranger</title>
      </Head>
      <img src="images/tswift.png"></img>
      <div className="text-center -mt-24 leading-6 text-2xl font-bold">
        <h2>Track albums you listened.</h2>
        <h2>Save those you want to listen.</h2>
        <h2>Tell your friends what's good.</h2>
      </div>
      <div className="container mx-auto flex justify-center mt-8">
        <Link
          type="button"
          href="/signup"
          className="font-semibold text-white bg-green-800 hover:bg-green-900 focus:ring-green-300 rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 focus:outline-none dark:focus:ring-green-800"
        >
          🎙️ Get started now.
        </Link>
      </div>
    </main>
  );
}
