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
import React, { useState } from "react";
import axios from "axios";
import "./Payment.css";
import CheckoutStepProgress from "../components/CheckoutStepProgress";
import { useHistory } from "react-router";

const Payment: React.FC = () => {
  const history = useHistory();
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [showQRCode, setShowQRCode] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState("");

  const steps = [
    "/home/cart/schedule",
    "/home/cart/schedule/payment",
    "/home/cart/schedule/payment/review",
  ];

  const currentStep = steps.indexOf(history.location.pathname);

  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value);
    localStorage.setItem("selectedPaymentMethod", value);
  };

  const handleContinue = () => {
    history.push("/home/cart/schedule/payment/review");
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle className="title-toolbar">Payment Method</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <CheckoutStepProgress currentStep={currentStep} />

        <IonCard className="payment-methods-card">
          <IonCardContent>
            <IonList>
              <IonItem button detail={false} onClick={() => handlePaymentMethodChange("cash")}>
                <IonIcon icon={cashOutline} slot="start" />
                <IonLabel>
                  <h2>Cash on Pickup</h2>
                  <p>Pay when you pick up your order</p>
                </IonLabel>
                <IonRadio slot="end" value="cash" checked={paymentMethod === "cash"} />
              </IonItem>

              <IonItem button detail={false} onClick={() => handlePaymentMethodChange("gcash")}>
                <IonIcon icon={cardOutline} slot="start" />
                <IonLabel>
                  <h2>GCash</h2>
                  <p>Pay using GCash QR code</p>
                </IonLabel>
                <IonRadio slot="end" value="gcash" checked={paymentMethod === "gcash"} />
              </IonItem>
            </IonList>
          </IonCardContent>
        </IonCard>

        {/* GCash QR Code Modal */}
        <IonModal isOpen={showQRCode} onDidDismiss={() => setShowQRCode(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>GCash Payment</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowQRCode(false)}>Close</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonCard>
              <IonCardContent>
                <div className="qr-code-container">
                  <IonImg
                    src="/assets/gcash-qr.png"
                    alt="GCash QR Code"
                    className="qr-code-image"
                  />
                  <IonText>
                    <p>Scan this QR code using your GCash app</p>
                    <p>After payment, enter your reference number below</p>
                  </IonText>
                  <IonInput
                    placeholder="Enter GCash Reference Number"
                    value={referenceNumber}
                    onIonChange={(e) => setReferenceNumber(e.detail.value!)}
                    className="reference-input"
                  />
                </div>
              </IonCardContent>
            </IonCard>
          </IonContent>
        </IonModal>
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
