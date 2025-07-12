import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  collection,
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { getAuth } from "firebase/auth";
import { LinearGradient } from "expo-linear-gradient";
import { Animated } from "react-native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";

export default function CustomerRecordDetails({ route }) {
  const { record } = route.params;
  const navigation = useNavigation();
  const auth = getAuth();
  const user = auth.currentUser;

  const [currentRecord, setCurrentRecord] = useState(record);
  const [orders, setOrders] = useState([]);

  // Animation values
const buttonScale = new Animated.Value(1);
const cardOpacity = new Animated.Value(1);
const cardTranslateY = new Animated.Value(0);

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
  

  // Format date to DD-MM-YYYY
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}-${month}-${year}`;
  };

 // Sort orders: In-Progress first, then by delivery date
const sortedOrders = [...orders].sort((a, b) => {
  // First sort by orderStatus (In-Progress comes first)
  if (a.orderStatus === "In-Progress" && b.orderStatus !== "In-Progress") return -1;
  if (a.orderStatus !== "In-Progress" && b.orderStatus === "In-Progress") return 1;
  
  // Then sort by delivery date (earliest first)
  const dateA = new Date(a.deliveryDate);
  const dateB = new Date(b.deliveryDate);
  return dateA - dateB;
});


// Calculate order statistics
const totalOrders = orders.length;
const completedOrders = orders.filter(order => order.orderStatus === "Completed").length;
const inProgressOrders = totalOrders - completedOrders;

  // Listen for updates on the user records
  useEffect(() => {
    const recordRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(recordRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const recordsObj = userData.records || {};
        const recordsArray = Object.values(recordsObj);
        const updatedRecord = recordsArray.find(
          (rec) => rec.username === record.username
        );
        setCurrentRecord(updatedRecord || record);
      }
    });

    return () => unsubscribe();
  }, [user.uid, record.username]);

  // Fetch orders related to the current record's phone number
  useEffect(() => {
    if (!currentRecord?.phoneNumber) return;

    const ordersQuery = query(
      collection(db, "orders"),
      where("userId", "==", currentRecord.phoneNumber)
    );

// Modify the ordersList processing in your Firestore query:
const unsubscribeOrders = onSnapshot(
  ordersQuery,
  (querySnapshot) => {
    const ordersList = [];
    querySnapshot.forEach((doc) => {
      ordersList.push({ 
        id: doc.id, 
        ...doc.data()
        // Remove the default status assignment since it should come from Firestore
      });
    });
    setOrders(ordersList);
  },
  (error) => {
    console.error("Error fetching orders: ", error);
  }
);

    return () => unsubscribeOrders();
  }, [currentRecord?.phoneNumber]);

  const handleShareMeasurements = async () => {
    if (!currentRecord) return;

    const measurementsText = `Measurements:
