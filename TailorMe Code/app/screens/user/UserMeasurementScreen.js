import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Image,
  PermissionsAndroid,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import * as Haptics from "expo-haptics";

export default function UserMeasurementScreen() {
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "This app needs access to your camera to take photos.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setCameraPermission(true);
        } else {
          Alert.alert("Camera permission denied");
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      // iOS handles permissions differently (through Info.plist)
      setCameraPermission(true);
    }
  };

  const openCamera = async () => {
    if (!cameraPermission) {
      Alert.alert(
        "Permission Required",
        "Please grant camera permissions in settings to use this feature.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() }
        ]
      );
      return;
    }

    launchCamera({ mediaType: "photo", cameraType: "back" }, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert("Camera Error", response.errorMessage || "Could not open camera.");
        return;
      }
      const uri = response.assets?.[0]?.uri;
      if (uri) {
        Haptics.selectionAsync();
        navigation.navigate("UserMeasurementResultsScreen", { imageUri: uri });
      }
    });
  };

  const openGallery = () => {
    launchImageLibrary({ mediaType: "photo" }, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert("Gallery Error", response.errorMessage || "Could not open gallery.");
        return;
      }
      const uri = response.assets?.[0]?.uri;
      if (uri) {
        Haptics.selectionAsync();
        navigation.navigate("UserMeasurementResultsScreen", { imageUri: uri });
      }
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#1a0b4d", "#3a1c96", "#6a3bb5", "#9a5fd9"]}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Body Measurement</Text>
            <Text style={styles.headerSubtitle}>Capture your measurements</Text>
          </View>

          <View style={styles.instructionsContainer}>
            <Image
              source={require("../../../assets/images/tpose.png")}
              style={styles.instructionImage}
              resizeMode="contain"
            />
            <Text style={styles.instructionsText}>
              For accurate measurements:
              {"\n\n"}• Stand straight in a T-pose
              {"\n"}• Capture from a straight angle
              {"\n"}• Ensure good lighting
              {"\n"}• Use a plain background
            </Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="white" />
          ) : (
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.9}
                onPress={openCamera}
              >
                <View style={styles.cardContent}>
                  <View style={styles.cardIcon}>
                    <MaterialCommunityIcons name="camera" size={28} color="white" />
                  </View>
                  <View style={styles.cardText}>
                    <Text style={styles.cardTitle}>Open Camera</Text>
                    <Text style={styles.cardDescription}>Take a new photo</Text>
                  </View>
                  <FontAwesome5
                    name="chevron-right"
                    size={16}
                    color="rgba(255,255,255,0.7)"
                  />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.9}
                onPress={openGallery}
              >
                <View style={styles.cardContent}>
                  <View style={styles.cardIcon}>
                    <MaterialCommunityIcons name="image" size={28} color="white" />
                  </View>
                  <View style={styles.cardText}>
                    <Text style={styles.cardTitle}>Select from Gallery</Text>
                    <Text style={styles.cardDescription}>Pick an existing photo</Text>
                  </View>
                  <FontAwesome5
                    name="chevron-right"
                    size={16}
                    color="rgba(255,255,255,0.7)"
                  />
                </View>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#1a0b4d" },
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1, padding: 24, paddingTop: 40 },
  header: { marginBottom: 30, alignItems: "center" },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "white",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },
  instructionsContainer: { alignItems: "center", marginBottom: 40 },
  instructionImage: { width: 220, height: 220, marginBottom: 25 },
  instructionsText: {
    fontSize: 16,
    lineHeight: 24,
    color: "rgba(255,255,255,0.9)",
    textAlign: "left",
  },
  buttonGroup: { width: "100%", marginBottom: 20 },
  card: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    marginBottom: 15,
  },
  cardContent: { flexDirection: "row", alignItems: "center" },
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: "600", color: "white", marginBottom: 4 },
  cardDescription: { fontSize: 14, color: "rgba(255,255,255,0.7)" },
});