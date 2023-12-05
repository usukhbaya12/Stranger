export { default } from "next-auth/middleware";
export const config = {
  matcher: [
    "/reviews",
    "/user/:path*",
    "/album/:path*",
    "/genres",
    "/search",
    "/artist/:path*",
  ],
};
