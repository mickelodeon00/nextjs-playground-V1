"use client";
import { useState } from "react";
import { useRouter } from "next/router";
import { createClient } from "@/supabase/client";

export default function MFAForm({
  factorId,
  challengeId,
}: {
  factorId: string;
  challengeId: string;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleVerify = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code,
    });

    if (error) {
      setError(error.message);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div>
      <h2>Enter the 6-digit code</h2>
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="123456"
      />
      <button onClick={handleVerify}>Verify</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
