import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  Linking, 
  Platform,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Easing
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function TailorHomeScreen() {
  const navigation = useNavigation();
  const buttonScale = new Animated.Value(1);
  const cardOpacity = new Animated.Value(0);
  const cardTranslateY = new Animated.Value(20);

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(cardTranslateY, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      })
    ]).start();
  }, []);

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

  const openTailorsMap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const query = "fabric shops near me";
    const mapUrl = Platform.select({
      ios: `maps://maps.apple.com/?q=${query}`,
      android: `https://www.google.com/maps/search/?api=1&query=${query}`,
    });
    
    Linking.canOpenURL(mapUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(mapUrl);
        } else {
          return Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
        }
      })
      .catch((err) => console.error('An error occurred', err));
  };

  const handleNavigation = (screen) => {
    Haptics.selectionAsync();
    navigation.navigate(screen);
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
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Tailor Me</Text>
            <Text style={styles.headerSubtitle}>Manage Your Clients Smoothly</Text>
          </View>

          <Animated.View 
            style={[
              styles.imageContainer,
              {
                opacity: cardOpacity,
                transform: [{ translateY: cardTranslateY }]
              }
            ]}
          >
            <Image
              source={require('../../../assets/images/sewing.png')}
              style={styles.bannerImage}
              resizeMode="contain"
            />
          </Animated.View>

          <Animated.View 
            style={[
              styles.descriptionContainer,
              {
                opacity: cardOpacity,
                transform: [{ translateY: cardTranslateY }]
              }
            ]}
          >
            <Text style={styles.descriptionTitle}>Digital Tailor Hub</Text>
            <Text style={styles.descriptionText}>
              Organize customer measurements, manage orders, and streamline your tailoring workflow with ease.
            </Text>
          </Animated.View>
          
          <View style={styles.buttonGroup}>
            <Animated.View style={[{ opacity: cardOpacity, transform: [{ translateY: cardTranslateY }] }]}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPressIn={animatePressIn}
                onPressOut={animatePressOut}
                onPress={() => handleNavigation('TailorMeasurementScreen')}
                style={styles.card}
              >
                <Animated.View style={[styles.cardContent, { transform: [{ scale: buttonScale }] }]}>
                  <View style={[styles.cardIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                    <MaterialCommunityIcons name="ruler" size={28} color="white" />
                  </View>
                  <View style={styles.cardText}>
                    <Text style={styles.cardTitle}>Take Measurements</Text>
                    <Text style={styles.cardDescription}>Scan and save client sizes</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.7)" />
                </Animated.View>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View style={[{ opacity: cardOpacity, transform: [{ translateY: cardTranslateY }], marginTop: 15 }]}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPressIn={animatePressIn}
                onPressOut={animatePressOut}
                onPress={() => handleNavigation('CustomerRecordsScreen')}
                style={styles.card}
              >
                <Animated.View style={[styles.cardContent, { transform: [{ scale: buttonScale }] }]}>
                  <View style={[styles.cardIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                    <FontAwesome5 name="file-alt" size={24} color="white" />
                  </View>
                  <View style={styles.cardText}>
                    <Text style={styles.cardTitle}>Customer Records</Text>
                    <Text style={styles.cardDescription}>View and manage past measurements</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.7)" />
                </Animated.View>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View style={[{ opacity: cardOpacity, transform: [{ translateY: cardTranslateY }], marginTop: 15 }]}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPressIn={animatePressIn}
                onPressOut={animatePressOut}
                onPress={() => handleNavigation('CustomerOrderScreen')}
                style={styles.card}
              >
                <Animated.View style={[styles.cardContent, { transform: [{ scale: buttonScale }] }]}>
                  <View style={[styles.cardIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                    <FontAwesome5 name="shopping-bag" size={22} color="white" />
                  </View>
                  <View style={styles.cardText}>
                    <Text style={styles.cardTitle}>Customer Orders</Text>
                    <Text style={styles.cardDescription}>Track and manage client orders</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.7)" />
                </Animated.View>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View style={[{ opacity: cardOpacity, transform: [{ translateY: cardTranslateY }], marginTop: 15 }]}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPressIn={animatePressIn}
                onPressOut={animatePressOut}
                onPress={() => handleNavigation('StatisticsScreen')}
                style={styles.card}
              >
                <Animated.View style={[styles.cardContent, { transform: [{ scale: buttonScale }] }]}>
                  <View style={[styles.cardIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                    <MaterialCommunityIcons name="chart-bar" size={24} color="white" />
                  </View>
                  <View style={styles.cardText}>
                    <Text style={styles.cardTitle}>Statistics</Text>
                    <Text style={styles.cardDescription}>View business insights and analytics</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.7)" />
                </Animated.View>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View style={[{ opacity: cardOpacity, transform: [{ translateY: cardTranslateY }], marginTop: 15 }]}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPressIn={animatePressIn}
                onPressOut={animatePressOut}
                onPress={openTailorsMap}
                style={styles.card}
              >
                <Animated.View style={[styles.cardContent, { transform: [{ scale: buttonScale }] }]}>
                  <View style={[styles.cardIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                    <MaterialCommunityIcons name="store-search" size={28} color="white" />
                  </View>
                  <View style={styles.cardText}>
                    <Text style={styles.cardTitle}>Find Fabric Stores</Text>
                    <Text style={styles.cardDescription}>Locate nearby materials and tools</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.7)" />
                </Animated.View>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#1a0b4d" },
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1, padding: 24, paddingTop: 40 },
  header: { marginBottom: 30, alignItems: 'center' },
  headerTitle: { fontSize: 32, fontWeight: '800', color: 'white', marginBottom: 4 },
  headerSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  imageContainer: { alignItems: 'center', marginBottom: 30 },
  bannerImage: { width: 200, height: 200, tintColor: 'white' },
  descriptionContainer: { alignItems: 'center', marginBottom: 40, paddingHorizontal: 20 },
  descriptionTitle: { fontSize: 22, fontWeight: '700', color: 'white', marginBottom: 12, textAlign: 'center' },
  descriptionText: { fontSize: 16, lineHeight: 24, color: 'rgba(255,255,255,0.9)', textAlign: 'center' },
  buttonGroup: { width: '100%', marginBottom: 20 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: 'white', marginBottom: 4 },
  cardDescription: { fontSize: 14, color: 'rgba(255,255,255,0.7)' },
});