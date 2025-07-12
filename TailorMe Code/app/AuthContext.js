import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, firestore } from "../firebaseConfig"; // Make sure firestore is exported

// Create context
export const AuthContext = createContext();

// Fetch user role from Firestore
async function fetchUserRole(uid) {
  try {
    const userDocRef = doc(firestore, "users", uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return userDoc.data().role || null;
    } else {
      console.warn("User document not found");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user role:", error);
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
    console.log("Auth state changed:", currentUser);
    if (currentUser) {
      setUser(currentUser);
      const fetchedRole = await fetchUserRole(currentUser.uid);
      setRole(fetchedRole);
    } else {
      setUser(null);
      setRole(null);
    }
    setLoading(false);
  });

  return () => unsubscribe();
}, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to access auth context
export const useAuth = () => useContext(AuthContext);
