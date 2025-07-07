"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/supabase/client";
import MFAPopup from "./mfa-popup";

export default function ActionLevelMFA({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showMFA, setShowMFA] = useState(false);
  const [verified, setVerified] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    (async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totp = factors?.totp?.find((f) => f.status === "verified");
      if (!totp) return;

      const { data: challenge } = await supabase.auth.mfa.challenge({
        factorId: totp.id,
      });

      if (challenge?.id) {
        setFactorId(totp.id);
        setChallengeId(challenge.id);
        setShowMFA(true);
      }
    })();
  }, []);

  if (!verified && showMFA && factorId && challengeId) {
    return (
      <MFAPopup
        isOpen
        onClose={() => setShowMFA(false)}
        factorId={factorId}
        challengeId={challengeId}
        onSuccess={() => {
          setVerified(true);
          setShowMFA(false);
        }}
      />
    );
  }

  if (!verified) return null;

  return <>{children}</>;
}
