import { 
    IonAlert, 
    IonButton, 
    IonContent, 
    IonHeader, 
    IonPage, 
    IonTitle, 
    IonToolbar,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonInput,
    IonModal,
    IonGrid,
    IonRow,
    IonCol,
    IonToast,
    IonSelect,
    IonSelectOption
} from '@ionic/react';
import { 
    signOut, 
    updatePassword, 
    EmailAuthProvider, 
    reauthenticateWithCredential 
} from 'firebase/auth';
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import { auth } from '../firebase-config';
import {
    lockClosed,
    notifications,
    language,
    moon,
    shieldCheckmark,
    helpCircle,
    informationCircle,
    logOut
} from 'ionicons/icons';

const Account: React.FC = () => {
    const history = useHistory();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    // Password change states
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');

    // Language and Theme states
    const [selectedLanguage, setSelectedLanguage] = useState('English');
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Effect to apply dark mode class
    useEffect(() => {
        document.body.classList.toggle('dark', isDarkMode);
    }, [isDarkMode]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            history.replace("/login");
        } catch (error) {
            console.error("Logout failed", error);
            setToastMessage("Logout failed. Please try again.");
            setIsSuccess(false);
            setShowToast(true);
        }
    };

    const handlePasswordChange = async () => {
        try {
            setPasswordError('');
            
            if (newPassword !== confirmPassword) {
                setPasswordError('New passwords do not match');
                return;
            }

            if (newPassword.length < 8) {
                setPasswordError('Password must be at least 8 characters long');
                return;
            }

            const user = auth.currentUser;
            if (!user || !user.email) {
                throw new Error('No user found');
            }

            // Reauthenticate user
            const credential = EmailAuthProvider.credential(
                user.email,
                currentPassword
            );
            await reauthenticateWithCredential(user, credential);

            // Update password
            await updatePassword(user, newPassword);

            setToastMessage('Password updated successfully');
            setIsSuccess(true);
            setShowToast(true);
            setShowPasswordModal(false);
            
            // Clear form
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            console.error('Password update failed:', error);
            if (error.code === 'auth/wrong-password') {
                setPasswordError('Current password is incorrect');
            } else {
                setPasswordError('Failed to update password. Please try again.');
            }
        }
    };

    const showLogoutConfirmation = () => {
        setShowLogoutConfirm(true);
    };

    const handleLanguageChange = (event: CustomEvent) => {
        setSelectedLanguage(event.detail.value);
        // Here you can implement logic to change the app's language
        console.log(`Language changed to: ${event.detail.value}`);
    };

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    return (
        <IonPage>
            <IonContent fullscreen>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle className='title-toolbar'>Account Settings</IonTitle>
                    </IonToolbar>
                </IonHeader>

                <IonList>
                    {/* Profile Section */}
                    <IonItem>
                        <IonLabel>
                            <h2>Profile</h2>
                            <p>Manage your account information</p>
                        </IonLabel>
                    </IonItem>

                    {/* Change Password Section */}
                    <IonItem button onClick={() => setShowPasswordModal(true)}>
                        <IonIcon slot="start" icon={lockClosed} />
                        <IonLabel>
                            <h2>Change Password</h2>
                            <p>Update your account password</p>
                        </IonLabel>
                    </IonItem>

                    {/* Language Selection Section */}
                    <IonItem>
                        <IonIcon slot="start" icon={language} />
                        <IonLabel>Language</IonLabel>
                        <IonSelect value={selectedLanguage} onIonChange={handleLanguageChange}>
                            <IonSelectOption value="English">English</IonSelectOption>
                            <IonSelectOption value="Filipino">Filipino</IonSelectOption>
                        </IonSelect>
                    </IonItem>

                    {/* Theme Selection Section */}
                    <IonItem>
                        <IonIcon slot="start" icon={moon} />
                        <IonLabel>Theme</IonLabel>
                        <IonButton onClick={toggleTheme}>
                            {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        </IonButton>
                    </IonItem>

                    {/* Notifications Section */}
                    <IonItem>
                        <IonIcon slot="start" icon={notifications} />
                        <IonLabel>
                            <h2>Notifications</h2>
                            <p>Manage notification preferences</p>
                        </IonLabel>
                    </IonItem>

                    {/* Privacy Section */}
                    <IonItem>
                        <IonIcon slot="start" icon={shieldCheckmark} />
                        <IonLabel>
                            <h2>Privacy</h2>
                            <p>Manage privacy settings</p>
                        </IonLabel>
                    </IonItem>

                    {/* Help & Support Section */}
                    <IonItem>
                        <IonIcon slot="start" icon={helpCircle} />
                        <IonLabel>
                            <h2>Help & Support</h2>
                            <p>Get help and contact support</p>
                        </IonLabel>
                    </IonItem>

                    {/* About Section */}
                    <IonItem>
                        <IonIcon slot="start" icon={informationCircle} />
                        <IonLabel>
                            <h2>About</h2>
                            <p>App information and version</p>
                        </IonLabel>
                    </IonItem>

                    {/* Logout Button */}
                    <IonItem button onClick={showLogoutConfirmation}>
                        <IonIcon slot="start" icon={logOut} color="danger" />
                        <IonLabel color="danger">
                            <h2>Logout</h2>
                        </IonLabel>
                    </IonItem>
                </IonList>

                {/* Password Change Modal */}
                <IonModal isOpen={showPasswordModal} onDidDismiss={() => setShowPasswordModal(false)}>
                    <IonHeader>
                        <IonToolbar>
                            <IonTitle>Change Password</IonTitle>
                            <IonButton slot="end" onClick={() => setShowPasswordModal(false)}>Close</IonButton>
                        </IonToolbar>
                    </IonHeader>
                    <IonContent>
                        <IonGrid>
                            <IonRow>
                                <IonCol>
                                    <IonItem>
                                        <IonLabel position="stacked">Current Password</IonLabel>
                                        <IonInput
                                            type="password"
                                            value={currentPassword}
                                            onIonChange={e => setCurrentPassword(e.detail.value!)}
                                        />
                                    </IonItem>
                                    <IonItem>
                                        <IonLabel position="stacked">New Password</IonLabel>
                                        <IonInput
                                            type="password"
                                            value={newPassword}
                                            onIonChange={e => setNewPassword(e.detail.value!)}
                                        />
                                    </IonItem>
                                    <IonItem>
                                        <IonLabel position="stacked">Confirm New Password</IonLabel>
                                        <IonInput
                                            type="password"
                                            value={confirmPassword}
                                            onIonChange={e => setConfirmPassword(e.detail.value!)}
                                        />
                                    </IonItem>
                                    {passwordError && (
                                        <IonItem>
                                            <IonLabel color="danger">{passwordError}</IonLabel>
                                        </IonItem>
                                    )}
                                    <IonButton 
                                        expand="block" 
                                        onClick={handlePasswordChange}
                                        className="ion-margin"
                                    >
                                        Update Password
                                    </IonButton>
                                </IonCol>
                            </IonRow>
                        </IonGrid>
                    </IonContent>
                </IonModal>

                {/* Logout Confirmation Alert */}
                <IonAlert
                    isOpen={showLogoutConfirm}
                    onDidDismiss={() => setShowLogoutConfirm(false)}
                    header='Confirm Logout'
                    message='Are you sure you want to logout?'
                    buttons={[
                        {
                            text: 'Cancel',
                            role: 'cancel',
                            handler: () => {
                                setShowLogoutConfirm(false);
                            },
                        },
                        {
                            text: 'Logout',
                            handler: () => {
                                handleLogout();
                            },
                        },
                    ]}
                />

                {/* Toast for notifications */}
                <IonToast
                    isOpen={showToast}
                    onDidDismiss={() => setShowToast(false)}
                    message={toastMessage}
                    duration={3000}
                    color={isSuccess ? 'success' : 'danger'}
                />
            </IonContent>
        </IonPage>
    );
};

export default Account;