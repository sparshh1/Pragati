import type { NextConfig } from "next";
import path from "path";

const projectRoot = path.join(__dirname);

const nextConfig: NextConfig = {
  // Next walks up looking for a lockfile and was treating C:\Users\sunil as
  // the workspace because a package-lock.json lives there. Pin both roots
  // so the bundler only watches this repo.
  turbopack: {
    root: projectRoot,
  },
  outputFileTracingRoot: projectRoot,
};

export default nextConfig;
