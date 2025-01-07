import React, { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import LoginForm from "../../components/Login";
import { useRouter } from "next/router";

const Login = () => {
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = () => {
    localStorage.setItem("adminMode", false);
    signOut();
  };

  return (
    <>
      <LoginForm
        signIn={() =>
          signIn("google", {
            callbackUrl: `${window.location.origin}/admin`,
          })
        }
        signOut={handleSignOut}
        session={session}
      />
    </>
  );
};

export default Login;