---------------------------------------------
Username: ${currentRecord.username}
Arm: ${currentRecord.armLength} Inches
Shoulder: ${currentRecord.shoulderWidth} Inches
Chest: ${currentRecord.chest} Inches
Waist: ${currentRecord.waist} Inches
Hip: ${currentRecord.hip} Inches
Neck: ${currentRecord.neck} Inches
Shalwar Length: ${currentRecord.shalwarLength} Inches
Qameez Length: ${currentRecord.qameezLength} Inches
Recommended Size: ${currentRecord.recommendedSize}
---------------------------------------------`;

    try {
      await Share.share({
        message: measurementsText,
      });
    } catch (error) {
      console.error("Error sharing measurements:", error);
    }
  };

const toggleOrderStatus = async (orderId, currentStatus) => {
  try {
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
      orderStatus: currentStatus === "In-Progress" ? "Completed" : "In-Progress"
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    Alert.alert("Error", "Failed to update order status");
  }
};

  const handleDeleteRecord = async () => {
    Alert.alert(
      "Delete Record",
      "Are you sure you want to delete this record?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              const userRef = doc(db, "users", user.uid);
              const userSnapshot = await getDoc(userRef);

              if (!userSnapshot.exists()) {
                console.log("No such user!");
                return;
              }

              const userData = userSnapshot.data();
              const records = userData.records || [];

              const recordIndex = records.findIndex(
                (rec) => rec.username === currentRecord.username
              );

              if (recordIndex === -1) {
                throw new Error("No matching record found");
              }

              records.splice(recordIndex, 1);
              await updateDoc(userRef, { records });

              Alert.alert("Success", "Record deleted successfully!", [
                { text: "OK", onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              console.error("Error deleting record:", error);
              Alert.alert("Error", "There was an error deleting the record.");
            }
          },
        },
      ]
    );
  };

  return (
    <LinearGradient colors={["#f3e5f5", "#e1bee7"]} style={styles.gradientContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer} nestedScrollEnabled={true}>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Measurement Details</Text>

          <View style={styles.measurementDetailsContainer}>
            {[
              ["Username", currentRecord.username],
              ["Phone Number", currentRecord.phoneNumber],
              ["Arm Length", `${currentRecord.armLength} Inches`],
              ["Shoulder Width", `${currentRecord.shoulderWidth} Inches`],
              ["Chest", `${currentRecord.chest} Inches`],
              ["Waist", `${currentRecord.waist} Inches`],
              ["Hip", `${currentRecord.hip} Inches`],
              ["Neck Size", `${currentRecord.neck} Inches`],
              ["Shalwar Length", `${currentRecord.shalwarLength} Inches`],
              ["Qameez Length", `${currentRecord.qameezLength} Inches`],
              ["RecommendedSize", currentRecord.recommendedSize],
            ].map(([label, value], idx) => (
              <LinearGradient
                key={idx}
                colors={["#ffffff", "#f5f5f5"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.measurementBox}
              >
                <View style={styles.row}>
                  <Text style={styles.resultLabel}>{label}:</Text>
                  <Text style={styles.resultValue}>{value}</Text>
                </View>
              </LinearGradient>
            ))}
          </View>

          <View style={styles.topButtonRow}>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShareMeasurements}
            >
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.editButton}
              onPress={() =>
                navigation.navigate("EditUserRecord", { record: currentRecord })
              }
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

<View style={{borderBottomWidth: 1, marginBottom: 20, marginTop: 10, borderColor: 'purple',}}>
  
</View>
<View style={styles.ordersPlaceholder}>
  <Text style={styles.ordersHeading}>CUSTOMER ORDERS</Text>

  {/* Order Statistics */}
      <View style={styles.orderStatsContainer}>
      <View style={{flexDirection: 'row'}}>
        <Text style={styles.orderStatText}>Total Orders: </Text>
        <Text style={{backgroundColor:'yellow', fontWeight:'bold', fontSize: 14}}>{totalOrders}</Text>
      </View>
      <View style={{flexDirection: 'row'}}>
        <Text style={styles.orderStatText}>Completed: </Text>
        <Text style={{backgroundColor:'#c4ff94', fontWeight:'bold', fontSize: 14}}>{completedOrders}</Text>
      </View>
      <View style={{flexDirection: 'row'}}>
        <Text style={styles.orderStatText}>In-Progress: </Text>
        <Text style={{backgroundColor:'#ff0d0d', color:'white', fontWeight: 'bold', fontSize: 14}}>{inProgressOrders}</Text>
      </View>
      </View>

  {orders.length === 0 ? (
    <View style={styles.ordersBox}>
      <Text style={styles.placeholderText}>No orders found</Text>
    </View>
  ) : (
    <View style={{ maxHeight: 450, marginBottom: 20 }}>
        <ScrollView nestedScrollEnabled={true}>
          {sortedOrders.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={[
                styles.orderItem,
                order.orderStatus === "In-Progress"
                  ? styles.inProgressOrder
                  : styles.completedOrder,
              ]}
              onPress={() =>
                navigation.navigate("OrderDetailsScreen", { order })
              }
            >
              <Text style={styles.orderTitle}>{order.title}</Text>

              <View style={styles.orderDetailsRow}>
                <Text style={styles.orderDetailText}>
                  Order Date: {formatDate(order.orderDate)}
                </Text>
                <Text style={styles.orderDetailText}>
                  Delivery: {formatDate(order.deliveryDate)}
                </Text>
              </View>

              <View style={styles.orderDetailsRow}>
                <Text style={styles.orderDetailText}>
                  Price: Rs.{order.price || "0"}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    order.orderStatus === "Completed"
                      ? styles.completedButton
                      : styles.inProgressButton,
                  ]}
                  onPress={() => toggleOrderStatus(order.id, order.orderStatus)}
                  >
                  <Text style={styles.statusButtonText}>{order.orderStatus}</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
    </View>

  )}


          
            <Animated.View style={[{ opacity: cardOpacity, transform: [{ translateY: cardTranslateY }], marginTop: 15 }]}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPressIn={animatePressIn}
                onPressOut={animatePressOut}
                onPress={() => navigation.navigate("AddOrderScreen", {
                  customerPhone: currentRecord.phoneNumber,
                  customerName: currentRecord.username
                })}
                style={styles.newOrderCard}
              >
            <Animated.View style={[styles.cardContent, { transform: [{ scale: buttonScale }] }]}>
                  <View style={styles.cardIcon}>
                    <FontAwesome5 name="plus" size={15} color="white" />
                  </View>
                  <View style={styles.cardText}>
                    <Text style={styles.cardTitle}>New Order</Text>
                    <Text style={styles.cardDescription}>Create a new order for this customer</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="rgb(252, 248, 249)" />
                </Animated.View>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Bottom buttons */}
          <View style={styles.bottomButtonContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteRecord}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4a148c",
    marginBottom: 15,
    textAlign: "center",
    marginTop: 20
  },
  measurementDetailsContainer: {
    marginTop: 20,
    paddingBottom: 5,
  },
  measurementBox: {
    borderRadius: 8,
    marginBottom: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4a148c",
  },
  resultValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  topButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
    marginBottom: 20,
  },
  shareButton: {
    flex: 1,
    backgroundColor: "#28a745",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 10,
  },
  editButton: {
    flex: 1,
    backgroundColor: "#ffc107",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 10,
  },
  shareButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  editButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "bold",
  },
  ordersPlaceholder: {
    marginVertical: 20,
  },
  ordersHeading: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#4a148c",
    marginBottom: 10,
    textAlign: "center",
    textTransform: "uppercase",
    marginBottom: 15
  },
  orderStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#f3e5f5",
    borderRadius: 8,
    alignItems: "center"
    
  },
  orderStatText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4a148c",
  },
  ordersBox: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 8,
    padding: 15,
    backgroundColor: "white",
  },
  placeholderText: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#555",
    textAlign: "center",
  },
  orderItem: {
    backgroundColor: "#f3e5f5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  inProgressOrder: {
    borderColor: "#d32f2f",
  },
  completedOrder: {
    borderColor: "#28a745",
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4a148c",
    marginBottom: 5,
  },
  orderDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  orderDetailText: {
    fontSize: 14,
    color: "#333",
  },
  statusButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 100,
    alignItems: "center",
  },
  inProgressButton: {
    backgroundColor: "#d32f2f",
  },
  completedButton: {
    backgroundColor: "#28a745",
  },
  statusButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  bottomButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
  },
  backButton: {
    flex: 1,
    backgroundColor: "#6a1b9a",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 10,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "#d32f2f",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 10,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  newOrderCard: {
  backgroundColor: 'rgb(85, 18, 68)',
  borderRadius: 12,
  padding: 16,
  marginBottom: 15,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 3,
  height: 85
},
cardContent: {
  flexDirection: 'row',
  alignItems: 'center',
},
cardIcon: {
  width: 44,
  height: 44,
  borderRadius: 22,
  backgroundColor: 'rgba(255,255,255,0.2)',
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 16,
},
cardText: {
  flex: 1,
},
cardTitle: {
  color: 'white',
  fontSize: 16,
  fontWeight: 'bold',
  marginBottom: 2,
},
cardDescription: {
  color: 'rgba(255,255,255,0.8)',
  fontSize: 13,
},
});