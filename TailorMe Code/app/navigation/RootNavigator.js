// navigation/RootNavigator.js
import React, { useContext, useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import AuthStack from "./AuthStack";
import UserStack from "./UserStack";
import TailorStack from "./TailorStack";
import { AuthContext } from "../AuthContext"; // your context that stores auth & role
import { ActivityIndicator, View } from "react-native";

export default function RootNavigator() {
  const { user, role, loading } = useContext(AuthContext); 

  if (loading) {
    // show loading spinner while checking auth
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#6a11cb" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!user ? (
        <AuthStack />
      ) : role === "user" ? (
        <UserStack />
      ) : role === "tailor" ? (
        <TailorStack />
      ) : (
        <AuthStack /> // fallback, if role undefined
      )}
    </NavigationContainer>
  );
}
