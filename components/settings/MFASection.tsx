"use client";

import { useEffect, useState } from "react";
import EnableMFA from "./EnableMFA";
import { createClient } from "@/supabase/client";
import { Button } from "@/components/ui/button";

export default function MFASection() {
  const [hasMFA, setHasMFA] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  const supabase = createClient();

  const refreshFactors = async () => {
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (!error && data.totp?.length > 0) {
      setHasMFA(true);
      setFactorId(data.totp[0].id);
    } else {
      setHasMFA(false);
      setFactorId(null);
    }
  };

  useEffect(() => {
    refreshFactors();
  }, []);

  const disableMFA = async () => {
    if (!factorId) {
      setStatus("No MFA factor found.");
      return;
    }

    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    if (error) {
      setStatus(`Error disabling MFA: ${error.message}`);
    } else {
      setStatus("✅ MFA disabled successfully.");
      await refreshFactors();
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Multi-Factor Authentication</h2>
      {hasMFA ? (
        <>
          <p className="text-green-600">✅ MFA is enabled on your account.</p>
          <Button variant="destructive" onClick={disableMFA}>
            Disable MFA
          </Button>
        </>
      ) : (
        <>
          <p className="text-gray-700">
            MFA is not enabled. Add an extra layer of security.
          </p>
          <EnableMFA onStatusChange={refreshFactors} />
        </>
      )}
      {status && <p className="text-sm text-muted-foreground">{status}</p>}
    </div>
  );
}
