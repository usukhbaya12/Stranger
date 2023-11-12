import { DM_Sans } from "next/font/google";
import "./globals.css";
import Menu from "components/Menu.js";
import { AuthProvider } from "./Providers";
const inter = DM_Sans({ subsets: ["latin"] });
export const metadata = {
  title: "Stranger",
  description: "Your online music portal",
};

export default function RootLayout({ Component, pageProps, children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/favicon.ico" sizes="any" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <div className="fixed inset-x-0 top-0">
            <Menu />
          </div>
          <div>{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
