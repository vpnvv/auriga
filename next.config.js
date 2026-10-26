/** @type {import('next').NextConfig} */
const isGhPages = process.env.NEXT_PUBLIC_IS_GH_PAGES === "true";
const basePath = isGhPages ? "/auriga" : "";

const nextConfig = {
  output: "export",
  basePath: basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

module.exports = nextConfig;
