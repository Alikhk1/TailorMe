import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

// Screens
import home from "../screens/user/home";
import UserProfileScreen from "../screens/user/UserProfileScreen";
import UserMeasurementScreen from "../screens/user/UserMeasurementScreen";
import UserMeasurementResultsScreen from "../screens/user/UserMeasurementResultsScreen";
import EditProfileScreen from "../screens/user/EditProfileScreen";
import UserSettingsScreen from "../screens/user/UserSettingsScreen";


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tabs for User
function UserTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          if (route.name === "home")
            return <FontAwesome name="home" size={size} color={color} />;
          if (route.name === "UserMeasurementScreen")
            return (
              <FontAwesome5 name="ruler-horizontal" size={size} color={color} />
            );
          if (route.name === "UserProfileScreen")
            return <FontAwesome name="user" size={size} color={color} />;
        },
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 50,
          borderTopWidth: 0.5,
          borderTopColor: "#e0e0e0",
          paddingBottom: 5,
        },
        tabBarInactiveTintColor: "#8e8e8e",
        tabBarActiveTintColor: "#007bff",
        tabBarIconStyle: {
          marginTop: 5,
        },
        tabBarBackground: () => (
          <LinearGradient
            colors={["#9a5fd9", "#6a3bb5", "#3a1c96", "#1a0b4d"]}
            style={{ flex: 1 }}
          />
        ),
      })}
    >
      <Tab.Screen
        name="home"
        component={home}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="UserMeasurementScreen"
        component={UserMeasurementScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="UserProfileScreen"
        component={UserProfileScreen}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}

// Main Stack for User
export default function UserStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Tabs as main entry */}
      <Stack.Screen name="UserTabs" component={UserTabs} />

      <Stack.Screen
        name="UserProfileScreen"
        component={UserProfileScreen}
      />

      <Stack.Screen
        name="UserMeasurementScreen"
        component={UserMeasurementScreen}
      />

      <Stack.Screen
        name="UserMeasurementResultsScreen"
        component={UserMeasurementResultsScreen}
      />
      <Stack.Screen
        name="EditProfileScreen"
        component={EditProfileScreen}
      />

      <Stack.Screen
        name="UserSettingsScreen"
        component={UserSettingsScreen}
      />
    </Stack.Navigator>
  );
}
