"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface UserContextType {
    user: any;
    setUser: (user: any) => void;
    loading: boolean;
    refreshUser: () => Promise<void>;
    updateUser: (userData: any) => Promise<any>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/user/me");
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error("Failed to fetch user:", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const updateUser = async (userData: any) => {
        try {
            const res = await fetch("/api/user/update", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
            });
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setUser(data.user);
                    return data.user;
                }
            }
            throw new Error("Update failed");
        } catch (error) {
            console.error("Failed to update user:", error);
            throw error;
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser, loading, refreshUser: fetchUser, updateUser }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
