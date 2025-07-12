import React, { useState, useEffect, useContext } from "react";
import { 
  View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, 
  SafeAreaView, StatusBar
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../../../firebaseConfig";
import { doc, onSnapshot } from "firebase/firestore";
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from "../../AuthContext";
import * as Haptics from 'expo-haptics';

export default function TailorProfileScreen() {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const [tailorData, setTailorData] = useState({
    name: "",
    email: "",
    username: "",
    createdAt: ""
  });

  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTailorData({
          name: data.name || "No Name",
          email: data.email || "No Email",
          username: data.username || "No Username",
          createdAt: data.createdAt ? formatDate(data.createdAt) : "Unknown"
        });
      }
    });
    return () => unsubscribe();
  }, [user]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown";
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleLogout = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    try {
      await auth.signOut();
      navigation.navigate("LoginScreen");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <LinearGradient 
        colors={['#1a0b4d', '#3a1c96', '#6a3bb5', '#9a5fd9']}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.settingsIconWrapper}>
            <TouchableOpacity onPress={() => navigation.navigate("EditTailorProfileScreen")}>
              <MaterialCommunityIcons name="cog" size={28} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileHeader}>
            <Image 
              source={require("../../../assets/images/profile.png")} 
              style={styles.profilePic} 
            />
            <Text style={styles.username}>{tailorData.name}</Text>
            <Text style={styles.roleBadge}>Tailor</Text>
          </View>

          <View style={styles.contentCard}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="account-details" size={24} color="rgb(226, 58, 58)" />
              <Text style={styles.sectionTitle}>Profile Information</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Username</Text>
              <Text style={styles.infoValue}>{tailorData.username}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{tailorData.email}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Member Since</Text>
              <Text style={styles.infoValue}>{tailorData.createdAt}</Text>
            </View>
          </View>

          <View style={styles.contentCard}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="tools" size={24} color="rgb(233, 76, 76)" />
              <Text style={styles.sectionTitle}>Tailor Tools</Text>
            </View>

            <TouchableOpacity
              style={styles.toolButton}
              onPress={() => navigation.navigate("CustomerOrderScreen")}
            >
              <MaterialCommunityIcons name="clipboard-list" size={24} color="white" />
              <Text style={styles.toolButtonText}>View Orders</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolButton}
              onPress={() => navigation.navigate("CustomerRecordsScreen")}
            >
              <MaterialCommunityIcons name="account-group" size={24} color="white" />
              <Text style={styles.toolButtonText}>My Customers</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolButton}
              onPress={() => navigation.navigate("TailorMeasurementScreen")}
            >
              <MaterialCommunityIcons name="ruler" size={24} color="white" />
              <Text style={styles.toolButtonText}>Take Measurements</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#1a0b4d" },
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1, padding: 24, paddingTop: 40 },
  profileHeader: { alignItems: 'center', marginBottom: 30 },
  profilePic: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    borderWidth: 3, 
    borderColor: 'rgba(255,255,255,0.3)' 
  },
  username: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: 'white', 
    marginTop: 15 
  },
  roleBadge: { 
    fontSize: 14, 
    color: 'rgba(255,255,255,0.8)', 
    backgroundColor: 'rgba(106, 17, 203, 0.3)', 
    paddingHorizontal: 12, 
    paddingVertical: 4, 
    borderRadius: 12, 
    marginTop: 5 
  },
  contentCard: { 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    borderRadius: 16, 
    padding: 20, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.2)', 
    width: '100%',
    marginBottom: 20
  },
  sectionHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: '600', 
    color: 'white', 
    marginLeft: 10 
  },
  infoItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(255,255,255,0.1)' 
  },
  infoLabel: { 
    fontSize: 16, 
    color: 'rgba(255,255,255,0.8)' 
  },
  infoValue: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: 'white' 
  },
  toolButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(106, 17, 203, 0.3)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  toolButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10
  },
  logoutButton: { 
    alignSelf: 'center', 
    marginTop: 10,
    marginBottom: 30
  },
  logoutText: { 
    color: '#f44336', 
    fontSize: 16, 
    fontWeight: '600' 
  },
  settingsIconWrapper: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 10,
    marginTop: 20,
  }
});