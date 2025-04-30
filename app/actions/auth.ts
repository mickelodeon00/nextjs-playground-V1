"use server";
import { createClient } from "@/supabase/server"; // Adjust the path as needed
export const signInWithEmail = async ({ email, password }: SignInProps) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { data, error };
  } catch (error) {
    return { data: null, error };
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
