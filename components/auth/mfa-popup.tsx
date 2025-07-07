"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Shield } from "lucide-react";
import { signOut, verifyMFACode } from "@/app/actions/auth";
import { redirect } from "next/navigation";

interface MFAPopupProps {
  isOpen: boolean;
  onClose: () => void;
  factorId: string;
  challengeId: string;
  onSuccess: () => void;
}

export default function MFAPopup({
  isOpen,
  onClose,
  factorId,
  challengeId,
  onSuccess,
}: MFAPopupProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (code.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await verifyMFACode({
        factorId,
        challengeId,
        code,
      });

      if (result.error) {
        console.log("MFA verification error:", result.error);
        setError(result.error.message || "Invalid verification code");
      } else {
        // MFA verification successful
        onSuccess();
        onClose();
        // Redirect will happen via middleware
        // window.location.href = "/"; // or your protected route
        // redirect("/"); // Redirect to home or protected route after success
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(value);
    if (error) setError(null); // Clear error when user starts typing
  };

  const handleClose = () => {
    if (!loading) {
      setCode("");
      // setError(null);
      // onClose();
      setError("Verification required to access your account.");
    }
  };
  const handleSignOut = async () => {
    await signOut();
    redirect("/login"); // Redirect to login page after sign out
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </DialogTitle>
          <DialogDescription>
            Enter the 6-digit verification code from your authenticator app to
            complete sign in.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mfa-code">Verification Code</Label>
            <Input
              id="mfa-code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="000000"
              value={code}
              onChange={handleCodeChange}
              className="text-center text-lg tracking-widest font-mono"
              maxLength={6}
              autoComplete="one-time-code"
              autoFocus
              disabled={loading}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                {error}
                {error === "Verification required to access your account." && (
                  <div className="mt-2">
                    <button
                      onClick={handleSignOut}
                      className="text-sm text-red-500 underline cursor-pointer"
                    >
                      Restart Authentication
                    </button>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || code.length !== 6}
              className="flex-1 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify"
              )}
            </Button>
          </div>
        </form>

        <div className="text-xs text-muted-foreground text-center">
          Can't access your authenticator app? Contact support for assistance.
        </div>
      </DialogContent>
    </Dialog>
  );
}
