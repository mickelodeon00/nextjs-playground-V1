import ProtectedRoute from "@/components/auth/auth-wrapper";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
