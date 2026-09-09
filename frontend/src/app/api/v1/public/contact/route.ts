import { NextResponse } from 'next/server';

const FASTAPI_URL = process.env.FASTAPI_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

export async function GET() {
  try {
    const res = await fetch(`${FASTAPI_URL}/api/v1/public/contact`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err) {
    console.warn('Backend public contact fetch fallback to environment:', err);
  }

  return NextResponse.json({
    support_email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || process.env.SUPPORT_EMAIL || null,
    contact_email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || process.env.CONTACT_EMAIL || null,
    contact_phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || process.env.CONTACT_PHONE || null,
    company_website: process.env.NEXT_PUBLIC_COMPANY_WEBSITE || process.env.COMPANY_WEBSITE || null,
    linkedin_url: process.env.NEXT_PUBLIC_LINKEDIN_URL || process.env.LINKEDIN_URL || null,
    github_url: process.env.NEXT_PUBLIC_GITHUB_URL || process.env.GITHUB_URL || null,
  });
}
