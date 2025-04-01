import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonIcon,
  IonButton,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
  IonAlert,
} from "@ionic/react";
import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase-config";
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { timeOutline, locationOutline, cashOutline, cardOutline, closeCircleOutline, trashOutline } from "ionicons/icons";
import "./Orders.css";

interface OrderItem {
  productName: string;
  productSize: {
    name: string;
    price: number;
  };
  productQuantity: number;
  totalPrice: number;
  productVarietiesNames: string[];
  specialInstructions: string;
}

interface Order {
  id: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: Array<{
    status: string;
    timestamp: string;
  }>;
  canCancel: boolean;
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const ordersRef = collection(db, "customers", user.uid, "orders");
    const q = query(ordersRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];
      console.log("Fetched orders:", ordersData);
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDeleteOrder = async (orderId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const orderRef = doc(db, "customers", user.uid, "orders", orderId);
      await deleteDoc(orderRef);
      console.log("Order deleted successfully");
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const orderRef = doc(db, "customers", user.uid, "orders", orderId);
      await updateDoc(orderRef, {
        status: "Cancelled",
        canCancel: false,
        canDelete: true,
        orderStatus: [
          {
            status: "Cancelled",
            timestamp: new Date().toISOString(),
          },
        ],
      });
    } catch (error) {
      console.error("Error cancelling order:", error);
    }
  };

  const handleOrderAction = (orderId: string, isCancelled: boolean) => {
    setSelectedOrderId(orderId);
    if (isCancelled) {
      setShowDeleteAlert(true);
    } else {
      handleCancelOrder(orderId);
    }
  };

  const formatDate = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  const handleRefresh = (event: CustomEvent<RefresherEventDetail>) => {
    setTimeout(() => {
      event.detail.complete();
    }, 1000);
  };

  if (loading) {
    return (
      <IonPage>
        <IonContent fullscreen className="ion-padding">
          <div className="loading-container">
            <IonSpinner name="crescent" />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>My Orders</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        {orders.length === 0 ? (
          <div className="no-orders">
            <p>No orders yet</p>
          </div>
        ) : (
          orders.map((order) => (
            <IonCard key={order.id} className="order-card">
              <IonCardHeader>
                <div className="order-header">
                  <div>
                    <IonCardTitle>Order #{order.id.slice(-6)}</IonCardTitle>
                    <IonCardSubtitle>
                      <IonIcon icon={timeOutline} />
                      {formatDate(order.createdAt)}
                    </IonCardSubtitle>
                  </div>
                  <IonBadge color={order.status === "Cancelled" ? "danger" : "success"}>
                    {order.status}
                  </IonBadge>
                </div>
              </IonCardHeader>
              <IonCardContent>
                <IonList>
                  {order.items.map((item, index) => (
                    <IonItem key={index}>
                      <IonLabel>
                        <h2>{item.productName}</h2>
                        <p>Size: {item.productSize?.name || 'N/A'}</p>
                        <p>Quantity: {item.productQuantity}</p>
                        <p>Price: ₱{item.productSize?.price?.toLocaleString() || '0'}</p>
                        <p>Total: ₱{item.totalPrice?.toLocaleString() || '0'}</p>
                        {item.productVarietiesNames?.length > 0 && (
                          <p>Varieties: {item.productVarietiesNames.join(", ")}</p>
                        )}
                        {item.specialInstructions && (
                          <p>Special Instructions: {item.specialInstructions}</p>
                        )}
                      </IonLabel>
                    </IonItem>
                  ))}
                </IonList>

                <div className="order-footer">
                  <div className="order-total">
                    <h3>Total Amount: ₱{order.totalAmount.toLocaleString()}</h3>
                  </div>
                  <div className="order-payment">
                    <IonIcon icon={order.paymentMethod === "cash" ? cashOutline : cardOutline} />
                    <span>{order.paymentMethod === "cash" ? "Cash on Pickup" : "GCash"}</span>
                    {order.paymentMethod === "gcash" && (
                      <IonBadge color={order.paymentStatus === "Pending Verification" ? "warning" : "success"}>
                        {order.paymentStatus}
                      </IonBadge>
                    )}
                  </div>
                  {(order.canCancel || order.status === "Cancelled") && (
                    <IonButton
                      color="danger"
                      fill="outline"
                      onClick={() => handleOrderAction(order.id, order.status === "Cancelled")}
                    >
                      <IonIcon icon={order.status === "Cancelled" ? trashOutline : closeCircleOutline} slot="start" />
                      {order.status === "Cancelled" ? "Delete Order" : "Cancel Order"}
                    </IonButton>
                  )}
                </div>
              </IonCardContent>
            </IonCard>
          ))
        )}

        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="Delete Order"
          message="Are you sure you want to delete this order? This action cannot be undone."
          buttons={[
            {
              text: "Cancel",
              role: "cancel"
            },
            {
              text: "Delete",
              handler: () => {
                handleDeleteOrder(selectedOrderId);
              }
            }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Orders; 