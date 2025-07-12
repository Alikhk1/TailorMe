import React, { useState, useEffect, useContext } from "react";
import { 
  View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, 
  SafeAreaView, StatusBar, Share
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../../../firebaseConfig";
import { doc, onSnapshot } from "firebase/firestore";
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from "../../AuthContext";
import * as Haptics from 'expo-haptics';

export default function UserProfileScreen() {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const [username, setUserName] = useState("");
  const [measurements, setMeasurements] = useState({});

  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserName(data.username || "No Name");
        setMeasurements(data.measurements || {});
      }
    });
    return () => unsubscribe();
  }, [user]);

  const renderMeasurementItem = (label, value) => (
    <View style={styles.measurementItem}>
      <Text style={styles.measurementLabel}>{label}</Text>
      <Text style={styles.measurementValue}>
        {value || "N/A"}{label !== "Recommended Size" ? " inches" : ""}
      </Text>
    </View>
  );

  const handleShareMeasurements = async () => {
      const currentRecord = measurements;
      const message = `
    Measurements:
    ---------------------------------------------
    Username: ${username}
    Arm: ${currentRecord.armLength || "N/A"} Inches
    Shoulder: ${currentRecord.shoulders || "N/A"} Inches
    Chest: ${currentRecord.chest || "N/A"} Inches
    Waist: ${currentRecord.waist || "N/A"} Inches
    Hip: ${currentRecord.hip || "N/A"} Inches
    Neck: ${currentRecord.neckSize || "N/A"} Inches
    Shalwar Length: ${currentRecord.shalwarLength || "N/A"} Inches
    Qameez Length: ${currentRecord.qameezLength || "N/A"} Inches
    Recommended Size: ${currentRecord.recommendedSize || "N/A"}
    ---------------------------------------------
    `;

      try {
        await Share.share({ message });
      } catch (error) {
        console.error("Sharing failed:", error);
      }
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
            <TouchableOpacity onPress={() => navigation.navigate("UserSettingsScreen")}>
              <MaterialCommunityIcons name="cog" size={28} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileHeader}>
            <Image 
              source={require("../../../assets/images/profile.png")} 
              style={styles.profilePic} 
            />
            <Text style={styles.username}>{username}</Text>
            <Text style={styles.roleBadge}>User</Text>
          </View>

          <View style={styles.contentCard}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="ruler" size={24} color="#6a11cb" />
              <Text style={styles.sectionTitle}>Your Measurements</Text>
            </View>

            {renderMeasurementItem("Arm Length", measurements.armLength)}
            {renderMeasurementItem("Shoulder Width", measurements.shoulders)}
            {renderMeasurementItem("Chest", measurements.chest)}
            {renderMeasurementItem("Waist", measurements.waist)}
            {renderMeasurementItem("Hip", measurements.hip)}
            {renderMeasurementItem("Neck", measurements.neckSize)}
            {renderMeasurementItem("Shalwar Length", measurements.shalwarLength)}
            {renderMeasurementItem("Qameez Length", measurements.qameezLength)}
            {renderMeasurementItem("Recommended Size", measurements.recommendedSize)}

            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate("EditProfileScreen")}
            >
              <Text style={styles.editButtonText}>Edit Measurements</Text>
            </TouchableOpacity>
            
            {/*share measurements button*/}
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleShareMeasurements()}
            >
              <Text style={styles.editButtonText}>Share Measurements</Text>
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
  profilePic: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)' },
  username: { fontSize: 24, fontWeight: '700', color: 'white', marginTop: 15 },
  roleBadge: { fontSize: 14, color: 'rgba(255,255,255,0.8)', backgroundColor: 'rgba(106, 17, 203, 0.3)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 5 },
  contentCard: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', width: '100%' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: 'white', marginLeft: 10 },
  measurementItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  measurementLabel: { fontSize: 16, color: 'rgba(255,255,255,0.8)' },
  measurementValue: { fontSize: 16, fontWeight: '600', color: 'white' },
  editButton: { backgroundColor: 'rgba(106, 17, 203, 0.3)', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  editButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  logoutButton: { alignSelf: 'center', marginTop: 30 },
  logoutText: { color: '#f44336', fontSize: 16, fontWeight: '600' },
  settingsIconWrapper: {
  position: "absolute",
  top: 20,
  right: 20,
  zIndex: 10,
  marginTop: 20,
}
});
