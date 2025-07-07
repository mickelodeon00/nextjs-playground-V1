import React from "react";
// import { useEffect, useState } from "react";
// import { useRouter } from "next/router";
import ProtectedRouteWithMFA from "@/components/auth/autu-wrapper2";

const ProtectedPage = () => {
  return (
    <ProtectedRouteWithMFA>
      <div className="protected-container">
        <h1>Welcome to the Protected Page</h1>
        <p>You have successfully accessed a protected route.</p>
      </div>
    </ProtectedRouteWithMFA>
  );
};

export default ProtectedPage;
