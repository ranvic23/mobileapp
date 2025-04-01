import React, { useState, useEffect } from "react";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonRadioGroup,
  IonRadio,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonFooter,
  IonCheckbox,
  IonToast,
  IonText,
  IonImg,
} from "@ionic/react";
import {
  close,
  addCircleOutline,
  removeCircleOutline,
  chevronForward,
  chevronBack,
  checkmarkCircle,
  cartOutline,
  arrowBackCircle,
  chevronForwardCircle,
  chevronBackCircleOutline,
  removeCircle,
  addCircle,
} from "ionicons/icons";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase-config";
import "./BuildYourOwnModal.css";
import { Size } from "../interfaces/interfaces";
import { Varieties } from "../interfaces/interfaces";
import { BuildYourOwnModalProps } from "../interfaces/interfaces";
import { Product } from "../interfaces/interfaces";

const BuildYourOwnModal: React.FC<BuildYourOwnModalProps> = ({
  isOpen,
  onClose,
  showToastMessage,
}) => {
  // States for sizes and varieties
  const [step, setStep] = useState(1);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [varieties, setVarieties] = useState<Varieties[]>([]);
  const [filteredVarieties, setFilteredVarieties] = useState<Varieties[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Selected options
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedVarieties, setSelectedVarieties] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState("");

  // Calculated total
  const [totalPrice, setTotalPrice] = useState(0);

  const [showToast, setShowToast] = useState(false);

  const getSizeImage = (sizeName: string): string => {
    const sizeImages: Record<string, string> = {
      "Big Bilao": "/assets/bilao.webp",
      Tray: "/assets/rectangle.webp",
      Small: "/assets/round.webp",
      "Half-Tray": "/assets/rectangle.webp",
      Solo: "/assets/round.webp",
      "1/4 Slice": "/assets/slice1.webp",
    };

    return sizeImages[sizeName] ?? "/assets/default.png";
  };

  // Fetch sizes and varieties
  useEffect(() => {
    const fetchSizes = async () => {
      try {
        console.log("Fetching sizes from Firestore...");
        const sizesRef = collection(db, "sizes");
        console.log("Sizes collection reference:", sizesRef.path);
        const sizesSnapshot = await getDocs(sizesRef);
        console.log("Sizes snapshot size:", sizesSnapshot.size);
        const sizesData = sizesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Size[];
        console.log("Fetched sizes data:", sizesData);
        setSizes(sizesData);
      } catch (error) {
        console.error("Error fetching sizes:", error);
        showToastMessage("Failed to load sizes", false);
      }
    };

    const fetchVarieties = async () => {
      try {
        console.log("Fetching varieties from Firestore...");
        const varietiesRef = collection(db, "varieties");
        console.log("Varieties collection reference:", varietiesRef.path);
        const varietiesSnapshot = await getDocs(varietiesRef);
        console.log("Varieties snapshot size:", varietiesSnapshot.size);
        const varietiesData = varietiesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Varieties[];
        console.log("Fetched varieties data:", varietiesData);
        setVarieties(varietiesData);
      } catch (error) {
        console.error("Error fetching varieties:", error);
        showToastMessage("Failed to load varieties", false);
      }
    };

    const fetchProducts = async () => {
      try {
        console.log("Fetching products from Firestore...");
        const productsRef = collection(db, "products");
        console.log("Products collection reference:", productsRef.path);
        const productsSnapshot = await getDocs(productsRef);
        console.log("Products snapshot size:", productsSnapshot.size);
        const productsData = productsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];
        console.log("Fetched products data:", productsData);
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
        showToastMessage("Failed to load products", false);
      }
    };

    if (isOpen) {
      console.log("Modal is open, starting data fetch...");
      fetchSizes();
      fetchVarieties();
      fetchProducts();
    }
  }, [isOpen, showToastMessage]);

  useEffect(() => {
    if (selectedSize) {
      console.log("Size selected:", selectedSize);
      const selectedSizeObj = sizes.find((size) => size.id === selectedSize);
      console.log("Selected size object:", selectedSizeObj);

      if (selectedSizeObj && selectedSizeObj.varieties) {
        console.log("Available varieties for size:", selectedSizeObj.varieties);
        const varietiesForDisplay = selectedSizeObj.varieties.map(
          (varietyName, index) => ({
            id: `${selectedSize}-variety-${index}`,
            name: varietyName,
            price: 0,
            sizeId: selectedSize,
          })
        );
        console.log("Filtered varieties for display:", varietiesForDisplay);
        setFilteredVarieties(varietiesForDisplay);
      } else {
        console.log("No varieties available for selected size");
        setFilteredVarieties([]);
      }

      setSelectedVarieties([]);
    }
  }, [selectedSize, sizes]);

  // Calculate total price
  useEffect(() => {
    let total = 0;

    // Add size price
    if (selectedSize) {
      const size = sizes.find((s) => s.id === selectedSize);
      if (size) {
        console.log("Base size price:", size.price);
        total = size.price; // Base price for the size
      }
    }

    // Calculate total with quantity
    total *= quantity;
    console.log("Final total after quantity:", total);
    setTotalPrice(total);
  }, [selectedSize, quantity, sizes]);

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const toggleVarietySelection = (varietyId: string) => {
    const selectedSizeObj = sizes.find((size) => size.id === selectedSize);
    const maxVarieties = selectedSizeObj?.maxVarieties || 1;

    setSelectedVarieties((prev) => {
      if (prev.includes(varietyId)) {
        return prev.filter((id) => id !== varietyId); // Remove if selected
      } else if (prev.length < maxVarieties) {
        return [...prev, varietyId]; // Add if under limit
      } else {
        setShowToast(true); // Show toast when limit is reached
      }
      return prev; // No change if at limit
    });
  };

  const handleAddToCart = async () => {
    try {
      console.log("Starting add to cart process...");
      
      if (!selectedSize || selectedVarieties.length === 0) {
        showToastMessage("Please select a size and at least one variety.", false);
        return;
      }

      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.log("User is not logged in.");
        showToastMessage("Please log in to add items to cart.", false);
        return;
      }

      // Get the size name and price
      const selectedSizeObj = sizes.find((size) => size.id === selectedSize);
      const sizeName = selectedSizeObj ? selectedSizeObj.name : "";
      const sizePrice = selectedSizeObj ? selectedSizeObj.price : 0;

      // Get the variety names
      const varietyNames = selectedVarieties
        .map((varietyId) => {
          const variety = filteredVarieties.find((v) => v.id === varietyId);
          return variety ? variety.name : "";
        })
        .filter((name) => name !== "");

      // Calculate total price
      const itemPrice = sizePrice;
      const total = itemPrice * quantity;

      console.log("Cart item details:", {
        sizeName,
        sizePrice,
        varietyNames,
        quantity,
        total
      });

      const cartCollectionRef = collection(
        db,
        "customers",
        currentUser.uid,
        "cart"
      );

      const cartId = doc(cartCollectionRef).id;
      await setDoc(doc(cartCollectionRef, cartId), {
        createdAt: new Date().toISOString(),
        productName: "Build Your Own Bibingka",
        productSize: { 
          id: selectedSize, 
          name: sizeName,
          price: sizePrice
        },
        productVarieties: selectedVarieties,
        productVarietiesNames: varietyNames,
        productQuantity: quantity,
        productPrice: itemPrice,
        totalPrice: total,
        specialInstructions,
        cartId,
      });

      console.log("Successfully added to cart");
      showToastMessage("Added to cart successfully!", true);

      // Reset form and close modal
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error adding to cart:", error);
      showToastMessage("Failed to add to cart", false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setQuantity(1);
    }
  }, [isOpen]);

  const resetForm = () => {
    setStep(1);
    setSelectedSize("");
    setSelectedVarieties([]);
    // setQuantity(1);
    setSpecialInstructions("");
  };

  // Render step indicator
  const renderStepIndicator = () => {
    return (
      <div className="step-indicator">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`step-dot ${step === s ? "active" : ""} ${
              step > s ? "completed" : ""
            }`}
            onClick={() => {
              // Only allow going back to previous steps or current step
              if (s <= step) setStep(s);
            }}
          >
            {step > s ? <IonIcon icon={checkmarkCircle} /> : s}
          </div>
        ))}
      </div>
    );
  };

  // Render step content
  const renderStepContent = () => {
    console.log("Rendering step content for step:", step);
    console.log("Current sizes:", sizes);
    console.log("Current filtered varieties:", filteredVarieties);
    console.log("Selected size:", selectedSize);
    console.log("Selected varieties:", selectedVarieties);

    switch (step) {
      case 1:
        return (
          <div className="step-content">
            <div className="step-header">
              <IonTitle className="step-title product-title">
                Choose Size
              </IonTitle>
              <IonText className="step-description">
                Select a size for your kakanin
              </IonText>
            </div>

            <IonRadioGroup
              value={selectedSize}
              onIonChange={(e) => {
                console.log("Size selected:", e.detail.value);
                setSelectedSize(e.detail.value);
              }}
            >
              <IonGrid className="size-grid">
                <IonRow className="size-selection-row">
                  {[...sizes]
                    .sort((a, b) => b.price - a.price)
                    .map((size) => (
                      <IonCol key={size.id} size="6" size-md="4">
                        <IonCard
                          className={`size-card ${
                            selectedSize === size.id ? "selected-size" : ""
                          }`}
                          onClick={() => {
                            console.log("Size card clicked:", size.id);
                            setSelectedSize(size.id);
                          }}
                        >
                          <div className="size-radio-container">
                            <IonRadio
                              value={size.id}
                              className="custom-radio"
                            />
                          </div>
                          <IonCardContent className="size-card-content">
                            <IonImg
                              src={getSizeImage(size.name)}
                              className="size-image"
                              alt={size.name}
                            />
                            <div className="size-details">
                              <IonText className="size-name">
                                {size.name}
                              </IonText>
                              <IonText className="size-dimension">
                                {size.dimensions}
                              </IonText>
                              <IonText className="size-slices">
                                {size.slices} slices
                              </IonText>
                              <IonText className="size-price">
                                ₱{size.price}
                              </IonText>
                            </div>
                          </IonCardContent>
                        </IonCard>
                      </IonCol>
                    ))}
                </IonRow>
              </IonGrid>
            </IonRadioGroup>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <div className="step-header">
              <IonTitle className="step-title product-title">
                Choose Variety (Up to{" "}
                {sizes.find((size) => size.id === selectedSize)?.maxVarieties ||
                  1}
                )
              </IonTitle>
              <IonText className="step-description">
                Select your favorite kakanin
              </IonText>
            </div>

            {selectedSize ? (
              <IonGrid className="byok-variety-grid">
                <IonRow className="byok-variety-selection-row">
                  {filteredVarieties.map((variety) => {
                    const selectedSizeObj = sizes.find(
                      (size) => size.id === selectedSize
                    );
                    const maxVarieties = selectedSizeObj?.maxVarieties || 1;

                    return (
                      <IonCol key={variety.id} size="6">
                        <IonCard
                          className={`byok-variety-card ${
                            selectedVarieties.includes(variety.id)
                              ? "selected-variety"
                              : ""
                          }`}
                          onClick={() => {
                            console.log("Variety card clicked:", variety.id);
                            toggleVarietySelection(variety.id);
                          }}
                        >
                          <IonCardContent className="byok-variety-card-content">
                            <div className="byok-variety-image-container">
                              <IonImg
                                src={
                                  products.find(
                                    (product) => product.name === variety.name
                                  )?.imageURL || "default-image-url.jpg"
                                }
                                className="byok-variety-image"
                              />
                            </div>
                            <div className="variety-details">
                              <IonText className="byok-variety-name">
                                {variety.name}
                              </IonText>
                            </div>
                          </IonCardContent>
                        </IonCard>
                      </IonCol>
                    );
                  })}
                </IonRow>
              </IonGrid>
            ) : (
              <div className="no-size-selected">
                <p>Please select a size first</p>
              </div>
            )}
          </div>
        );

      case 3:
        const selectedSizeObj = sizes.find((s) => s.id === selectedSize);
        const basePrice = selectedSizeObj ? selectedSizeObj.price : 0;
        const subtotal = basePrice * quantity;

        return (
          <div className="step-content">
            <IonTitle className="step-title product-title">
              Review Your Order
            </IonTitle>
            <IonText className="step-description">
              Please review your selection before adding to cart
            </IonText>

            <div className="review-section">
              <IonCard className="review-card">
                <IonCardContent>
                  <div className="review-header">
                    <h2>Order Details</h2>
                  </div>

                  <div className="review-details">
                    <div className="review-item">
                      <div className="review-label">Size</div>
                      <div className="review-value">
                        {selectedSizeObj?.name || "None selected"}
                      </div>
                    </div>

                    <div className="review-item">
                      <div className="review-label">Price per item</div>
                      <div className="review-value">₱{basePrice.toLocaleString()}</div>
                    </div>

                    <div className="review-item">
                      <div className="review-label">Quantity</div>
                      <div className="review-value quantity-control">
                        <IonButton
                          fill="clear"
                          onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                          disabled={quantity <= 1}
                        >
                          <IonIcon icon={removeCircle} />
                        </IonButton>
                        <span className="quantity-display">{quantity}</span>
                        <IonButton
                          fill="clear"
                          onClick={() => setQuantity(quantity + 1)}
                        >
                          <IonIcon icon={addCircle} />
                        </IonButton>
                      </div>
                    </div>

                    <div className="review-item">
                      <div className="review-label">Varieties</div>
                      <div className="review-value varieties-list">
                        {selectedVarieties.length > 0 ? (
                          <ul>
                            {selectedVarieties.map((varietyId) => (
                              <li key={varietyId}>
                                {filteredVarieties.find((v) => v.id === varietyId)?.name}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          "None selected"
                        )}
                      </div>
                    </div>

                    <div className="review-item">
                      <div className="review-label">Special Instructions</div>
                      <IonTextarea
                        className="special-instructions-textarea"
                        placeholder="Add any special requests here..."
                        value={specialInstructions}
                        onIonChange={(e) => setSpecialInstructions(e.detail.value!)}
                      />
                    </div>

                    <div className="review-total">
                      <div className="review-label">Total Amount</div>
                      <div className="review-value total-price">
                        ₱{subtotal.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </IonCardContent>
              </IonCard>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Check if the current step is complete
  const isStepComplete = () => {
    switch (step) {
      case 1:
        return !!selectedSize;
      case 2:
        return selectedVarieties.length > 0;
      case 3:
        return quantity > 0;
      default:
        return false;
    }
  };

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={() => {
        console.log("Modal dismissed");
        resetForm();
        onClose();
      }}
      className="build-your-own-modal"
    >
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={`You can select up to ${
          sizes.find((size) => size.id === selectedSize)?.maxVarieties || 1
        } varieties only.`}
        duration={2000}
      />
      <IonHeader>
        <IonToolbar>
          <IonTitle className="title-toolbar">Build Your Own Kakanin</IonTitle>
          <IonButtons slot="end">
            <IonButton className="byok-back-button" onClick={onClose}>
              <IonIcon className="byok-back-icon" icon={close} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {renderStepIndicator()}
        {renderStepContent()}
      </IonContent>

      <IonFooter>
        <IonToolbar className="product-footer">
          <div className="footer-content">
            <div className="footer-back-action-button-container">
              {step > 1 && (
                <IonButton
                  className="footer-back-action-button byok-next-button"
                  fill="outline"
                  onClick={() => {
                    console.log("Going back to step:", step - 1);
                    prevStep();
                  }}
                >
                  <IonIcon slot="start" icon={chevronBackCircleOutline} />
                  Back
                </IonButton>
              )}
            </div>
            {step < 3 && (
              <IonButton
                className="footer-action-button byok-next-button"
                disabled={!isStepComplete()}
                onClick={() => {
                  console.log("Moving to next step:", step + 1);
                  nextStep();
                }}
              >
                Next
                <IonIcon slot="end" icon={chevronForwardCircle} />
              </IonButton>
            )}

            {step === 3 && (
              <IonButton
                className="footer-action-button add-next-button"
                disabled={!isStepComplete()}
                onClick={handleAddToCart}
              >
                Add to Cart
                <IonIcon slot="end" icon={cartOutline} />
              </IonButton>
            )}
          </div>
        </IonToolbar>
      </IonFooter>
    </IonModal>
  );
};

export default BuildYourOwnModal;
