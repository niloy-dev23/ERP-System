import type { NextConfig } from "next";

const backendUrl = (process.env.BACKEND_URL ?? "http://localhost:8000").replace(
  /\/$/,
  "",
);
const apiPrefix = (process.env.BACKEND_API_PREFIX ?? "/api/v1").replace(
  /\/$/,
  "",
);

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    // Same-origin proxy to the Express API. This keeps the browser requests
    // on the frontend origin, so no CORS configuration is needed on the
    // backend (which is intentionally left untouched).
    return [
      {
        source: "/api/backend/:path*",
        destination: `${backendUrl}${apiPrefix}/:path*`,
      },
    ];
  },
};

export default nextConfig;
