import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? "");
const COOKIE_NAME = "bw_session";
const SESSION_TTL_DAYS = 30;

export type SessionPayload = {
  sub: string; // patient or staff id
  role: "PATIENT" | "STAFF";
  phone: string;
  staffRole?: string;
};

export async function createSessionCookie(payload: SessionPayload) {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not set");

  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_DAYS}d`)
    .sign(SECRET);

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export function clearSessionCookie() {
  cookies().delete(COOKIE_NAME);
}
