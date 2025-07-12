import { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  KeyboardAvoidingView,
  Platform, 
  ScrollView 
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../../../firebaseConfig";
import { doc, updateDoc, arrayUnion, writeBatch, getDoc } from "firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from '@expo/vector-icons';

export default function ManualMeasurementForm() {
  const navigation = useNavigation();
  const user = auth.currentUser;
  const [existingRecords, setExistingRecords] = useState([]);

  const [formData, setFormData] = useState({
    username: "",
    phoneNumber: "",
    armLength: "",
    shoulderWidth: "",
    chest: "",
    waist: "",
    hip: "",
    neck: "",
    shalwarLength: "",
    qameezLength: "",
    recommendedSize: ""
  });

  // Load existing records when component mounts
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const tailorRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(tailorRef);
        if (docSnap.exists()) {
          setExistingRecords(docSnap.data().records || []);
        }
      } catch (error) {
        console.error("Error fetching records:", error);
      }
    };

    fetchRecords();
  }, [user.uid]);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveMeasurement = async () => {
    if (!formData.username.trim() || !formData.phoneNumber.trim()) {
      Alert.alert("Error", "Username and Phone Number are required");
      return;
    }

    // Check for duplicate phone number
    const phoneNumberExists = existingRecords.some(
      record => record.phoneNumber === formData.phoneNumber
    );

    if (phoneNumberExists) {
      Alert.alert(
        "Error", 
        "A record with this phone number already exists. Please use a different phone number."
      );
      return;
    }

    try {
      const measurementData = {
        ...formData,
        timestamp: new Date(),
      };

      const batch = writeBatch(db);
      const tailorRef = doc(db, "users", user.uid);

      batch.update(tailorRef, {
        records: arrayUnion(measurementData),
      });

      await batch.commit();
      Alert.alert("Success", "Measurement saved successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error saving measurement:", error);
      Alert.alert("Error", "Failed to save measurement.");
    }
  };

  return (
    <LinearGradient
      colors={["#1a0b4d", "#3a1c96", "#6a3bb5", "#9a5fd9"]}
      style={styles.gradient}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={80}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.title}>Manual Measurements</Text>
            <View style={styles.headerSpacer} />
          </View>
          
          <View style={styles.container}>
            {/* Personal Information Section */}
            <Text style={styles.sectionHeader}>Personal Information</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Name *" 
              placeholderTextColor="#aaa"
              value={formData.username}
              onChangeText={(text) => handleChange('username', text)}
            />
            <TextInput 
              style={styles.input} 
              placeholder="Phone Number *" 
              placeholderTextColor="#aaa"
              value={formData.phoneNumber}
              onChangeText={(text) => handleChange('phoneNumber', text)}
              keyboardType="phone-pad" 
            />

            {/* Body Measurements Section */}
            <Text style={styles.sectionHeader}>Body Measurements (in inches)</Text>
            <View style={styles.twoColumnContainer}>
              <View style={styles.column}>
                <Text style={styles.fieldLabel}>Arm Length</Text>
                <TextInput 
                  style={styles.input} 
                  value={formData.armLength}
                  onChangeText={(text) => handleChange('armLength', text)}
                  keyboardType="numeric" 
                />
              </View>
              <View style={styles.column}>
                <Text style={styles.fieldLabel}>Shoulder Width</Text>
                <TextInput 
                  style={styles.input} 
                  value={formData.shoulderWidth}
                  onChangeText={(text) => handleChange('shoulderWidth', text)}
                  keyboardType="numeric" 
                />
              </View>
            </View>

            <View style={styles.twoColumnContainer}>
              <View style={styles.column}>
                <Text style={styles.fieldLabel}>Chest</Text>
                <TextInput 
                  style={styles.input} 
                  value={formData.chest}
                  onChangeText={(text) => handleChange('chest', text)}
                  keyboardType="numeric" 
                />
              </View>
              <View style={styles.column}>
                <Text style={styles.fieldLabel}>Waist</Text>
                <TextInput 
                  style={styles.input} 
                  value={formData.waist}
                  onChangeText={(text) => handleChange('waist', text)}
                  keyboardType="numeric" 
                />
              </View>
            </View>

            <View style={styles.twoColumnContainer}>
              <View style={styles.column}>
                <Text style={styles.fieldLabel}>Hip</Text>
                <TextInput 
                  style={styles.input} 
                  value={formData.hip}
                  onChangeText={(text) => handleChange('hip', text)}
                  keyboardType="numeric" 
                />
              </View>
              <View style={styles.column}>
                <Text style={styles.fieldLabel}>Neck Size</Text>
                <TextInput 
                  style={styles.input} 
                  value={formData.neck}
                  onChangeText={(text) => handleChange('neck', text)}
                  keyboardType="numeric" 
                />
              </View>
            </View>

            {/* Garment Measurements Section */}
            <Text style={styles.sectionHeader}>Garment Measurements</Text>
            <View style={styles.twoColumnContainer}>
              <View style={styles.column}>
                <Text style={styles.fieldLabel}>Shalwar Length</Text>
                <TextInput 
                  style={styles.input} 
                  value={formData.shalwarLength}
                  onChangeText={(text) => handleChange('shalwarLength', text)}
                  keyboardType="numeric" 
                />
              </View>
              <View style={styles.column}>
                <Text style={styles.fieldLabel}>Qameez Length</Text>
                <TextInput 
                  style={styles.input} 
                  value={formData.qameezLength}
                  onChangeText={(text) => handleChange('qameezLength', text)}
                  keyboardType="numeric" 
                />
              </View>
            </View>

            <Text style={styles.fieldLabel}>Recommended Size</Text>
            <TextInput 
              style={styles.input} 
              placeholder="e.g., Medium" 
              placeholderTextColor="#aaa"
              value={formData.recommendedSize}
              onChangeText={(text) => handleChange('recommendedSize', text)}
            />

            <TouchableOpacity 
              style={styles.button} 
              onPress={handleSaveMeasurement}
            >
              <Text style={styles.buttonText}>Save Measurement</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    width: '100%',
    marginTop: 30
  },
  backButton: {
    padding: 5,
  },
  headerSpacer: {
    width: 24, // To balance the back button on the left
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "white",
    textAlign: "center",
    flex: 1,
  },
  container: {
    flex: 1,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
    marginTop: 15,
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 5,
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: "rgba(255,255,255,0.1)",
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