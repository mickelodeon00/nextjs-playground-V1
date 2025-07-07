"use client";

import { useState } from "react";
import { createClient } from "@/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function EnableMFA({
  onStatusChange,
}: {
  onStatusChange: () => void;
}) {
  const [qr, setQr] = useState("");
  const [code, setCode] = useState("");
  const [factorId, setFactorId] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const startEnroll = async () => {
    setStatus("");
    setLoading(true);

    // Check if MFA is already enrolled
    const { data: existing, error: listError } =
      await supabase.auth.mfa.listFactors();
    if (listError) {
      setStatus(`❌ Error checking MFA: ${listError.message}`);
      setLoading(false);
      return;
    }

    if (existing?.totp?.length > 0) {
      setStatus("✅ MFA is already enabled.");
      setLoading(false);
      return;
    }

    // Enroll new factor
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "Authenticator App2",
    });

    if (error) {
      setStatus(`❌ Enroll error: ${error.message}`);
      setLoading(false);
      return;
    }

    setFactorId(data.id);
    setQr(data.totp.qr_code);

    const { data: challenge, error: challengeError } =
      await supabase.auth.mfa.challenge({
        factorId: data.id,
      });

    if (challengeError) {
      setStatus(`❌ Challenge error: ${challengeError.message}`);
      setLoading(false);
      return;
    }

    setChallengeId(challenge.id);
    setLoading(false);
  };

  const verify = async () => {
    setLoading(true);
    const { error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code,
    });

    if (error) {
      setStatus(`❌ Verification failed: ${error.message}`);
    } else {
      setStatus("✅ MFA enabled!");
      onStatusChange(); // Notify parent (e.g. SettingsPage)
    }

    setLoading(false);
  };

  const cancelEnrollment = async () => {
    if (!factorId) return;

    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    if (error) {
      setStatus(`❌ Unenroll error: ${error.message}`);
    } else {
      setStatus("❎ MFA enrollment canceled.");
      setFactorId("");
      setQr("");
      setCode("");
      setChallengeId("");
      onStatusChange();
    }
  };

  return (
    <div className="space-y-4">
      <Button onClick={startEnroll} disabled={loading || !!qr}>
        Generate QR Code
      </Button>

      {qr && (
        <div className="space-y-2">
          <img
            src={qr}
            alt="Scan QR code with Authenticator App"
            className="max-w-xs"
          />
          <Input
            type="text"
            placeholder="Enter 6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value.trim())}
          />
          <div className="flex gap-2">
            <Button onClick={verify} disabled={loading || !code}>
              Verify
            </Button>
            <Button
              variant="secondary"
              onClick={cancelEnrollment}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {status && <p className="text-sm text-muted-foreground">{status}</p>}
    </div>
  );
}
