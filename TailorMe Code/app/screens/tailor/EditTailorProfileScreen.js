import React, { useContext, useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ScrollView,
  SafeAreaView,
  StatusBar
} from "react-native";
import { auth, db } from "../../../firebaseConfig";
import { 
  updatePassword, 
  EmailAuthProvider, 
  reauthenticateWithCredential 
} from "firebase/auth";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { AuthContext } from "../../AuthContext";
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from "@react-navigation/native";

export default function EditTailorProfileScreen() {
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
  });
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTailorData = async () => {
      if (!user) return;
      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFormData({
          name: data.name || "",
          username: data.username || "",
        });
      }
    };
    fetchTailorData();
  }, [user]);

  const handleUpdate = async () => {
    setLoading(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    try {
      if (formData.name.trim() || formData.username.trim()) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          name: formData.name.trim(),
          username: formData.username.trim()
        });
      }

      if (newPassword.trim()) {
        if (!currentPassword) {
          throw new Error("Current password is required to change password");
        }

        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
      }

      Alert.alert("Success", "Profile updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <LinearGradient 
        colors={['#1a0b4d', '#3a1c96', '#6a3bb5', '#9a5fd9']}
        style={styles.container}
      >
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formCard}>
            <Text style={styles.label}>Name</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="account" size={20} color="#6a11cb" style={styles.icon} />
              <TextInput
                placeholder="Enter your name"
                placeholderTextColor="#aaa"
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({...formData, name: text})}
              />
            </View>

            <Text style={styles.label}>Username</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="account-circle" size={20} color="#6a11cb" style={styles.icon} />
              <TextInput
                placeholder="Enter username"
                placeholderTextColor="#aaa"
                style={styles.input}
                value={formData.username}
                onChangeText={(text) => setFormData({...formData, username: text})}
              />
            </View>

            <Text style={styles.label}>New Password</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="lock" size={20} color="#6a11cb" style={styles.icon} />
              <TextInput
                placeholder="(leave blank to keep current)"
                placeholderTextColor="#aaa"
                style={styles.input}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
            </View>

            {newPassword !== "" && (
              <>
                <Text style={styles.requiredLabel}>Current Password*</Text>
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons name="lock-check" size={20} color="#f44336" style={styles.icon} />
                  <TextInput
                    placeholder="Enter current password to verify"
                    placeholderTextColor="#aaa"
                    style={styles.input}
                    secureTextEntry
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                  />
                </View>
              </>
            )}
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && styles.disabledButton]} 
            onPress={handleUpdate}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              {loading ? "Updating..." : "Save Changes"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: "#1a0b4d" 
  },
  container: { 
    flex: 1 
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 25,
    marginTop: 40,
  },
  backButton: {
    padding: 8,
    marginLeft: -8
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: "700",
    color: "white",
    textAlign: 'center',
    flex: 1
  },
  headerSpacer: {
    width: 32
  },
  scrollContainer: { 
    flexGrow: 1, 
    paddingHorizontal: 20,
    paddingBottom: 30
  },
  formCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: 20
  },
  label: { 
    color: "white", 
    fontWeight: "600", 
    marginBottom: 8, 
    fontSize: 16,
    marginLeft: 5
  },
  requiredLabel: {
    color: "#f44336",
    fontWeight: "600",
    marginBottom: 8,
    fontSize: 16,
    marginLeft: 5
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15
  },
  icon: {
    marginRight: 10
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333'
  },
  button: { 
    backgroundColor: '#6a11cb',
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  disabledButton: {
    backgroundColor: '#9e9e9e'
  },
  buttonText: { 
    color: "white", 
    fontWeight: "700",
    fontSize: 16
  }
});