"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import MFASection from "@/components/settings/MFASection";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error getting user:", error.message);
      } else {
        setUser(data.user);
      }
      setLoading(false);
    };

    getUser();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>You must be signed in to view this page.</p>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Card>
        <CardContent className="p-4 space-y-2">
          <h2 className="text-xl font-semibold">Profile</h2>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-2">
          <MFASection />
        </CardContent>
      </Card>
    </div>
  );
}
