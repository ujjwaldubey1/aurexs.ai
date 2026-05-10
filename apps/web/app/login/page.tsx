"use client";

import { useState } from "react";

async function readJsonResponse(response: Response): Promise<{ ok: boolean; message?: string }> {
  const text = await response.text();
  try {
    return JSON.parse(text) as { ok: boolean; message?: string };
  } catch {
    return {
      ok: false,
      message: text.slice(0, 200) || `Request failed (${response.status})`
    };
  }
}

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);

  async function requestOtp() {
    setMessage("");
    setSendingOtp(true);
    try {
      const response = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone })
      });
      const payload = await readJsonResponse(response);
      setMessage(payload.message || (payload.ok ? "OTP sent" : "Failed"));
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Network error — check dev server and try again.");
    } finally {
      setSendingOtp(false);
    }
  }

  async function verifyOtp() {
    setMessage("");
    setVerifying(true);
    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, token: otp })
      });
      const payload = await readJsonResponse(response);
      if (payload.ok) {
        setMessage("Login success");
        window.location.href = "/dashboard";
        return;
      }
      setMessage(payload.message || "OTP verification failed");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Network error — check dev server and try again.");
    } finally {
      setVerifying(false);
    }
  }

  return (
    <main>
      <h1>Login</h1>
      <p>Phone OTP sign-in using Supabase Auth.</p>
      <div className="card">
        <label>Phone (E.164)</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+919999999999" />
        <button type="button" onClick={requestOtp} disabled={sendingOtp}>
          {sendingOtp ? "Sending…" : "Send OTP"}
        </button>
      </div>
      <div className="card">
        <label>OTP</label>
        <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" />
        <button type="button" onClick={verifyOtp} disabled={verifying}>
          {verifying ? "Verifying…" : "Verify OTP"}
        </button>
      </div>
      <p>{message}</p>
    </main>
  );
}
