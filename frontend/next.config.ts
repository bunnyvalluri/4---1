import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com https://www.gstatic.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: https: blob: https://lh3.googleusercontent.com",
      // Firebase Auth popup requires firebaseapp.com + googleapis.com
      "connect-src 'self' https://generativelanguage.googleapis.com https://api.openai.com https://*.firebaseio.com https://*.googleapis.com https://*.firebaseapp.com wss://*.firebaseio.com",
      // Allow Google OAuth popup and Firebase Auth iframe
      "frame-src https://accounts.google.com https://careerai-app-9777b.firebaseapp.com https://*.firebaseapp.com https://apis.google.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  transpilePackages: ['lucide-react'],
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    DATABASE_URL:
      process.env.DATABASE_URL ||
      'postgresql://neondb_owner:npg_SwidG35QXDWx@ep-muddy-math-aeqfkwpn-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connect_timeout=30',
    DIRECT_URL:
      process.env.DIRECT_URL ||
      'postgresql://neondb_owner:npg_SwidG35QXDWx@ep-muddy-math-aeqfkwpn.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&connect_timeout=30',
    JWT_SECRET:
      process.env.JWT_SECRET || 'super-secure-production-jwt-secret-career-ai-2026-key',
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
