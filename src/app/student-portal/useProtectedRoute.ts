// lib/useProtectedRoute.ts
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/config";

export const useProtectedRoute = () => {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/student-portal/login");
      }
    });

    return () => unsubscribe();
  }, [router]);
};
