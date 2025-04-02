import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonItem,
  IonLabel,
  IonImg,
  IonText,
  IonList,
  IonNote,
  IonSpinner,
  IonAlert,
  IonModal,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonInput,
} from "@ionic/react";
import React, { useState, useEffect, useRef } from "react";
import CheckoutStepProgress from "../components/CheckoutStepProgress";
import { useHistory } from "react-router-dom";
import {
  arrowBackCircleSharp,
  checkmarkCircleSharp,
  chevronBackCircleOutline,
  chevronForwardCircle,
  qrCodeOutline,
  cameraOutline,
  cartOutline,
  timeOutline,
  locationOutline,
  cashOutline,
  cardOutline,
  close,
} from "ionicons/icons";
import { auth, db } from "../firebase-config";
import { collection, addDoc, serverTimestamp, getDocs, query, where, deleteDoc, doc, updateDoc } from "firebase/firestore";
import "./Review.css";

interface CartItem {
  id: string;
  cartId: string;
  productName: string;
  productSize: {
    id: string;
    name: string;
    price: number;
  };
  productVarieties: string[];
  productVarietiesNames: string[];
  productQuantity: number;
  productPrice: number;
  totalPrice: number;
  specialInstructions: string;
}

const Review: React.FC = () => {
  const history = useHistory();
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderTotal, setOrderTotal] = useState(0);
  const [orderId, setOrderId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState("");

  const steps = [
    "/home/cart/schedule",
    "/home/cart/schedule/payment",
    "/home/cart/schedule/payment/review",
  ];

  const currentStep = steps.indexOf(history.location.pathname);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          history.push("/login");
          return;
        }

        // Get selected payment method from localStorage
        const selectedPaymentMethod = localStorage.getItem("selectedPaymentMethod");
        if (!selectedPaymentMethod) {
          // If no payment method is selected, go back to payment selection
          history.replace("/home/cart/schedule/payment");
          return;
        }
        setPaymentMethod(selectedPaymentMethod);

        const cartRef = collection(db, "customers", user.uid, "cart");
        const cartSnapshot = await getDocs(cartRef);
        const items = cartSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as CartItem[];

        if (items.length === 0) {
          // If cart is empty, redirect to cart
          history.replace("/home/cart");
          return;
        }

        setCartItems(items);
        
        // Calculate total
        const total = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
        setOrderTotal(total);
      } catch (error) {
        console.error("Error fetching cart items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [history]);

  const handleConfirmOrder = async () => {
    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        history.push("/login");
        return;
      }

      // Create order
      const orderRef = collection(db, "customers", user.uid, "orders");
      const orderData = {
        items: cartItems,
        totalAmount: orderTotal,
        status: "Order Placed",
        createdAt: new Date().toISOString(),
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === "gcash" ? "Pending" : "Not Required",
        orderStatus: [
          {
            status: "Order Placed",
            timestamp: new Date().toISOString(),
          }
        ],
        canCancel: true,
        canDelete: false,
      };

      const orderDoc = await addDoc(orderRef, orderData);
      console.log("Order created with ID:", orderDoc.id);
      setOrderId(orderDoc.id);

      // Clear cart
      const cartRef = collection(db, "customers", user.uid, "cart");
      const cartSnapshot = await getDocs(cartRef);
      const deletePromises = cartSnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);

      // Clear payment method from localStorage
      localStorage.removeItem("selectedPaymentMethod");

      if (paymentMethod === "gcash") {
        setShowQRCode(true);
      } else {
        setShowSuccessAlert(true);
      }
    } catch (error) {
      console.error("Error creating order:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReferenceSubmit = async () => {
    try {
      const user = auth.currentUser;
      if (!user || !orderId) return;

      const orderRef = doc(db, "customers", user.uid, "orders", orderId);
      await updateDoc(orderRef, {
        gcashReferenceNumber: referenceNumber,
        paymentStatus: "Pending Verification"
      });

      setShowQRCode(false);
      setShowSuccessAlert(true);
    } catch (error) {
      console.error("Error updating reference number:", error);
    }
  };

  const handleUploadReceipt = async () => {
    // Implement receipt upload logic here
    setShowUploadModal(false);
    setShowSuccessAlert(true);
  };

  const handleOrderSuccess = () => {
    setShowSuccessAlert(false);
    history.push("/home/orders");
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
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home/cart/schedule/payment" />
          </IonButtons>
          <IonTitle className="title-toolbar">Review Order</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <CheckoutStepProgress currentStep={currentStep} />

        <div className="review-container">
          <IonCard className="order-summary-card">
            <IonCardHeader>
              <IonCardTitle>Order Summary</IonCardTitle>
              <IonCardSubtitle>Review your order before confirming</IonCardSubtitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                {cartItems.map((item) => (
                  <IonItem key={item.cartId || item.id} lines="full">
                    <IonLabel>
                      <h2>{item.productName || 'Unnamed Product'}</h2>
                      <p>Size: {item.productSize?.name || 'N/A'}</p>
                      <p>Price: ₱{(item.productSize?.price || item.productPrice || 0).toLocaleString()}</p>
                      <p>Quantity: {item.productQuantity || 1}</p>
                      <p>Total: ₱{(item.totalPrice || (item.productPrice * item.productQuantity) || 0).toLocaleString()}</p>
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

              <div className="payment-method-section">
                <IonItem lines="full">
                  <IonIcon icon={paymentMethod === "cash" ? cashOutline : cardOutline} slot="start" color="primary" />
                  <IonLabel>
                    <h2>Payment Method</h2>
                    <p>{paymentMethod === "cash" ? "Cash on Pickup" : "GCash"}</p>
                  </IonLabel>
                </IonItem>
              </div>

              <div className="order-total">
                <IonText color="dark">
                  <h2>Total Amount: ₱{(orderTotal || 0).toLocaleString()}</h2>
                </IonText>
              </div>
            </IonCardContent>
          </IonCard>
        </div>

        {/* Update the GCash QR Code Modal */}
        <IonModal 
          isOpen={showQRCode} 
          onDidDismiss={() => setShowQRCode(false)}
          className="gcash-modal"
        >
          <IonHeader>
            <IonToolbar>
              <IonButtons slot="start">
                <IonButton onClick={() => setShowQRCode(false)}>
                  <IonIcon icon={close} />
                </IonButton>
              </IonButtons>
              <IonTitle>GCash Payment</IonTitle>
            </IonToolbar>
          </IonHeader>
          
          <IonContent>
            <div className="qr-container">
              <div className="qr-details">
                <h2>Total Amount: ₱{orderTotal.toLocaleString()}</h2>
                <p>Order ID: {orderId}</p>
              </div>
              
              <div className="qr-image-wrapper">
                <IonImg
                  src="/assets/gcash-qr.png"
                  alt="GCash QR Code"
                  className="qr-code-image"
                  onIonError={() => {
                    console.error("Failed to load QR code image");
                    const imgElement = document.querySelector('.qr-code-image') as HTMLIonImgElement;
                    if (imgElement) {
                      imgElement.src = "https://via.placeholder.com/300x300?text=GCash+QR+Code";
                    }
                  }}
                />
              </div>
              
              <p className="qr-instructions">Please scan the QR code to complete your payment</p>
              
              <div className="reference-number-section">
                <IonItem>
                  <IonLabel position="stacked">Enter Reference Number</IonLabel>
                  <IonInput
                    type="text"
                    inputmode="text"
                    value={referenceNumber}
                    onIonChange={e => setReferenceNumber(e.detail.value!)}
                    placeholder="Enter your GCash reference number"
                  />
                </IonItem>
                
                <IonButton
                  expand="block"
                  onClick={handleReferenceSubmit}
                  disabled={!referenceNumber}
                  className="submit-reference-button"
                >
                  Submit Reference Number
                </IonButton>
              </div>
            </div>
          </IonContent>
        </IonModal>

        {/* Upload Receipt Modal */}
        <IonModal isOpen={showUploadModal} onDidDismiss={() => setShowUploadModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Upload Receipt</IonTitle>
              <IonButton slot="end" onClick={() => setShowUploadModal(false)}>Close</IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <div className="upload-container">
              <IonButton expand="block">
                <IonIcon icon={cameraOutline} slot="start" />
                Take Photo
              </IonButton>
              <IonButton expand="block">
                <IonIcon icon={qrCodeOutline} slot="start" />
                Choose from Gallery
              </IonButton>
            </div>
          </IonContent>
        </IonModal>

        {/* Success Alert */}
        <IonAlert
          isOpen={showSuccessAlert}
          onDidDismiss={handleOrderSuccess}
          header={paymentMethod === "gcash" ? "Payment Submitted" : "Order Placed Successfully!"}
          message={
            paymentMethod === "gcash"
              ? "Your order and payment reference have been submitted for verification."
              : "Your order has been placed and is being processed."
          }
          buttons={[
            {
              text: "View Orders",
              handler: handleOrderSuccess,
            },
          ]}
        />
      </IonContent>

      <IonFooter>
        <IonToolbar className="product-footer">
          <div className="footer-content">
            <div className="footer-back-action-button-container">
              <IonButton
                className="footer-back-action-button"
                routerLink="/home/cart/schedule/payment"
                fill="outline"
              >
                <IonIcon icon={chevronBackCircleOutline} slot="start" />
                Back to Payment
              </IonButton>
            </div>
            <div className="footer-action-button-container">
              <IonButton
                className="footer-action-button"
                onClick={handleConfirmOrder}
                disabled={isLoading}
              >
                {isLoading ? (
                  <IonSpinner name="crescent" />
                ) : (
                  <>
                    <IonIcon icon={checkmarkCircleSharp} slot="start" />
                    Confirm Order
                  </>
                )}
              </IonButton>
            </div>
          </div>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default Review;
