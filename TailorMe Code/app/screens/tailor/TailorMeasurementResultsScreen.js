import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Share,
  Dimensions,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { auth, db } from '../../../firebaseConfig';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function TailorMeasurementResultsScreen({ route, navigation }) {
  const { imageUri } = route.params;
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [existingRecords, setExistingRecords] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    if (imageUri) processMeasurements(imageUri);
    fetchExistingRecords();
  }, [imageUri]);

  const fetchExistingRecords = async () => {
    try {
      const tailorRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(tailorRef);
      if (docSnap.exists()) {
        setExistingRecords(docSnap.data().records || []);
      }
    } catch (err) {
      console.error('Error fetching records:', err);
    }
  };

  const processMeasurements = async (uri) => {
    setLoading(true);
    try {
      let formData = new FormData();
      formData.append('image', {
        uri: uri,
        name: 'photo.jpg',
        type: 'image/jpeg',
      });

      const response = await fetch('https://shrew-neat-goldfish.ngrok-free.app/predict', {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      const formattedPredictions = {
        armLength: parseFloat(data['Arm Length']).toFixed(2),
        shoulderWidth: parseFloat(data['Shoulder Width']).toFixed(2),
        chest: parseFloat(data['Chest']).toFixed(2),
        waist: parseFloat(data['Waist']).toFixed(2),
        hip: parseFloat(data['Hip']).toFixed(2),
        neck: parseFloat(data['Neck']).toFixed(2),
        shalwarLength: parseFloat(data['Shalwar Length']).toFixed(2),
        qameezLength: parseFloat(data['Qameez Length']).toFixed(2),
        recommendedSize: data['Recommended Size'] || 'N/A',
      };

      setPredictions(formattedPredictions);
    } catch (err) {
      console.error('Measurement error:', err);
      Alert.alert('Error', 'Failed to process image.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToRecord = async () => {
    if (!user || !predictions || !username) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Please enter at least a username.');
      return;
    }

    // Check for duplicate phone number if provided
    if (phoneNumber) {
      const phoneNumberExists = existingRecords.some(
        record => record.phoneNumber === phoneNumber
      );

      if (phoneNumberExists) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert(
          "Error", 
          "A record with this phone number already exists. Please use a different phone number."
        );
        return;
      }
    }

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const tailorRef = doc(db, 'users', user.uid);
      const record = {
        username,
        phoneNumber: phoneNumber || 'N/A',
        ...predictions,
        timestamp: new Date(),
      };

      await updateDoc(tailorRef, {
        records: arrayUnion(record),
      });

      Alert.alert('Success', 'Client record added!');
      setUsername('');
      setPhoneNumber('');
      // Refresh existing records after adding new one
      fetchExistingRecords();
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error('Save error:', err);
      Alert.alert('Error', 'Failed to add record.');
    }
  };

  const handleShareMeasurements = async () => {
    if (!predictions) return;

    Haptics.selectionAsync();
    const text = `
📏 Client Measurement Results:

Arm Length: ${predictions.armLength} in
Shoulder Width: ${predictions.shoulderWidth} in
Chest: ${predictions.chest} in
Waist: ${predictions.waist} in
Hip: ${predictions.hip} in
Neck: ${predictions.neck} in
Shalwar Length: ${predictions.shalwarLength} in
Qameez Length: ${predictions.qameezLength} in

Recommended Size: ${predictions.recommendedSize}
`;

    try {
      await Share.share({ 
        message: text,
        title: 'Client Measurements'
      });
    } catch (err) {
      console.error('Share error:', err);
      Alert.alert('Error', 'Failed to share.');
    }
  };

  const renderMeasurementItem = (label, value, isLast = false) => (
    <View style={[styles.measurementItem, isLast && styles.lastItem]}>
      <Text style={styles.measurementLabel}>{label}</Text>
      <Text style={styles.measurementValue}>{value}</Text>
    </View>
  );

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
          <View style={styles.headerContainer}>
            <View style={styles.header}>
              <TouchableOpacity 
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.title}>Measurement Result</Text>
            </View>
          </View>

          {imageUri && (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: imageUri }}
                style={styles.image}
                resizeMode="contain"
              />
            </View>
          )}

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="white" />
              <Text style={styles.loadingText}>Analyzing measurements...</Text>
            </View>
          ) : predictions ? (
            <View style={styles.resultsContainer}>
              <View style={styles.resultsCard}>
                {renderMeasurementItem('Arm Length', `${predictions.armLength} in`)}
                {renderMeasurementItem('Shoulder Width', `${predictions.shoulderWidth} in`)}
                {renderMeasurementItem('Chest', `${predictions.chest} in`)}
                {renderMeasurementItem('Waist', `${predictions.waist} in`)}
                {renderMeasurementItem('Hip', `${predictions.hip} in`)}
                {renderMeasurementItem('Neck', `${predictions.neck} in`)}
                {renderMeasurementItem('Shalwar Length', `${predictions.shalwarLength} in`)}
                {renderMeasurementItem('Qameez Length', `${predictions.qameezLength} in`)}
                
                <View style={styles.sizeContainer}>
                  <Text style={styles.sizeLabel}>RECOMMENDED SIZE</Text>
                  <Text style={styles.sizeValue}>{predictions.recommendedSize}</Text>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Customer Name *"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={username}
                  onChangeText={setUsername}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleAddToRecord}
                >
                  <Text style={styles.buttonText}>Save Client</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.shareButton]}
                  onPress={handleShareMeasurements}
                >
                  <Text style={[styles.buttonText, styles.shareButtonText]}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a0b4d',
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 15
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
   imageContainer: {
    width: '100%',
    height: width * 0.7,
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 20,
    color: 'white',
    fontSize: 16,
    opacity: 0.9,
  },
  resultsContainer: {
    marginTop: 10,
    paddingHorizontal: 20,
  },
  resultsCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: 20,
  },
  measurementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  measurementLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '500',
  },
  measurementValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  sizeContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  sizeLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 5,
  },
  sizeValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
  },
  inputContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    color: 'white',
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  shareButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  shareButtonText: {
    opacity: 0.9,
  },
});