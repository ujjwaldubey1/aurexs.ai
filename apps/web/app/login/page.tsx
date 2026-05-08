"use client";

import { useState } from "react";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  async function requestOtp() {
    const response = await fetch("/api/auth/otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone })
    });
    const payload = (await response.json()) as { ok: boolean; message?: string };
    setMessage(payload.message || (payload.ok ? "OTP sent" : "Failed"));
  }

  async function verifyOtp() {
    const response = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, token: otp })
    });
    const payload = (await response.json()) as { ok: boolean; message?: string };
    if (payload.ok) {
      setMessage("Login success");
      window.location.href = "/dashboard";
      return;
    }
    setMessage(payload.message || "OTP verification failed");
  }

  return (
    <main>
      <h1>Login</h1>
      <p>Phone OTP sign-in using Supabase Auth.</p>
      <div className="card">
        <label>Phone (E.164)</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+919999999999" />
        <button onClick={requestOtp}>Send OTP</button>
      </div>
      <div className="card">
        <label>OTP</label>
        <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" />
        <button onClick={verifyOtp}>Verify OTP</button>
      </div>
      <p>{message}</p>
    </main>
  );
}
