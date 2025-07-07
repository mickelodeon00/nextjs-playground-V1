"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/supabase/client";
import MFAPopup from "./mfa-popup";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [showMFA, setShowMFA] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.push("/login");
        return;
      }

      const { data: aalData } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (aalData?.nextLevel === "aal2" && aalData?.currentLevel !== "aal2") {
        const { data: factors } = await supabase.auth.mfa.listFactors();
        const totpFactor = factors?.totp?.find((f) => f.status === "verified");

        if (totpFactor) {
          const { data: challenge } = await supabase.auth.mfa.challenge({
            factorId: totpFactor.id,
          });

          if (challenge?.id) {
            setFactorId(totpFactor.id);
            setChallengeId(challenge.id);
            setShowMFA(true);
          }
        }
      }

      setReady(true);
    })();
  }, []);

  if (!ready) return null;

  if (mfaRequired) {
    router.push("/login"); // or show message, or redirect home
    return null;
  }
  const handleSuccess = () => {
    window.location.href = "/"; // or your protected route
    // router.push("/"); // Redirect to home or protected route after success
  };
  if (showMFA && factorId && challengeId) {
    return (
      <MFAPopup
        isOpen={true}
        onClose={() => {
          setShowMFA(false);
          setMfaRequired(true); // Block access
        }}
        factorId={factorId}
        challengeId={challengeId}
        onSuccess={() => {
          handleSuccess();
          setShowMFA(false);
        }}
      />
    );
  }

  return <>{children}</>;
}
