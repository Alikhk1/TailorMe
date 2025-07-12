import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../../../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Ionicons } from '@expo/vector-icons';

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const user = auth.currentUser;

  const [armLength, setArmLength] = useState("");
  const [shoulders, setShoulders] = useState("");
  const [chest, setChest] = useState("");
  const [waist, setWaist] = useState("");
  const [hip, setHip] = useState("");
  const [neckSize, setNeckSize] = useState("");
  const [shalwarLength, setShalwarLength] = useState("");
  const [qameezLength, setQameezLength] = useState("");
  const [recommendedSize, setRecommendedSize] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const m = data.measurements || {};
          setArmLength(m.armLength || "");
          setShoulders(m.shoulders || "");
          setChest(m.chest || "");
          setWaist(m.waist || "");
          setHip(m.hip || "");
          setNeckSize(m.neckSize || "");
          setShalwarLength(m.shalwarLength || "");
          setQameezLength(m.qameezLength || "");
          setRecommendedSize(m.recommendedSize || "");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      const updatedMeasurements = {
        armLength,
        shoulders,
        chest,
        waist,
        hip,
        neckSize,
        shalwarLength,
        qameezLength,
        recommendedSize,
      };

      await setDoc(userRef, { measurements: updatedMeasurements }, { merge: true });

      Alert.alert("Success", "Profile updated!");
      navigation.goBack();
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Edit Profile</Text>
          <View style={styles.spacer} /> {/* This balances the flex space */}
        </View>

        {[
          ["Arm Length", armLength, setArmLength],
          ["Shoulder Width", shoulders, setShoulders],
          ["Chest", chest, setChest],
          ["Waist", waist, setWaist],
          ["Hip", hip, setHip],
          ["Neck Size", neckSize, setNeckSize],
          ["Shalwar Length", shalwarLength, setShalwarLength],
          ["Qameez Length", qameezLength, setQameezLength],
          ["Recommended Size", recommendedSize, setRecommendedSize],
        ].map(([label, value, setter], idx) => (
          <View key={idx} style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={setter}
              keyboardType={label.includes("Size") || label.includes("Recommended") ? "default" : "numeric"}
              placeholder={`Enter ${label.toLowerCase()}`}
              placeholderTextColor="#bbb"
              selectionColor="#d1b3ff"
            />
          </View>
        ))}

        <TouchableOpacity style={styles.button} onPress={handleSaveProfile}>
          <Text style={styles.buttonText}>Save Profile</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
    backgroundColor: "#1a0b4d",
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#1a0b4d",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 30,
    width: '100%',
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    textAlign: "center",
    flex: 1,
  },
  spacer: {
    width: 24, // Same as back button width for balance
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
    color: "white",
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#6a3bb5",
    borderRadius: 8,
    backgroundColor: "#2e1e61",
    color: "white",
  },
  button: {
    backgroundColor: "#6a3bb5",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});