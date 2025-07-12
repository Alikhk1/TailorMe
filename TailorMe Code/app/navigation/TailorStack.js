import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

// Screens
import TailorHome from "../screens/tailor/home";
import CustomerRecordsScreen from "../screens/tailor/CustomerRecordsScreen";
import CustomerOrderScreen from "../screens/tailor/CustomerOrderScreen";
import TailorMeasurementScreen from "../screens/tailor/TailorMeasurementScreen";
import TailorMeasurementResultsScreen from "../screens/tailor/TailorMeasurementResultsScreen";
import ManualMeasurementForm from "../screens/tailor/ManualMeasurementForm";
import CustomerRecordDetails from "../screens/tailor/CustomerRecordDetails";
import EditUserRecordScreen from "../screens/tailor/EditUserRecordScreen";
import AddOrderScreen from "../screens/tailor/AddOrderScreen";
import OrderDetailsScreen from "../screens/tailor/OrderDetailsScreen";
import EditOrderScreen from "../screens/tailor/EditOrderScreen";
import StatisticsScreen from "../screens/tailor/StatisticsScreen";
import TailorProfileScreen from "../screens/tailor/TailorProfileScreen";
import EditTailorProfileScreen from "../screens/tailor/EditTailorProfileScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tabs for Tailor
function TailorTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          if (route.name === "TailorHome")
            return <FontAwesome name="home" size={size} color={color} />;
          if (route.name === "TailorMeasurementScreen")
            return <FontAwesome5 name="ruler-horizontal" size={size} color={color} />
          if (route.name === "CustomerRecordsScreen")
            return <FontAwesome name="address-book-o" size={size} color={color} />;
          if (route.name == "CustomerOrderScreen")
            return <FontAwesome name="book" size={size} color={color} />;
          if (route.name == "StatisticsScreen")
            return <FontAwesome name="bar-chart-o" size={size} color={color} />;
          if (route.name == "TailorProfileScreen")
            return <FontAwesome name="user-circle-o" size={size} color={color} />
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
        name="TailorHome"
        component={TailorHome}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="TailorMeasurementScreen"
        component={TailorMeasurementScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="CustomerRecordsScreen"
        component={CustomerRecordsScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="CustomerOrderScreen"
        component={CustomerOrderScreen}
        options={{ headerShown: false}}
      />
      <Tab.Screen 
        name="StatisticsScreen"
        component={StatisticsScreen}
        options={{ headerShown: false}}
      />
      <Tab.Screen
        name="TailorProfileScreen"
        component={TailorProfileScreen}
        options={{ headerShown: false}}
      />
    </Tab.Navigator>
  );
}

// Main Stack for Tailor
export default function TailorStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Bottom Tabs as the main entry */}
      <Stack.Screen name="TailorTabs" component={TailorTabs} />

      {/* Stack Screens for tailor-only routes */}
      <Stack.Screen
        name="TailorHome"
        component={TailorHome}
      />

      <Stack.Screen
        name="TailorMeasurementScreen"
        component={TailorMeasurementScreen}
      />

      <Stack.Screen
        name="CustomerOrderScreen"
        component={CustomerOrderScreen}
      />

      <Stack.Screen
        name="TailorMeasurementResultsScreen"
        component={TailorMeasurementResultsScreen}
      />

      <Stack.Screen
        name="ManualMeasurementForm"
        component={ManualMeasurementForm}
      />

      <Stack.Screen 
      name="CustomerRecordDetails" 
      component={CustomerRecordDetails} 
      />

      <Stack.Screen
        name="EditUserRecord"
        component={EditUserRecordScreen}
      />

      <Stack.Screen
        name="AddOrderScreen"
        component={AddOrderScreen}
      />

      <Stack.Screen
        name="OrderDetailsScreen"
        component={OrderDetailsScreen}
      />

      <Stack.Screen
        name="EditOrderScreen"
        component={EditOrderScreen}
      />

      <Stack.Screen
        name="StatisticsScreen"
        component={StatisticsScreen}
      />

      <Stack.Screen 
        name="TailorProfileScreen"
        component={TailorProfileScreen}
      />

      <Stack.Screen
        name="EditTailorProfileScreen"
        component={EditTailorProfileScreen}
      />

    </Stack.Navigator>
  );
}
