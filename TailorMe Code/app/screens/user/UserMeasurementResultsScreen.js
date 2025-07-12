import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView,
  Share,
  Dimensions,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { auth, db } from '../../../firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function UserMeasurementResultScreen({ route, navigation }) {
  const { imageUri } = route.params;
  const [measurements, setMeasurements] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const user = auth.currentUser;

  useEffect(() => {
    if (imageUri) {
      processImage(imageUri);
    }
  }, [imageUri]);

  const processImage = async (uri) => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: uri,
        name: 'measurement_photo.jpg',
        type: 'image/jpeg',
      });

      const response = await fetch(
        'https://shrew-neat-goldfish.ngrok-free.app/predict',
        {
          method: 'POST',
          body: formData,
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process image');
      }

      const formattedMeasurements = {
        armLength: parseFloat(data['Arm Length']).toFixed(2),
        shoulderWidth: parseFloat(data['Shoulder Width']).toFixed(2),
        chest: parseFloat(data['Chest']).toFixed(2),
        waist: parseFloat(data['Waist']).toFixed(2),
        hip: parseFloat(data['Hip']).toFixed(2),
        neck: parseFloat(data['Neck']).toFixed(2),
        shalwarLength: parseFloat(data['Shalwar Length']).toFixed(2),
        qameezLength: parseFloat(data['Qameez Length']).toFixed(2),
        recommendedSize: data['Recommended Size'] || 'Not Determined'
      };

      setMeasurements(formattedMeasurements);
    } catch (err) {
      console.error('Measurement error:', err);
      setError(err.message);
      Alert.alert('Error', 'Failed to process measurements. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !measurements) return;

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        measurements: {
          armLength: measurements.armLength,
          shoulders: measurements.shoulderWidth,
          chest: measurements.chest,
          waist: measurements.waist,
          hip: measurements.hip,
          neckSize: measurements.neck,
          shalwarLength: measurements.shalwarLength,
          qameezLength: measurements.qameezLength,
          recommendedSize: measurements.recommendedSize,
        },
      });
      Alert.alert('Success', 'Measurements saved to your profile!');
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error('Save error:', err);
      Alert.alert('Error', 'Failed to save measurements.');
    }
  };

  const handleRetake = () => {
    Haptics.selectionAsync();
    setMeasurements(null);
    setError(null);
    navigation.goBack();
  };

  const handleShare = async () => {
    if (!measurements) return;

    Haptics.selectionAsync();
    const measurementText = `
      📏 Measurement Results:
      
      Arm Length: ${measurements.armLength} in
      Shoulder Width: ${measurements.shoulderWidth} in
      Chest: ${measurements.chest} in
      Waist: ${measurements.waist} in
      Hip: ${measurements.hip} in
      Neck: ${measurements.neck} in
      Shalwar Length: ${measurements.shalwarLength} in
      Qameez Length: ${measurements.qameezLength} in
      
      Recommended Size: ${measurements.recommendedSize}
    `;

    try {
      await Share.share({
        message: measurementText,
        title: 'My Measurement Results'
      });
    } catch (err) {
      console.error('Share error:', err);
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
              <Text style={styles.title}>Measurement Results</Text>
            </View>
          </View>

          {imageUri && (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: imageUri }}
                style={styles.image}
              />
            </View>
          )}

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="white" />
              <Text style={styles.loadingText}>Analyzing your measurements...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={40}
                color="#ff6b6b"
              />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={handleRetake}
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : measurements ? (
            <View style={styles.resultsContainer}>
              <View style={styles.resultsCard}>
                {renderMeasurementItem('Arm Length', `${measurements.armLength} in`)}
                {renderMeasurementItem('Shoulder Width', `${measurements.shoulderWidth} in`)}
                {renderMeasurementItem('Chest', `${measurements.chest} in`)}
                {renderMeasurementItem('Waist', `${measurements.waist} in`)}
                {renderMeasurementItem('Hip', `${measurements.hip} in`)}
                {renderMeasurementItem('Neck', `${measurements.neck} in`)}
                {renderMeasurementItem('Shalwar Length', `${measurements.shalwarLength} in`)}
                {renderMeasurementItem('Qameez Length', `${measurements.qameezLength} in`)}
                
                <View style={styles.sizeContainer}>
                  <Text style={styles.sizeLabel}>RECOMMENDED SIZE</Text>
                  <Text style={styles.sizeValue}>{measurements.recommendedSize}</Text>
                </View>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSave}
                >
                  <Text style={styles.buttonText}>Save to Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.shareButton]}
                  onPress={handleShare}
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
    backgroundColor: 'transparent',
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
  errorContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    marginTop: 20,
    marginHorizontal: 20,
  },
  errorText: {
    marginTop: 10,
    color: '#ff6b6b',
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
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
    color: 'white',
    opacity: 0.9,
  },
});