import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "./AuthContext";

import RootNavigator from "./navigation/RootNavigator";
import AuthNavigator from "./navigation/AuthStack";
import UserStack from "./navigation/UserStack";
import TailorStack from "./navigation/TailorStack";

const Stack = createStackNavigator();

export default function Layout() {
  const { user } = useAuth();

  // Assuming your user object has a 'role' property
  const role = user?.role;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        // Not logged in: Auth flow
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : role === "user" ? (
        // Logged in as user
        <Stack.Screen name="User" component={UserStack} />
      ) : role === "tailor" ? (
        // Logged in as tailor
        <Stack.Screen name="Tailor" component={TailorStack} />
      ) : (
        // fallback: maybe force logout or show error screen
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}
