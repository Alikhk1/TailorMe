import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { db } from "../../../firebaseConfig";
import { collection, query, where, onSnapshot, doc } from "firebase/firestore";
import { AuthContext } from "../../AuthContext";
import * as Haptics from "expo-haptics";
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function StatisticsScreen() {
  const { user } = useContext(AuthContext);
  const navigation = useNavigation(); // Added navigation hook
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [completedOrders, setCompletedOrders] = useState(0);
  const [inProgressOrders, setInProgressOrders] = useState(0);
  const [avgOrderValue, setAvgOrderValue] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [activeCustomers, setActiveCustomers] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const [currentTooltip, setCurrentTooltip] = useState('activeCustomers');
  const [leaderboardData, setLeaderboardData] = useState([]);

  useEffect(() => {
    if (!user) return;
    
    const userRef = doc(db, "users", user.uid);
    const unsubscribeRecords = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTotalCustomers(data.records?.length || 0);
      }
    });
    
    return () => unsubscribeRecords();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    
    // Fetch leaderboard data (customers with their order counts)
    const ordersQuery = query(
      collection(db, "orders"),
      where("tailorId", "==", user.uid)
    );
    
    const unsubscribeLeaderboard = onSnapshot(ordersQuery, (querySnapshot) => {
      const customerOrdersMap = new Map();
      
      querySnapshot.forEach((doc) => {
        const orderData = doc.data();
        const customerId = orderData.userId;
        const customerName = orderData.name || "Unknown Customer";
        
        if (customerId) {
          if (customerOrdersMap.has(customerId)) {
            customerOrdersMap.set(customerId, {
              name: customerName,
              count: customerOrdersMap.get(customerId).count + 1,
              phone: customerId // Store phone number as customer ID
            });
          } else {
            customerOrdersMap.set(customerId, {
              name: customerName,
              count: 1,
              phone: customerId // Store phone number as customer ID
            });
          }
        }
      });
      
      // Convert to array and sort by order count (descending)
      const sortedLeaderboard = Array.from(customerOrdersMap.entries())
        .map(([id, data]) => ({
          id,
          name: data.name,
          orderCount: data.count,
          phone: data.phone
        }))
        .sort((a, b) => b.orderCount - a.orderCount);
      
      setLeaderboardData(sortedLeaderboard);
    });
    
    return () => unsubscribeLeaderboard();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    
    const ordersQuery = query(
      collection(db, "orders"),
      where("tailorId", "==", user.uid)
    );

    const unsubscribeOrders = onSnapshot(ordersQuery, (querySnapshot) => {
      let total = 0;
      let completed = 0;
      let inProgress = 0;
      let revenue = 0;
      let completedOrderValues = [];
      const activeCustomerIds = new Set();
      
      const today = new Date();
      const currentDateString = today.toISOString().split('T')[0];
      
      querySnapshot.forEach((doc) => {
        const orderData = doc.data();
        const orderDate = orderData.orderDate;
        
        total++;
        if (orderData.orderStatus === "Completed") {
          completed++;
          if (orderData.price) {
            const price = parseFloat(orderData.price);
            revenue += price;
            completedOrderValues.push(price);
          }
        } else {
          inProgress++;
        }
        
        if (orderData.orderStatus !== "Completed" && orderData.userId) {
          activeCustomerIds.add(orderData.userId);
        }
        
        if (orderDate && orderData.userId) {
          const orderDateObj = new Date(orderDate);
          const diffTime = today - orderDateObj;
          const diffDays = diffTime / (1000 * 60 * 60 * 24);
          
          if (diffDays <= 14) {
            activeCustomerIds.add(orderData.userId);
          }
        }
      });
      
      setTotalOrders(total);
      setCompletedOrders(completed);
      setInProgressOrders(inProgress);
      setTotalRevenue(revenue);
      setAvgOrderValue(completedOrderValues.length > 0 ? revenue / completedOrderValues.length : 0);
      setActiveCustomers(activeCustomerIds.size);
    });

    return () => unsubscribeOrders();
  }, [user]);

  const toggleTooltip = (tooltipType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentTooltip(tooltipType);
    setShowTooltip(true);
  };

 const renderLeaderboardItem = ({ item, index }) => (
  <TouchableOpacity
    style={styles.leaderboardItem}
    onPress={() => {
      Haptics.selectionAsync();
      navigation.navigate("CustomerRecordDetails", { 
        record: {
          phoneNumber: item.phone, // Changed from phone to phoneNumber
          username: item.name      // Changed from name to username
        }
      });
    }}
  >
    <View style={styles.leaderboardPosition}>
      <Text style={styles.positionText}>{index + 1}</Text>
    </View>
    <Text style={styles.leaderboardName} numberOfLines={1}>
      {item.name}
    </Text>
    <Text style={styles.leaderboardCount}>
      {item.orderCount} {item.orderCount === 1 ? 'order' : 'orders'}
    </Text>
  </TouchableOpacity>
);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#1a0b4d", "#3a1c96", "#6a3bb5", "#9a5fd9"]}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.profileHeader}>
            <Text style={styles.username}>Statistics</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{totalCustomers}</Text>
              <Text style={styles.statLabel}>Customers</Text>
              <View style={[styles.statIndicator, { backgroundColor: '#6a11cb' }]} />
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statValue}>{totalOrders}</Text>
              <Text style={styles.statLabel}>Total Orders</Text>
              <View style={[styles.statIndicator, { backgroundColor: '#3a1c96' }]} />
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: '#4CAF50' }]}>{completedOrders}</Text>
              <Text style={styles.statLabel}>Completed</Text>
              <View style={[styles.statIndicator, { backgroundColor: '#4CAF50' }]} />
            </View>

            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: '#F44336' }]}>{inProgressOrders}</Text>
              <Text style={styles.statLabel}>In Progress</Text>
              <View style={[styles.statIndicator, { backgroundColor: '#F44336' }]} />
            </View>
          </View>

          <View style={[styles.statCard, styles.revenueCard]}>
            <Text style={[styles.statValue, { color: '#FFC107' }]}>Rs. {totalRevenue.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Total Revenue (Completed Orders)</Text>
            <View style={[styles.statIndicator, { backgroundColor: '#FFC107' }]} />
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Quick Summary</Text>
            
            <View style={styles.summaryStat}>
              <Text style={styles.summaryLabel}>Orders per Customer:</Text>
              <Text style={styles.summaryValue}>
                {totalCustomers > 0 ? (totalOrders / totalCustomers).toFixed(1) : 0}
              </Text>
            </View>
            
            <View style={styles.summaryStat}>
              <Text style={styles.summaryLabel}>Completion Rate:</Text>
              <Text style={styles.summaryValue}>
                {totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(0) : 0}%
              </Text>
            </View>
            
            <View style={styles.summaryStat}>
              <Text style={styles.summaryLabel}>Avg Order Value:</Text>
              <View style={styles.valueWithTooltip}>
                <Text style={styles.summaryValue}>
                  Rs. {avgOrderValue.toFixed(0)}
                </Text>
                <TouchableOpacity 
                  onPress={() => toggleTooltip('avgOrder')} 
                  style={styles.tooltipButton}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                >
                  <MaterialIcons name="info-outline" size={18} color="rgba(255,255,255,0.6)" />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.summaryStat}>
              <Text style={styles.summaryLabel}>Active Customers:</Text>
              <View style={styles.valueWithTooltip}>
                <Text style={styles.summaryValue}>
                  {activeCustomers > 0 ? `${activeCustomers} (${Math.round((activeCustomers / totalCustomers) * 100)}%)` : "0 (0%)"}
                </Text>
                <TouchableOpacity 
                  onPress={() => toggleTooltip('activeCustomers')} 
                  style={styles.tooltipButton}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                >
                  <MaterialIcons name="info-outline" size={18} color="rgba(255,255,255,0.6)" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Leaderboard Section */}
          <View style={styles.leaderboardCard}>
            <Text style={styles.leaderboardTitle}>Top Customers</Text>
            {leaderboardData.length > 0 ? (
              <FlatList
                data={leaderboardData.slice(0, 5)} // Show top 5 customers
                renderItem={renderLeaderboardItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            ) : (
              <Text style={styles.noCustomersText}>No customer data available</Text>
            )}
          </View>
        </ScrollView>

        <Modal
          visible={showTooltip}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowTooltip(false)}
        >
          <TouchableOpacity 
            style={styles.tooltipOverlay} 
            activeOpacity={1}
            onPress={() => setShowTooltip(false)}
          >
            <View style={styles.tooltipContent}>
              <Text style={styles.tooltipTitle}>
                {currentTooltip === 'activeCustomers' ? 'Active Customers' : 'Average Order Value'}
              </Text>
              <Text style={styles.tooltipText}>
                {currentTooltip === 'activeCustomers' 
                  ? 'Customers who currently have orders in progress or have placed any order in the last 2 weeks.'
                  : 'Calculated by dividing total revenue from completed orders by the number of completed orders.'}
              </Text>
              <TouchableOpacity 
                style={styles.tooltipCloseButton}
                onPress={() => setShowTooltip(false)}
              >
                <Text style={styles.tooltipCloseText}>Got it</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#1a0b4d" },
  container: { flex: 1 },
  scrollContainer: { 
    flexGrow: 1,
    padding: 24,
    paddingTop: 40,
    paddingBottom: 80,
  },
  profileHeader: { 
    alignItems: 'center', 
    marginBottom: 30 
  },
  username: { 
    fontSize: 28, 
    fontWeight: '700', 
    color: 'white' 
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  revenueCard: {
    marginBottom: 20,
    marginHorizontal: 0,
    width: '100%',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  statIndicator: {
    width: '100%',
    height: 3,
    borderRadius: 2,
    marginTop: 10,
  },
  summaryCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
  },
  summaryStat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  summaryLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  valueWithTooltip: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 100,
    justifyContent: 'flex-end',
  },
  tooltipButton: {
    marginLeft: 6,
  },
  tooltipOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  tooltipContent: {
    backgroundColor: '#3a1c96',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 300,
  },
  tooltipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  tooltipText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 20,
  },
  tooltipCloseButton: {
    backgroundColor: '#6a3bb5',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  tooltipCloseText: {
    color: 'white',
    fontWeight: '600',
  },
  // Leaderboard styles
  leaderboardCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
  },
  leaderboardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  leaderboardPosition: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  positionText: {
    color: 'white',
    fontWeight: 'bold',
  },
  leaderboardName: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    marginRight: 10,
  },
  leaderboardCount: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  noCustomersText: {
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginVertical: 10,
  },
});