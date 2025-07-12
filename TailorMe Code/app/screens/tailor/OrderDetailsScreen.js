import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
  Platform,
  StatusBar
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { db } from '../../../firebaseConfig';
import { doc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

export default function OrderDetailsScreen({ route, navigation }) {
  const { order } = route.params;
  const [orderData, setOrderData] = useState(order);
  const [currentStatus, setCurrentStatus] = useState(order.orderStatus);

  useEffect(() => {
    const orderRef = doc(db, 'orders', order.id);
    const unsubscribe = onSnapshot(orderRef, (docSnap) => {
      if (docSnap.exists()) {
        const updatedData = docSnap.data();
        setOrderData({ ...updatedData, id: docSnap.id });
        setCurrentStatus(updatedData.orderStatus);
      } else {
        Alert.alert('Notice', 'This order was deleted.');
        navigation.goBack();
      }
    });

    return () => unsubscribe();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleShare = async () => {
    try {
      Haptics.selectionAsync();
      const shareContent = `
        Order Details:
        Title: ${orderData.title}
        Customer: ${orderData.name}
        Phone: ${orderData.userId}
        Status: ${currentStatus}
        Price: Rs. ${orderData.price}
        Order Date: ${formatDate(orderData.orderDate)}
        Delivery Date: ${formatDate(orderData.deliveryDate)}
        Fabric: ${orderData.fabricType}
        Style: ${orderData.style}
        Description: ${orderData.description}
      `;
      await Share.share({
        message: shareContent,
        title: 'Order Details'
      });
    } catch (error) {
      console.error('Error sharing:', error.message);
    }
  };

  const handleEdit = () => {
    Haptics.selectionAsync();
    navigation.navigate('EditOrderScreen', {
      order: orderData,
      updateOrderData: (updatedOrder) => {
        setOrderData(updatedOrder);
        setCurrentStatus(updatedOrder.orderStatus);
      }
    });
  };

  const handleStatusChange = async (newStatus) => {
    Haptics.selectionAsync();
    try {
      const orderRef = doc(db, 'orders', orderData.id);
      await updateDoc(orderRef, {
        orderStatus: newStatus
      });
      Alert.alert('Success', `Order marked as ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  const handleDelete = () => {
    Haptics.selectionAsync();
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this order?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const orderRef = doc(db, 'orders', orderData.id);
              await deleteDoc(orderRef);
              Alert.alert('Success', 'Order deleted successfully');
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting order:', error);
              Alert.alert('Error', 'Failed to delete order');
            }
          }
        }
      ]
    );
  };

  const navigateToCustomerDetails = () => {
    Haptics.selectionAsync();
    navigation.navigate('CustomerRecordDetails', {
      record: {
        phoneNumber: orderData.userId,
        username: orderData.name
      }
    });
  };

  return (
    <LinearGradient
      colors={['#1a0b4d', '#3a1c96', '#6a3bb5', '#9a5fd9']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      


      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >

              {/* Fixed Back Button */}
        <View style={styles.fixedBackButton}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {orderData.title || 'Untitled Order'}
          </Text>
          <TouchableOpacity
            style={[
              styles.statusBadge,
              currentStatus === 'Completed' ? styles.completedBadge : styles.inProgressBadge
            ]}
            onPress={() =>
              handleStatusChange(currentStatus === 'Completed' ? 'In-Progress' : 'Completed')
            }
          >
            <Text style={styles.statusText}>
              {currentStatus === 'Completed' ? '✅ Completed' : '🛠 In Progress'}
            </Text>
            <MaterialIcons name="edit" size={16} color="white" style={styles.editStatusIcon} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <TouchableOpacity 
            style={styles.clickableRow} 
            onPress={navigateToCustomerDetails}
            activeOpacity={0.7}
          >
            <DetailRow 
              icon="person" 
              label="Name" 
              value={orderData.name} 
              isClickable={true} 
            />
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color="rgba(255,255,255,0.7)" 
              style={styles.arrowIcon}
            />
          </TouchableOpacity>
          <DetailRow icon="call" label="Phone" value={orderData.userId} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Details</Text>
          <DetailRow icon="calendar" label="Order Date" value={formatDate(orderData.orderDate)} />
          <DetailRow icon="time" label="Delivery Date" value={formatDate(orderData.deliveryDate)} />
          <DetailRow icon="cash" label="Price" value={`Rs. ${orderData.price}`} />
          <DetailRow icon="color-palette" label="Fabric Type" value={orderData.fabricType} />
          <DetailRow icon="brush" label="Style" value={orderData.style} />
          <DetailRow icon="document-text" label="Description" value={orderData.description} />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Ionicons name="create" size={20} color="white" />
            <Text style={styles.buttonText}>Edit Order</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-social" size={20} color="white" />
            <Text style={styles.buttonText}>Share Details</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Ionicons name="trash" size={20} color="rgb(238, 160, 160)" />
          <Text style={styles.deleteButtonText}>Delete Order</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const DetailRow = ({ icon, label, value, isClickable = false }) => (
  <View style={styles.detailRow}>
    <View style={styles.iconContainer}>
      <Ionicons name={icon} size={18} color="#6a11cb" />
    </View>
    <View style={styles.detailTextContainer}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, isClickable && styles.clickableValue]}>
        {value || 'Not specified'}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  fixedBackButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight + 10,
    left: 20,
    zIndex: 100,
    marginBottom: 50
  },
  scrollContainer: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight + 40,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  completedBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  inProgressBadge: {
    backgroundColor: 'rgba(244, 67, 54, 0.3)',
    borderColor: '#F44336',
    borderWidth: 1,
  },
  statusText: {
    color: 'white',
    fontWeight: '600',
  },
  editStatusIcon: {
    marginLeft: 5,
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
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginBottom: 2,
  },
  detailValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#6a11cb',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#3a1c96',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    margin: 10,
    marginTop: 20,
    marginHorizontal: 30,
    backgroundColor: 'rgba(244, 67, 54, 0.3)',
    borderColor: '#F44336',
    borderWidth: 1,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  clickableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  arrowIcon: {
    marginLeft: -50,
  },
  clickableValue: {
    color: '#d4b5ff',
    fontWeight: '600',
  },
});