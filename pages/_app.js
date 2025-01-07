import "../styles/globals.css";
import { QueryClient, QueryClientProvider } from "react-query";
import toast, { Toaster } from "react-hot-toast";
import NavBar from "@/components/NavBar";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Footer from "/components/HomePage/Footer";
import { SessionProvider } from "next-auth/react";
import { ReactQueryDevtools } from "react-query/devtools";
import { ClerkProvider } from "@clerk/clerk-react";
import { PatientProvider } from "@/components/context/PatientContext";

const queryClient = new QueryClient();

export default function App({ Component, pageProps, session }) {
  const router = useRouter();
  const [version, setVersion] = useState(
    typeof window !== "undefined" ? localStorage.getItem("version") : "oncology"
  );

  const [isEditing, setIsEditing] = useState(
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("adminMode"))
      : false
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleStorageChange = (e) => {
        if (e.key === "version") {
          setVersion(e.newValue);
        }

        if (e.key === "adminMode") {
          setIsEditing(JSON.parse(e.newValue));
        }
      };

      window.addEventListener("storage", handleStorageChange);
      return () => {
        window.removeEventListener("storage", handleStorageChange);
      };
    }
  }, []);

  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <PatientProvider>
        <SessionProvider session={session}>
          <QueryClientProvider client={queryClient}>
            {router.pathname !== "/" && router.pathname !== "/privacy" && (
              <NavBar
                version={version}
                setVersion={setVersion}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
              />
            )}
            <Component
              {...pageProps}
              version={version}
              setVersion={setVersion}
              className="overflow: hidden"
              isEditing={isEditing}
              setIsEditing={setIsEditing}
            />
            <Toaster />
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </SessionProvider>
      </PatientProvider>
    </ClerkProvider>
  );
}
