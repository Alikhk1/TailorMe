import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  StatusBar,
} from 'react-native';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { getAuth } from 'firebase/auth';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function AddOrderScreen({ route, navigation }) {
  const { customerPhone, customerName } = route.params;
  const auth = getAuth();
  const user = auth.currentUser;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fabricType, setFabricType] = useState('');
  const [style, setStyle] = useState('');
  const [price, setPrice] = useState('');
  const [orderStatus, setOrderStatus] = useState('In-Progress');

  const [orderDate, setOrderDate] = useState(new Date());
  const [deliveryDate, setDeliveryDate] = useState(new Date());
  const [showOrderDatePicker, setShowOrderDatePicker] = useState(false);
  const [showDeliveryDatePicker, setShowDeliveryDatePicker] = useState(false);

  const handleAddOrder = async () => {
    // Validate required fields
    if (!title || !price) {
      Alert.alert('Error', 'Please fill all required fields.');
      return;
    }

    // Validate delivery date is not before order date
    if (deliveryDate < orderDate) {
      Alert.alert(
        'Invalid Date', 
        'Delivery date cannot be before order date. Please select a valid date.'
      );
      return;
    }

    try {
      const orderData = {
        title,
        description,
        fabricType,
        style,
        price: parseFloat(price),
        orderStatus,
        orderDate: orderDate.toISOString().split('T')[0],      // 'YYYY-MM-DD'
        deliveryDate: deliveryDate.toISOString().split('T')[0], // 'YYYY-MM-DD'
        userId: customerPhone,      // customerId is userId (customer's UID or phone)
        name: customerName,
        tailorId: user.uid,         // **Add tailorId as current user's uid**
      };

      await addDoc(collection(db, 'orders'), orderData);
      Alert.alert('Success', 'Order added successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error adding order:', error);
      Alert.alert('Error', 'Failed to add order.');
    }
  };

  const handleDeliveryDateChange = (event, selectedDate) => {
    setShowDeliveryDatePicker(false);
    if (selectedDate) {
      // Ensure delivery date is not before order date
      if (selectedDate < orderDate) {
        Alert.alert(
          'Invalid Date', 
          'Delivery date cannot be before order date. Please select a valid date.'
        );
      } else {
        setDeliveryDate(selectedDate);
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f3e5f5' }} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor="#f3e5f5" barStyle="dark-content" />
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#4a148c" />
          </TouchableOpacity>
          <Text style={styles.title}>Add New Order</Text>
          <View style={styles.headerSpacer} />
        </View>

        <Text style={styles.label}>Title</Text>
        <TextInput
          placeholder="Title *"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />

        <Text style={styles.label}>Description / Notes</Text>
        <TextInput
          placeholder="Description / Notes"
          value={description}
          onChangeText={setDescription}
          style={[styles.input, styles.textArea]}
          multiline
        />

        <Text style={styles.label}>Fabric Type</Text>
        <TextInput
          placeholder="Fabric Type"
          value={fabricType}
          onChangeText={setFabricType}
          style={styles.input}
        />

        <Text style={styles.label}>Style</Text>
        <TextInput
          placeholder="Style"
          value={style}
          onChangeText={setStyle}
          style={styles.input}
        />

        <Text style={styles.label}>Price (PKR)</Text>
        <TextInput
          placeholder="Price (PKR) *"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          style={styles.input}
        />

        <TouchableOpacity onPress={() => setShowOrderDatePicker(true)} style={styles.dateButton}>
          <Text style={styles.dateButtonText}>
            Select Order Date: {orderDate.toDateString()}
          </Text>
        </TouchableOpacity>
        {showOrderDatePicker && (
          <DateTimePicker
            value={orderDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowOrderDatePicker(false);
              if (selectedDate) {
                setOrderDate(selectedDate);
                // If new order date is after current delivery date, reset delivery date
                if (selectedDate > deliveryDate) {
                  setDeliveryDate(selectedDate);
                }
              }
            }}
          />
        )}

        <TouchableOpacity onPress={() => setShowDeliveryDatePicker(true)} style={styles.dateButton}>
          <Text style={styles.dateButtonText}>
            Select Delivery Date: {deliveryDate.toDateString()}
          </Text>
        </TouchableOpacity>
        {showDeliveryDatePicker && (
          <DateTimePicker
            value={deliveryDate}
            mode="date"
            display="default"
            minimumDate={orderDate} // Set minimum date to order date
            onChange={handleDeliveryDateChange}
          />
        )}

        <TouchableOpacity onPress={handleAddOrder} style={styles.submitButton}>
          <Text style={styles.submitButtonText}>Add Order</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f3e5f5',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    width: '100%',
  },
  backButton: {
    padding: 5,
  },
  headerSpacer: {
    width: 24, // To balance the back button on the left
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4a148c',
    textAlign: 'center',
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: '#4a148c',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    backgroundColor: '#e1bee7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  dateButtonText: {
    color: '#4a148c',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#4a148c',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});