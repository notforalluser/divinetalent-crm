import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { googleSignOut } from "../lib/googleAuth";

const AuthContext = createContext(null);
const STORAGE_KEY = "crm.auth.user.v1";

function getAllowedEmails() {
  const raw = import.meta.env.VITE_ALLOWED_EMAILS || "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  function loginWithCredential(credential) {
    setAuthError(null);
    let decoded;
    try {
      decoded = jwtDecode(credential);
    } catch {
      setAuthError("Could not read your Google account. Please try again.");
      return;
    }
    const email = (decoded.email || "").toLowerCase();
    const allowed = getAllowedEmails();

    if (!decoded.email_verified) {
      setAuthError("Your Google email isn't verified.");
      return;
    }
    if (allowed.length === 0) {
      setAuthError("No allowed emails configured. Add VITE_ALLOWED_EMAILS in your .env file. See README.md.");
      return;
    }
    if (!allowed.includes(email)) {
      setAuthError(`${decoded.email} isn't on the access list for this dashboard.`);
      return;
    }
    setUser({ name: decoded.name, email: decoded.email, picture: decoded.picture });
  }

  function logout() {
    googleSignOut();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, authError, setAuthError, loginWithCredential, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
