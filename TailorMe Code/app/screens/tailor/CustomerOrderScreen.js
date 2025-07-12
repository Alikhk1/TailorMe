import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Modal,
  ActivityIndicator
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { db } from "../../../firebaseConfig";
import { collection, query, where, onSnapshot, doc } from "firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../AuthContext";
import * as Haptics from "expo-haptics";

export default function CustomerOrderScreen() {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  
  // Customer modal states
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [searchCustomerQuery, setSearchCustomerQuery] = useState("");
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);

  // Fetch orders
  useEffect(() => {
    if (!user) return;
    
    const ordersQuery = query(
      collection(db, "orders"),
      where("tailorId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(ordersQuery, (querySnapshot) => {
      const ordersList = [];
      querySnapshot.forEach((doc) => {
        ordersList.push({ id: doc.id, ...doc.data() });
      });
      // Sort orders
      ordersList.sort((a, b) => {
        if (a.orderStatus === "In-Progress" && b.orderStatus !== "In-Progress") return -1;
        if (a.orderStatus !== "In-Progress" && b.orderStatus === "In-Progress") return 1;
        return new Date(a.deliveryDate) - new Date(b.deliveryDate);
      });
      setOrders(ordersList);
    });

    return () => unsubscribe();
  }, [user]);

  // Fetch customers when modal opens
  useEffect(() => {
    if (!user || !showCustomerModal) return;
    
    setIsLoadingCustomers(true);
    const userDocRef = doc(db, "users", user.uid);

    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const records = data.records || [];
        
        // Extract unique customers
        const customerMap = {};
        records.forEach((record) => {
          if (record.phoneNumber && !customerMap[record.phoneNumber]) {
            customerMap[record.phoneNumber] = {
              username: record.username || "Unnamed Customer",
              phoneNumber: record.phoneNumber
            };
          }
        });
        
        setCustomers(Object.values(customerMap));
      }
      setIsLoadingCustomers(false);
    }, (error) => {
      console.error("Error fetching customers:", error);
      setIsLoadingCustomers(false);
    });

    return () => unsubscribe();
  }, [user, showCustomerModal]);

  // Filter orders
  useEffect(() => {
    const filtered = orders.filter((order) => {
      const matchesSearch =
        (order.name && order.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (order.userId && order.userId.includes(searchQuery)) ||
        (order.title && order.title.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus =
        statusFilter === "All" || order.orderStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
    setFilteredOrders(filtered);
  }, [searchQuery, orders, statusFilter]);

  const getStatusCount = (status) => {
    return orders.filter((order) => order.orderStatus === status).length;
  };

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.orderItem}
      onPress={() => {
        Haptics.selectionAsync();
        navigation.navigate("OrderDetailsScreen", { order: item });
      }}
    >
      <View style={styles.orderContent}>
        <View style={[
          styles.statusIndicator,
          { backgroundColor: item.orderStatus === "Completed" ? "#4CAF50" : "#F44336" }
        ]} />
        <View style={styles.orderTextContainer}>
          <Text style={styles.orderTitle}>{item.title || "Untitled Order"}</Text>
          <Text style={styles.orderCustomer}>{item.name || "No customer name"}</Text>
          <Text style={styles.orderDetails}>
            {item.price ? `Rs. ${item.price}` : "No price"} • {item.orderStatus} •{" "}
            Delivery Date: {new Date(item.deliveryDate).toLocaleDateString()}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#1a0b4d", "#3a1c96", "#6a3bb5", "#9a5fd9"]}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.outerScrollContainer}
          nestedScrollEnabled={true}
        >
          <View style={styles.contentContainer}>
            <View style={styles.profileHeader}>
              <Text style={styles.username}>Customer Orders</Text>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total:</Text>
                <Text style={styles.statValue}>{orders.length}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Completed:</Text>
                <Text style={[styles.statValue, { color: "#4CAF50" }]}>
                  {getStatusCount("Completed")}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>In Progress:</Text>
                <Text style={[styles.statValue, { color: "#F44336" }]}>
                  {getStatusCount("In-Progress")}
                </Text>
              </View>
            </View>

            <View style={styles.searchBox}>
              <MaterialCommunityIcons name="magnify" size={24} color="white" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name, phone, or title"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.filterContainer}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  statusFilter === "All" && styles.activeFilter,
                ]}
                onPress={() => setStatusFilter("All")}
              >
                <Text style={styles.filterText}>All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  statusFilter === "In-Progress" && styles.activeFilter,
                ]}
                onPress={() => setStatusFilter("In-Progress")}
              >
                <Text style={styles.filterText}>In Progress</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  statusFilter === "Completed" && styles.activeFilter,
                ]}
                onPress={() => setStatusFilter("Completed")}
              >
                <Text style={styles.filterText}>Completed</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.orderScrollBox}
              nestedScrollEnabled={true}
              contentContainerStyle={styles.orderScrollContent}
            >
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <TouchableOpacity
                    key={order.id}
                    style={[
                      styles.orderItem,
                      order.orderStatus === "In-Progress" 
                        ? styles.inProgressOrder 
                        : styles.completedOrder,
                    ]}
                    onPress={() => navigation.navigate("OrderDetailsScreen", { order })}
                  >
                    <View style={styles.orderContent}>
                      <View style={[
                        styles.statusIndicator,
                        { backgroundColor: order.orderStatus === "Completed" ? "#4CAF50" : "#F44336" }
                      ]} />
                      <View style={styles.orderTextContainer}>
                        <Text style={styles.orderTitle}>{order.title || "Untitled Order"}</Text>
                        <Text style={styles.orderCustomer}>{order.name || "No customer name"}</Text>
                        <Text style={styles.orderDetails}>
                          {order.price ? `Rs. ${order.price}` : "No price"} • {order.orderStatus} •{" "}
                          Delivery Date: {new Date(order.deliveryDate).toLocaleDateString()}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#999" />
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.emptyText}>No orders found.</Text>
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.newOrderButton}
              onPress={() => {
                Haptics.selectionAsync();
                setShowCustomerModal(true);
              }}
            >
              <Text style={styles.newOrderText}>+ New Order</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Customer Selection Modal */}
        <Modal
          visible={showCustomerModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowCustomerModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Select Customer</Text>
              
              <View style={styles.searchBox}>
                <MaterialCommunityIcons name="magnify" size={20} color="white" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search customers..."
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={searchCustomerQuery}
                  onChangeText={setSearchCustomerQuery}
                />
              </View>

              {isLoadingCustomers ? (
                <ActivityIndicator size="large" color="white" style={styles.loadingIndicator} />
              ) : (
                <FlatList
                  data={customers.filter(customer => {
                    const query = searchCustomerQuery.toLowerCase();
                    return (
                      customer.username?.toLowerCase().includes(query)) ||
                      customer.phoneNumber?.includes(searchCustomerQuery)})}
                  
                  keyExtractor={(item) => item.phoneNumber}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.customerItem}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setShowCustomerModal(false);
                        navigation.navigate("AddOrderScreen", {
                          customerPhone: item.phoneNumber,
                          customerName: item.username
                        });
                      }}
                    >
                      <View style={styles.customerContent}>
                        <View style={styles.customerIcon}>
                          <Ionicons name="person" size={20} color="#6a11cb" />
                        </View>
                        <View style={styles.customerTextContainer}>
                          <Text style={styles.customerName} numberOfLines={1}>
                            {item.username}
                          </Text>
                          <Text style={styles.customerPhone} numberOfLines={1}>
                            {item.phoneNumber}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    <Text style={styles.emptyText}>
                      {searchCustomerQuery ? "No matching customers" : "No customers found"}
                    </Text>
                  }
                  contentContainerStyle={styles.customerListContent}
                />
              )}

              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowCustomerModal(false)}
              >
                <Text style={styles.modalCloseText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#1a0b4d" },
  container: { flex: 1 },
  outerScrollContainer: {
    flexGrow: 1,
  },
  contentContainer: {
    padding: 24,
    paddingTop: 40,
    paddingBottom: 40
  },
  profileHeader: { alignItems: "center", marginBottom: 20 },
  username: { fontSize: 28, fontWeight: "700", color: "white" },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
  },
  statItem: { alignItems: "center" },
  statLabel: { fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: "bold", color: "white" },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: "white",
    fontSize: 16,
    marginLeft: 8,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  activeFilter: { backgroundColor: "rgba(106, 27, 203, 0.8)" },
  filterText: { color: "white", fontSize: 14 },
  orderScrollBox: {
    maxHeight: 400,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 20,
  },
  orderScrollContent: {
    paddingBottom: 20
  },
  orderItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    marginBottom: 10,
  },
  inProgressOrder: { borderColor: "#d32f2f", borderWidth: 1 },
  completedOrder: { borderColor: "#28a745", borderWidth: 1 },
  orderContent: { flexDirection: "row", alignItems: "center" },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  orderTextContainer: { flex: 1 },
  orderTitle: { fontSize: 16, fontWeight: "600", color: "white", marginBottom: 2 },
  orderCustomer: { fontSize: 14, color: "rgba(255,255,255,0.8)", marginBottom: 4 },
  orderDetails: { fontSize: 12, color: "rgba(255,255,255,0.6)" },
  emptyText: { textAlign: "center", color: "white", marginTop: 20, fontSize: 16 },
  newOrderButton: {
    backgroundColor: "#6a11cb",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    marginTop: 10,
    marginBottom: 20
  },
  newOrderText: { color: "white", fontSize: 16, fontWeight: "700" },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContainer: {
    backgroundColor: '#2a1263',
    borderRadius: 15,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  customerItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    marginBottom: 10,
  },
  customerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerIcon: {
    marginRight: 12,
  },
  customerTextContainer: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  customerPhone: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  modalCloseButton: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#6a11cb',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseText: {
    color: 'white',
    fontWeight: 'bold',
  },
  customerListContent: {
    paddingBottom: 10,
  },
  loadingIndicator: {
    marginVertical: 30,
  },
});