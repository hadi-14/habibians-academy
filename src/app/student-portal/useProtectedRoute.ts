import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, setPersistence, browserLocalPersistence } from "firebase/auth";
import { auth } from "@/firebase/config";

export const useProtectedRoute = () => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // Set persistence to local (default behavior, but explicit)
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.error("Failed to set persistence:", error);
    });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/teacher-portal/login");
      }
    });

    return () => unsubscribe();
  }, [router, isClient]);
};