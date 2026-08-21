"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/app/redux/hooks";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // User login check and Admin role validation
        if (!isAuthenticated || user?.role?.toLowerCase() !== "admin") {
            router.push("/login?redirect=/admin/products");
        } else {
            setIsAuthorized(true);
        }
    }, [isAuthenticated, user, router]);

    if (!mounted || !isAuthorized) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
                <div style={{ textAlign: "center" }}>
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-solid border-teal-600 border-r-transparent mb-3"></div>
                    <p style={{ fontWeight: "600", color: "#666" }}>Verifying Admin Privileges...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
