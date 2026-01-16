import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default withSerwistInit({
  swSrc: "app/sw.js",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV !== "production",
})(nextConfig);
