"use server";
import { createClient } from "@/supabase/server"; // Adjust the path as needed

export interface MFAVerifyProps {
  factorId: string;
  challengeId: string;
  code: string;
}

export interface SignInResult {
  data: any;
  error: any;
  requiresMFA?: boolean;
  factorId?: string;
  challengeId?: string;
}

export const signInWithEmail = async ({ email, password }: SignInProps) => {
  try {
    const supabase = await createClient();
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      return { data: null, error: authError };
    }

    const { data: factors, error: factorsError } =
      await supabase.auth.mfa.listFactors();

    if (factorsError) {
      return { data: null, error: factorsError };
    }

    // Check if user has any verified TOTP factors
    const totpFactors =
      factors?.totp?.filter((factor) => factor.status === "verified") || [];

    if (totpFactors.length > 0) {
      // User has MFA enabled - create challenge but don't complete sign in yet
      const factor = totpFactors[0]; // Use first verified factor

      const { data: challenge, error: challengeError } =
        await supabase.auth.mfa.challenge({
          factorId: factor.id,
        });

      if (challengeError) {
        return { data: null, error: challengeError };
      }

      // Sign out temporarily - user will be signed in again after MFA verification
      // await supabase.auth.signOut();

      return {
        data: authData,
        error: null,
        requiresMFA: true,
        factorId: factor.id,
        challengeId: challenge.id,
      };
    }

    // No MFA required - user is fully authenticated
    return {
      data: authData,
      error: null,
      requiresMFA: false,
    };

    // return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Verify MFA code and complete authentication
export const verifyMFACode = async ({
  factorId,
  challengeId,
  code,
}: MFAVerifyProps) => {
  try {
    const supabase = await createClient();

    // Verify the TOTP code
    const { data, error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code,
    });

    if (error) {
      return { data: null, error };
    }

    // At this point, user is fully authenticated with MFA
    // The session is automatically established by Supabase
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as any };
  }
};

// Helper function to check current MFA status
export const getMFAStatus = async () => {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { hasMFA: false, factors: [] };

    const { data: factors, error } = await supabase.auth.mfa.listFactors();

    if (error) throw error;

    const verifiedFactors =
      factors?.totp?.filter((factor) => factor.status === "verified") || [];

    return {
      hasMFA: verifiedFactors.length > 0,
      factors: verifiedFactors,
    };
  } catch (error) {
    return { hasMFA: false, factors: [], error };
  }
};

export const signUpWithEmail = async ({ email, password }: SignUpProps) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

export const sendPasswordResetEmail = async (email: string) => {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    // redirectTo: `${"https://yourdomain.com"}/reset-password`,

    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
  });
  console.log({ error });
  return { data, error };
};

export const resetPassword = async ({ password }: { password: string }) => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.updateUser({
    password: password,
  });

  // supabase.auth.onAuthStateChange(async (event, session) => {
  //   if (event === "PASSWORD_RECOVERY") {
  //     const newPassword = password;
  //     const { data, error } = await supabase.auth.updateUser({
  //       password: newPassword,
  //     });

  //     if (data) {
  //       alert("Password updated successfully!");

  //     }
  //     if (error) alert("There was an error updating your password.");
  //   }
  // });

  return { data, error };
};

export const signOut = async () => {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  return { error };
};
