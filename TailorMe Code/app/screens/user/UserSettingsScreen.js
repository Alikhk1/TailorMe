import React, { useContext, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { auth, db } from "../../../firebaseConfig";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { AuthContext } from "../../AuthContext";
import { Ionicons } from "@expo/vector-icons";

export default function UserSettingsScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

  const handleUpdate = async () => {
    let usernameUpdated = false;
    let passwordUpdated = false;

    if (newPassword && !currentPassword) {
      Alert.alert("Required", "Please enter your current password to update password.");
      return;
    }

    try {
      if (newPassword) {
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
      }

      if (newUsername.trim()) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { username: newUsername });
        usernameUpdated = true;
      }

      if (newPassword.trim()) {
        await updatePassword(user, newPassword);
        passwordUpdated = true;
      }

      if (usernameUpdated || passwordUpdated) {
        let message = "";
        if (usernameUpdated) message += "User updated.\n";
        if (passwordUpdated) message += "Password updated.";
        
        setCurrentPassword("");
        setNewPassword("");
        setNewUsername("");

       Alert.alert("Success", message.trim());
      } else {
        Alert.alert("Info", "No changes made.");
      }
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.heading}>Edit Profile</Text>
        <View style={{ width: 24 }} /> {/* Spacer for balance */}
      </View>

      <Text style={styles.label}>New Username</Text>
      <TextInput
        placeholder="Enter new username"
        placeholderTextColor="#aaa"
        style={styles.input}
        value={newUsername}
        onChangeText={setNewUsername}
      />

      <Text style={styles.label}>New Password</Text>
      <TextInput
        placeholder="Enter new password"
        placeholderTextColor="#aaa"
        style={styles.input}
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />

      {newPassword !== "" && (
        <>
          <Text style={styles.label1}>Current Password (required)</Text>
          <TextInput
            placeholder="Enter current password"
            placeholderTextColor="#aaa"
            style={styles.input}
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
        </>
      )}

      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={styles.buttonText}>Update</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#1a0b4d" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 30,
  },
  heading: { 
    fontSize: 24, 
    fontWeight: "700", 
    color: "white", 
    textAlign: "center",
    flex: 1,
  },
  label: { color: "white", fontWeight: "600", marginBottom: 6, fontSize: 16 },
  label1: { color: "red", fontWeight: "600", marginBottom: 6, fontSize: 16 },
  input: { backgroundColor: "white", padding: 12, borderRadius: 8, marginBottom: 12 },
  button: { backgroundColor: "#6a3bb5", padding: 12, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "white", fontWeight: "700" },
});