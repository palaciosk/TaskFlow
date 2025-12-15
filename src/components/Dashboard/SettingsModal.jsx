import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { X, Phone, Bell, Check, Save, Palette } from 'lucide-react';
import './SettingsModal.css';

const SettingsModal = ({ onClose, onUpdate }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [selectedTheme, setSelectedTheme] = useState('dark');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const fetchSettings = async () => {
            if (!auth.currentUser) return;

            try {
                // Fetch User Data
                const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setPhoneNumber(data.phoneNumber || '');
                    setSelectedTheme(data.theme || 'dark');
                }

                // Check Browser Notification Permission
                if ('Notification' in window) {
                    setNotificationsEnabled(Notification.permission === 'granted');
                }
            } catch (error) {
                console.error('Error fetching settings:', error);
                setMessage({ type: 'error', text: 'Failed to load settings' });
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            // Validate Phone
            if (phoneNumber.trim()) {
                const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
                if (!phoneRegex.test(phoneNumber.trim())) {
                    throw new Error('Invalid phone number format');
                }
            }

            // Update Firestore
            if (auth.currentUser) {
                await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                    phoneNumber: phoneNumber.trim() || null,
                    theme: selectedTheme,
                    updatedAt: new Date().toISOString()
                });
            }

            // Update parent state immediately
            if (onUpdate) {
                onUpdate(phoneNumber.trim() || null, selectedTheme);
            }

            // Apply theme immediately for preview
            import('../../utils/themes').then(({ applyTheme }) => {
                applyTheme(selectedTheme);
            });

            setMessage({ type: 'success', text: 'Settings saved successfully' });

            // Close after a brief success message
            setTimeout(() => {
                onClose();
            }, 1000);
        } catch (error) {
            console.error('Error saving settings:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to save settings' });
        } finally {
            setSaving(false);
        }
    };

    const requestNotificationPermission = async () => {
        if (!('Notification' in window)) {
            alert('This browser does not support desktop notifications');
            return;
        }

        const permission = await Notification.requestPermission();
        setNotificationsEnabled(permission === 'granted');

        if (permission === 'granted') {
            new Notification('Notifications Enabled', {
                body: 'You will now receive reminders for your tasks.',
                icon: '/favicon.svg'
            });
        }
    };

    if (loading) return null;

    const themeOptions = [
        { id: 'dark', name: 'Dark', color: '#0a0a0f' },
        { id: 'light', name: 'Light', color: '#ffffff' },
        { id: 'ocean', name: 'Ocean', color: '#0f172a' },
        { id: 'sunset', name: 'Sunset', color: '#450a0a' },
        { id: 'nature', name: 'Nature', color: '#052e16' },
        { id: 'lavender', name: 'Lavender', color: '#2e1065' },
        { id: 'rose', name: 'Rose', color: '#4c0519' },
        { id: 'coffee', name: 'Coffee', color: '#271c19' }
    ];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content settings-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Settings</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="settings-body">
                    {message.text && (
                        <div className={`settings-alert ${message.type}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSave}>
                        <div className="settings-section">
                            <h3>
                                <Palette size={18} />
                                Appearance
                            </h3>
                            <p className="settings-desc">Choose your preferred theme.</p>

                            <div className="theme-grid">
                                {themeOptions.map((theme) => (
                                    <button
                                        key={theme.id}
                                        type="button"
                                        className={`theme-option ${selectedTheme === theme.id ? 'active' : ''}`}
                                        onClick={() => setSelectedTheme(theme.id)}
                                    >
                                        <div className="theme-preview" style={{ backgroundColor: theme.color }}>
                                            {selectedTheme === theme.id && <Check size={16} color={theme.id === 'light' ? '#000' : '#fff'} />}
                                        </div>
                                        <span>{theme.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="settings-section">
                            <h3>
                                <Phone size={18} />
                                WhatsApp Notifications
                            </h3>
                            <p className="settings-desc">Receive WhatsApp messages 30 minutes before tasks are due.</p>

                            <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="+1234567890"
                                    className="input"
                                />
                                <small>Include country code (e.g., +1 for US)</small>
                            </div>
                        </div>

                        <div className="settings-section">
                            <h3>
                                <Bell size={18} />
                                Browser Notifications
                            </h3>
                            <p className="settings-desc">Get push notifications on your device.</p>

                            <div className="notification-status">
                                <div className={`status-badge ${notificationsEnabled ? 'enabled' : 'disabled'}`}>
                                    {notificationsEnabled ? 'Enabled' : 'Disabled'}
                                </div>
                                {!notificationsEnabled && (
                                    <button
                                        type="button"
                                        onClick={requestNotificationPermission}
                                        className="btn btn-outline btn-sm"
                                    >
                                        Enable Notifications
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="settings-actions">
                            <button type="button" onClick={onClose} className="btn btn-secondary">
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? 'Saving...' : (
                                    <>
                                        <Save size={18} />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
