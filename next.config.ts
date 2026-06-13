import type { NextConfig } from "next";
import { execSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const pkg = require("./package.json") as { version: string };

// 배포 버전 표기용 커밋 해시.
// Vercel은 빌드 시 VERCEL_GIT_COMMIT_SHA를 제공한다. 로컬은 git에서 읽고,
// 둘 다 없으면 "local"로 폴백한다.
function resolveCommit(): string {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA;
  if (sha) return sha.slice(0, 7);
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch {
    return "local";
  }
}

const nextConfig: NextConfig = {
  // 클라이언트에서 읽도록 NEXT_PUBLIC_ 접두사로 빌드 시점에 인라인한다.
  env: {
    NEXT_PUBLIC_APP_VERSION: pkg.version,
    NEXT_PUBLIC_APP_COMMIT: resolveCommit(),
  },
};

export default nextConfig;
