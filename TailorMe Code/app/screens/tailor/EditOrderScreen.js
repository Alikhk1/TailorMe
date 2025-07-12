import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { db } from '../../../firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

const EditOrderScreen = ({ route, navigation }) => {
  const { order } = route.params;
  
  // State for editable fields only
  const [formData, setFormData] = useState({
    title: order.title || '',
    price: order.price ? order.price.toString() : '',
    fabricType: order.fabricType || '',
    style: order.style || '',
    description: order.description || ''
  });
  
  // State for date pickers
  const [orderDate, setOrderDate] = useState(new Date(order.orderDate));
  const [deliveryDate, setDeliveryDate] = useState(new Date(order.deliveryDate));
  const [showOrderDatePicker, setShowOrderDatePicker] = useState(false);
  const [showDeliveryDatePicker, setShowDeliveryDatePicker] = useState(false);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (event, selectedDate, dateType) => {
    const currentDate = selectedDate || (dateType === 'order' ? orderDate : deliveryDate);
    if (dateType === 'order') {
      setOrderDate(currentDate);
      setShowOrderDatePicker(Platform.OS === 'ios');
    } else {
      setDeliveryDate(currentDate);
      setShowDeliveryDatePicker(Platform.OS === 'ios');
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Validation Error', 'Please enter an order title');
      return false;
    }
    if (!formData.price || isNaN(formData.price)) {
      Alert.alert('Validation Error', 'Please enter a valid price');
      return false;
    }
    if (deliveryDate < orderDate) {
      Alert.alert('Validation Error', 'Delivery date cannot be before order date');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    Haptics.selectionAsync();
    
    if (!validateForm()) return;

    try {
      const orderRef = doc(db, 'orders', order.id);
      await updateDoc(orderRef, {
        title: formData.title,
        price: Number(formData.price),
        fabricType: formData.fabricType,
        style: formData.style,
        description: formData.description,
        orderDate: orderDate.toISOString(),
        deliveryDate: deliveryDate.toISOString()
        // Note: orderStatus is intentionally not updated here
      });

      Alert.alert('Success', 'Order updated successfully');
      navigation.goBack()
    } catch (error) {
      console.error('Error updating order:', error);
      Alert.alert('Error', 'Failed to update order');
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <LinearGradient
      colors={['#1a0b4d', '#3a1c96', '#6a3bb5', '#9a5fd9']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Edit Order</Text>
            <Text style={styles.orderStatus}>
              Status: {order.orderStatus === 'Completed' ? '✅ Completed' : '🛠 In Progress'}
            </Text>
          </View>
          <View style={styles.headerRightSpacer} />
        </View>

        {/* Basic Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <InputField
            label="Order Title"
            value={formData.title}
            onChangeText={(text) => handleChange('title', text)}
            placeholder="e.g. Summer Dress"
          />
          
          <InputField
            label="Price (Rs.)"
            value={formData.price}
            onChangeText={(text) => handleChange('price', text.replace(/[^0-9]/g, ''))}
            placeholder="1000"
            keyboardType="numeric"
          />
        </View>

        {/* Dates Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dates</Text>
          
          <TouchableOpacity 
            style={styles.dateInput} 
            onPress={() => setShowOrderDatePicker(true)}
          >
            <Text style={styles.dateInputText}>
              {formatDate(orderDate)}
            </Text>
            <Ionicons name="calendar" size={20} color="#6a11cb" />
          </TouchableOpacity>
          <Text style={styles.dateLabel}>Order Date</Text>

          {showOrderDatePicker && (
            <DateTimePicker
              value={orderDate}
              mode="date"
              display="default"
              onChange={(event, date) => handleDateChange(event, date, 'order')}
            />
          )}

          <TouchableOpacity 
            style={styles.dateInput} 
            onPress={() => setShowDeliveryDatePicker(true)}
          >
            <Text style={styles.dateInputText}>
              {formatDate(deliveryDate)}
            </Text>
            <Ionicons name="calendar" size={20} color="#6a11cb" />
          </TouchableOpacity>
          <Text style={styles.dateLabel}>Delivery Date</Text>

          {showDeliveryDatePicker && (
            <DateTimePicker
              value={deliveryDate}
              mode="date"
              display="default"
              onChange={(event, date) => handleDateChange(event, date, 'delivery')}
              minimumDate={orderDate}
            />
          )}
        </View>

        {/* Order Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Details</Text>
          
          <InputField
            label="Fabric Type"
            value={formData.fabricType}
            onChangeText={(text) => handleChange('fabricType', text)}
            placeholder="e.g. Cotton, Silk"
          />
          
          <InputField
            label="Style"
            value={formData.style}
            onChangeText={(text) => handleChange('style', text)}
            placeholder="e.g. Casual, Formal"
          />
          
          <InputField
            label="Description"
            value={formData.description}
            onChangeText={(text) => handleChange('description', text)}
            placeholder="Additional details"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSubmit}
          >
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const InputField = ({ label, value, onChangeText, placeholder, ...props }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="rgba(255,255,255,0.5)"
      {...props}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 5,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  orderStatus: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    marginTop: 5,
  },
  headerRightSpacer: {
    width: 24, // To balance the back button on the left
  },
  section: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
    paddingBottom: 8,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    padding: 12,
    color: 'white',
    fontSize: 16,
  },
  dateInput: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  dateInputText: {
    color: 'white',
    fontSize: 16,
  },
  dateLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#6a11cb',
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default EditOrderScreen;