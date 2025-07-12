import React, { useState, useEffect, useContext } from "react";
import {
  View, Text, TouchableOpacity, FlatList, TextInput, StyleSheet,
  SafeAreaView, StatusBar
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { db } from "../../../firebaseConfig";
import { doc, onSnapshot } from "firebase/firestore";
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { AuthContext } from "../../AuthContext";
import * as Haptics from 'expo-haptics';

export default function CustomerRecordsScreen() {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const [username, setUserName] = useState("");
  const [records, setRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredRecords, setFilteredRecords] = useState([]);

  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserName(data.username || "No Name");
        setRecords(data.records || []);
      }
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    setFilteredRecords(
      records.filter(
        (record) =>
          (record.username && record.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (record.phoneNumber && record.phoneNumber.includes(searchQuery))
      )
    );
  }, [searchQuery, records]);

  const renderRecordItem = ({ item }) => (
    <TouchableOpacity
      style={styles.recordItem}
      onPress={() => {
        Haptics.selectionAsync();
        navigation.navigate("CustomerRecordDetails", { record: item });
      }}
    >
      <View style={styles.recordContent}>
        <View style={styles.recordIcon}>
          <Ionicons name="person" size={20} color="#6a11cb" />
        </View>
        <View style={styles.recordTextContainer}>
          <Text style={styles.recordText}>{item.username || "Unnamed Record"}</Text>
          <Text style={styles.recordPhoneNumber}>{item.phoneNumber || "No phone number"}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#1a0b4d', '#3a1c96', '#6a3bb5', '#9a5fd9']}
        style={styles.container}
      >
        <View style={styles.scrollContainer}>
          <View style={styles.profileHeader}>
            <Text style={styles.username}>Customer Records</Text>
          </View>

          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>Total Records: {records.length}</Text>
          </View>

          <View style={styles.searchBox}>
            <MaterialCommunityIcons name="magnify" size={24} color="white" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search records by name or phone"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.recordScrollBox}>
            <FlatList
              data={filteredRecords}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderRecordItem}
              ListEmptyComponent={<Text style={styles.emptyText}>No records found.</Text>}
              showsVerticalScrollIndicator={true}
            />
          </View>

          <TouchableOpacity
            style={styles.newRecordButton}
            onPress={() => {
              Haptics.selectionAsync();
              navigation.navigate("ManualMeasurementForm");
            }}
          >
            <Text style={styles.newRecordText}>+ New Record</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#1a0b4d" },
  container: { flex: 1 },
  scrollContainer: { flex: 1, padding: 24, paddingTop: 40 },
  profileHeader: { alignItems: 'center', marginBottom: 20 },
  username: { fontSize: 28, fontWeight: '700', color: 'white' },
  statsContainer: {
    marginBottom: 10,
    alignItems: 'center',
  },
  statsText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    opacity: 0.8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginVertical: 15
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: 'white',
    fontSize: 16,
    marginLeft: 8
  },
  recordScrollBox: {
    maxHeight: 400,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
  },
  recordItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    marginBottom: 12
  },
  recordContent: { flexDirection: 'row', alignItems: 'center' },
  recordIcon: { marginRight: 15 },
  recordTextContainer: { flex: 1 },
  recordText: { fontSize: 18, color: 'white', fontWeight: '600' },
  recordPhoneNumber: { fontSize: 14, color: 'rgba(255,255,255,0.7)' },
  emptyText: {
    textAlign: 'center',
    color: 'white',
    marginTop: 20,
    fontSize: 16
  },
  newRecordButton: {
    backgroundColor: '#6a11cb',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  newRecordText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
