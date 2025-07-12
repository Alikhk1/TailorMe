import React, { useState, useCallback, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Animated,
  PermissionsAndroid,
  Platform,
  Linking
} from "react-native";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function TailorMeasurementScreen() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(false);
  const navigation = useNavigation();
  const buttonScale = new Animated.Value(1);

  useFocusEffect(
    useCallback(() => {
      return () => setImage(null);
    }, [])
  );

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
          console.log("Camera permission denied");
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      // iOS handles permissions differently (through Info.plist)
      setCameraPermission(true);
    }
  };

  const animatePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const animatePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleImageSelection = async (pickerFunction) => {
    try {
      // Check permissions if using camera
      if (pickerFunction === launchCamera && !cameraPermission) {
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

      setLoading(true);
      const options = {
        mediaType: 'photo',
        cameraType: "back"
      };

      const result = await pickerFunction(options);
      setLoading(false);
      
      if (!result.didCancel && result.assets && result.assets.length > 0) {
        Haptics.selectionAsync();
        const imageUri = result.assets[0].uri;
        setImage(imageUri);
        navigation.navigate("TailorMeasurementResultsScreen", { imageUri });
      }
    } catch (error) {
      setLoading(false);
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick an image.");
    }
  };

  const handleManualMeasurement = () => {
    Haptics.selectionAsync();
    navigation.navigate("ManualMeasurementForm");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <LinearGradient 
        colors={['#1a0b4d', '#3a1c96', '#6a3bb5', '#9a5fd9']}
        locations={[0.1, 0.4, 0.7, 1]}
        style={styles.container}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Tailor Measurement</Text>
            <Text style={styles.headerSubtitle}>Capture measurements for clients</Text>
          </View>

          {/* Instructions Section */}
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

          {/* Buttons Section */}
          {loading ? (
            <ActivityIndicator size="large" color="white" />
          ) : (
            <View style={styles.buttonGroup}>
              {/* Take Photo Button - Now first */}
              <TouchableOpacity
                style={[styles.card, styles.primaryCard]} // Added primaryCard style
                activeOpacity={0.9}
                onPressIn={animatePressIn}
                onPressOut={animatePressOut}
                onPress={() => handleImageSelection(launchCamera)}
              >
                <View style={styles.cardContent}>
                  <View style={[styles.cardIcon, styles.primaryIcon]}>
                    <MaterialCommunityIcons name="camera" size={28} color="white" />
                  </View>
                  <View style={styles.cardText}>
                    <Text style={styles.cardTitle}>Take a Photo</Text>
                    <Text style={styles.cardDescription}>Use your camera for best results</Text>
                  </View>
                  <FontAwesome5 name="chevron-right" size={16} color="rgba(255,255,255,0.7)" />
                </View>
              </TouchableOpacity>

              {/* Choose from Gallery Button - Now second */}
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.9}
                onPressIn={animatePressIn}
                onPressOut={animatePressOut}
                onPress={() => handleImageSelection(launchImageLibrary)}
              >
                <View style={styles.cardContent}>
                  <View style={styles.cardIcon}>
                    <MaterialCommunityIcons name="image" size={28} color="white" />
                  </View>
                  <View style={styles.cardText}>
                    <Text style={styles.cardTitle}>Choose from Gallery</Text>
                    <Text style={styles.cardDescription}>Select an existing photo</Text>
                  </View>
                  <FontAwesome5 name="chevron-right" size={16} color="rgba(255,255,255,0.7)" />
                </View>
              </TouchableOpacity>

              {/* Manual Measurement Button */}
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.9}
                onPressIn={animatePressIn}
                onPressOut={animatePressOut}
                onPress={handleManualMeasurement}
              >
                <View style={styles.cardContent}>
                  <View style={styles.cardIcon}>
                    <FontAwesome5 name="ruler-combined" size={24} color="white" />
                  </View>
                  <View style={styles.cardText}>
                    <Text style={styles.cardTitle}>Manual Measurement</Text>
                    <Text style={styles.cardDescription}>Enter measurements manually</Text>
                  </View>
                  <FontAwesome5 name="chevron-right" size={16} color="rgba(255,255,255,0.7)" />
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
  safeArea: {
    flex: 1,
    backgroundColor: "#1a0b4d",
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 40,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  instructionsContainer: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  instructionImage: {
    width: 220,
    height: 220,
    marginBottom: 25,
  },
  instructionsText: {
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'left',
  },
  buttonGroup: {
    width: '100%',
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: 15,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
});