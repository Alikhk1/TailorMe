import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  StatusBar
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { getAuth } from "firebase/auth";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from '@expo/vector-icons';

export default function EditUserRecordScreen({ route }) {
  const { record } = route.params;
  const navigation = useNavigation();
  const auth = getAuth();
  const user = auth.currentUser;

  const [formData, setFormData] = useState({
    ...record,
    shalwarLength: record.shalwarLength || "",
    qameezLength: record.qameezLength || "",
    recommendedSize: record.recommendedSize || "",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.username.trim() || !formData.phoneNumber.trim()) {
      Alert.alert("Error", "Username and Phone Number are required");
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      const userSnapshot = await getDoc(userRef);

      if (!userSnapshot.exists()) {
        Alert.alert("Error", "User not found.");
        return;
      }

      const userData = userSnapshot.data();
      const records = userData.records || [];

      const recordIndex = records.findIndex(
        (rec) => rec.username === record.username
      );

      if (recordIndex === -1) {
        Alert.alert("Error", "Original record not found.");
        return;
      }

      records[recordIndex] = formData;

      await updateDoc(userRef, { records });

      Alert.alert("Success", "Record updated successfully.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("Error updating record:", error);
      Alert.alert("Error", "Failed to update record.");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <LinearGradient
        colors={["#1a0b4d", "#3a1c96", "#6a3bb5", "#9a5fd9"]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 80}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.headerContainer}>
              <TouchableOpacity 
                onPress={() => navigation.goBack()}
                hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.title}>Edit Measurement</Text>
              <View style={styles.spacer} /> {/* This balances the flex space */}
            </View>

            <View style={styles.container}>
              {/* Personal Information Section */}
              <Text style={styles.sectionHeader}>Personal Information</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Username *</Text>
                <TextInput
                  style={styles.input}
                  value={String(formData.username)}
                  onChangeText={(text) => handleInputChange("username", text)}
                  placeholder="Enter username"
                  placeholderTextColor="#aaa"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number *</Text>
                <TextInput
                  style={styles.input}
                  value={String(formData.phoneNumber)}
                  onChangeText={(text) => handleInputChange("phoneNumber", text)}
                  keyboardType="phone-pad"
                  placeholder="Enter phone number"
                  placeholderTextColor="#aaa"
                />
              </View>

              {/* Body Measurements Section */}
              <Text style={styles.sectionHeader}>Body Measurements (in inches)</Text>
              <View style={styles.twoColumnContainer}>
                <View style={styles.column}>
                  <Text style={styles.label}>Arm Length</Text>
                  <TextInput
                    style={styles.input}
                    value={String(formData.armLength)}
                    onChangeText={(text) => handleInputChange("armLength", text)}
                    keyboardType="numeric"
                    placeholder="Enter arm length"
                    placeholderTextColor="#aaa"
                  />
                </View>
                <View style={styles.column}>
                  <Text style={styles.label}>Shoulder Width</Text>
                  <TextInput
                    style={styles.input}
                    value={String(formData.shoulderWidth)}
                    onChangeText={(text) => handleInputChange("shoulders", text)}
                    keyboardType="numeric"
                    placeholder="Enter shoulder width"
                    placeholderTextColor="#aaa"
                  />
                </View>
              </View>

              <View style={styles.twoColumnContainer}>
                <View style={styles.column}>
                  <Text style={styles.label}>Chest</Text>
                  <TextInput
                    style={styles.input}
                    value={String(formData.chest)}
                    onChangeText={(text) => handleInputChange("chest", text)}
                    keyboardType="numeric"
                    placeholder="Enter chest size"
                    placeholderTextColor="#aaa"
                  />
                </View>
                <View style={styles.column}>
                  <Text style={styles.label}>Waist</Text>
                  <TextInput
                    style={styles.input}
                    value={String(formData.waist)}
                    onChangeText={(text) => handleInputChange("waist", text)}
                    keyboardType="numeric"
                    placeholder="Enter waist size"
                    placeholderTextColor="#aaa"
                  />
                </View>
              </View>

              <View style={styles.twoColumnContainer}>
                <View style={styles.column}>
                  <Text style={styles.label}>Hip</Text>
                  <TextInput
                    style={styles.input}
                    value={String(formData.hip)}
                    onChangeText={(text) => handleInputChange("hip", text)}
                    keyboardType="numeric"
                    placeholder="Enter hip size"
                    placeholderTextColor="#aaa"
                  />
                </View>
                <View style={styles.column}>
                  <Text style={styles.label}>Neck Size</Text>
                  <TextInput
                    style={styles.input}
                    value={String(formData.neck)}
                    onChangeText={(text) => handleInputChange("neckSize", text)}
                    keyboardType="numeric"
                    placeholder="Enter neck size"
                    placeholderTextColor="#aaa"
                  />
                </View>
              </View>

              {/* Garment Measurements Section */}
              <Text style={styles.sectionHeader}>Garment Measurements</Text>
              <View style={styles.twoColumnContainer}>
                <View style={styles.column}>
                  <Text style={styles.label}>Shalwar Length</Text>
                  <TextInput
                    style={styles.input}
                    value={String(formData.shalwarLength)}
                    onChangeText={(text) => handleInputChange("shalwarLength", text)}
                    keyboardType="numeric"
                    placeholder="Enter shalwar length"
                    placeholderTextColor="#aaa"
                  />
                </View>
                <View style={styles.column}>
                  <Text style={styles.label}>Qameez Length</Text>
                  <TextInput
                    style={styles.input}
                    value={String(formData.qameezLength)}
                    onChangeText={(text) => handleInputChange("qameezLength", text)}
                    keyboardType="numeric"
                    placeholder="Enter qameez length"
                    placeholderTextColor="#aaa"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Recommended Size</Text>
                <TextInput
                  style={styles.input}
                  value={String(formData.recommendedSize)}
                  onChangeText={(text) => handleInputChange("recommendedSize", text)}
                  placeholder="Enter recommended size"
                  placeholderTextColor="#aaa"
                />
              </View>

              <TouchableOpacity style={styles.button} onPress={handleSave}>
                <Text style={styles.buttonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight + 20,
  },
  container: {
    flex: 1,
    paddingBottom: 40,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
    width: '100%',
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "white",
    textAlign: "center",
    flex: 1,
  },
  spacer: {
    width: 24, // Same as back button width for balance
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
    marginTop: 15,
    marginBottom: 10,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
    marginBottom: 6,
    fontSize: 14,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    color: "white",
  },
  twoColumnContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  column: {
    width: "48%",
  },
  button: {
    backgroundColor: "#6200ee",
    padding: 16,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginTop: 30,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});