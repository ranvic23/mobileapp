import React, { useEffect, useState } from "react";
import {
  IonModal,
  IonContent,
  IonButton,
  IonIcon,
  IonImg,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonHeader,
  IonToolbar,
  IonButtons,
} from "@ionic/react";
import { chevronBack } from "ionicons/icons";
import "../products/ProductModal.css";
import { ProductModalProps } from "../interfaces/interfaces";

const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const handleClose = () => {
    onClose();
  };

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={handleClose}
      className="product-details-modal"
    >
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={handleClose}>
              <IonIcon icon={chevronBack} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {product && (
          <div className="product-details-container">
            <div className="product-details-img">
              <IonImg src={product.imageURL} alt={product.name} />
            </div>
            <IonCardHeader className="product-details-header">
              <IonCardTitle>{product.name}</IonCardTitle>
              <IonCardSubtitle>₱{product.price}</IonCardSubtitle>
            </IonCardHeader>
            <IonCardContent className="product-details-description">
              <p>{product.description}</p>
            </IonCardContent>
          </div>
        )}
      </IonContent>
    </IonModal>
  );
};

export default ProductModal;
