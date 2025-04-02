import {
  IonBackButton,
  IonButtons,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCheckbox,
  IonContent,
  IonHeader,
  IonIcon,
  IonImg,
  IonInput,
  IonItem,
  IonLabel,
  IonNote,
  IonPage,
  IonRadio,
  IonRadioGroup,
  IonText,
  IonThumbnail,
  IonTitle,
  IonToolbar,
  IonFooter,
  IonRow,
  IonCol,
  IonModal,
  IonTextarea,
  IonList,
} from "@ionic/react";
import {
  arrowBackCircle,
  arrowBackCircleSharp,
  cardOutline,
  checkmarkCircle,
  checkmarkCircleSharp,
  checkmarkDoneCircleSharp,
  chevronBackCircle,
  chevronBackCircleOutline,
  chevronForwardCircle,
  createOutline,
  documentTextSharp,
  helpCircleOutline,
  lockClosed,
  cashOutline,
  qrCodeOutline,
  cameraOutline,
} from "ionicons/icons";
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Payment.css";
import CheckoutStepProgress from "../components/CheckoutStepProgress";
import { useHistory } from "react-router";

const Payment: React.FC = () => {
  const history = useHistory();
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [referenceNumber, setReferenceNumber] = useState("");

  const steps = [
    "/home/cart/schedule",
    "/home/cart/schedule/payment",
    "/home/cart/schedule/payment/review",
  ];

  const currentStep = steps.indexOf(history.location.pathname);

  useEffect(() => {
    // Load saved payment method on component mount
    const savedMethod = localStorage.getItem("selectedPaymentMethod");
    if (savedMethod) {
      setPaymentMethod(savedMethod);
    }
  }, []);

  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value);
    localStorage.setItem("selectedPaymentMethod", value);
  };

  const handleContinue = () => {
    if (!paymentMethod) {
      return;
    }
    localStorage.setItem("selectedPaymentMethod", paymentMethod);
    history.push("/home/cart/schedule/payment/review");
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home/cart/schedule" />
          </IonButtons>
          <IonTitle className="title-toolbar">Payment Method</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <CheckoutStepProgress currentStep={currentStep} />

        <IonCard className="payment-methods-card">
          <IonCardContent>
            <IonRadioGroup value={paymentMethod} onIonChange={e => handlePaymentMethodChange(e.detail.value)}>
              <IonList>
                <IonItem button lines="full" onClick={() => handlePaymentMethodChange("cash")}>
                  <IonIcon icon={cashOutline} slot="start" color={paymentMethod === "cash" ? "primary" : "medium"} />
                  <IonLabel>
                    <h2>Cash on Pickup</h2>
                    <p>Pay when you pick up your order</p>
                  </IonLabel>
                  <IonRadio slot="end" value="cash" />
                </IonItem>

                <IonItem button lines="full" onClick={() => handlePaymentMethodChange("gcash")}>
                  <IonIcon icon={cardOutline} slot="start" color={paymentMethod === "gcash" ? "primary" : "medium"} />
                  <IonLabel>
                    <h2>GCash</h2>
                    <p>Pay using GCash QR code</p>
                  </IonLabel>
                  <IonRadio slot="end" value="gcash" />
                </IonItem>
              </IonList>
            </IonRadioGroup>
          </IonCardContent>
        </IonCard>
      </IonContent>

      <IonFooter>
        <IonToolbar className="product-footer">
          <div className="footer-content">
            <div className="footer-back-action-button-container">
              <IonButton
                className="footer-back-action-button"
                routerLink="/home/cart/schedule"
                fill="outline"
              >
                <IonIcon icon={chevronBackCircleOutline} slot="start" />
                Back to Schedule
              </IonButton>
            </div>
            <div className="footer-action-button-container">
              <IonButton
                className="footer-action-button"
                onClick={handleContinue}
                disabled={!paymentMethod}
              >
                <IonIcon icon={chevronForwardCircle} slot="end" />
                Continue to Review
              </IonButton>
            </div>
          </div>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default Payment;
