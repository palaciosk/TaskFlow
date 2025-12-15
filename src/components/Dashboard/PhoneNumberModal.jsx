import { useState } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { X, Phone, Check } from 'lucide-react';
import './PhoneNumberModal.css';

const PhoneNumberModal = ({ onClose, onSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [skipped, setSkipped] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate phone number format if provided
    if (phoneNumber.trim()) {
      const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
      if (!phoneRegex.test(phoneNumber.trim())) {
        setError('Please enter a valid phone number');
        return;
      }
    }

    setLoading(true);

    try {
      if (!auth.currentUser) {
        setError('User not authenticated');
        return;
      }

      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userRef);

      // Create or update user document with phone number
      const userData = {
        phoneNumber: phoneNumber.trim() || null,
        updatedAt: new Date().toISOString()
      };

      if (userDoc.exists()) {
        // Update existing document
        await setDoc(userRef, userData, { merge: true });
      } else {
        // Create new document (for existing users who don't have a user doc yet)
        await setDoc(userRef, {
          email: auth.currentUser.email || '',
          phoneNumber: phoneNumber.trim() || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      onSuccess?.(phoneNumber.trim() || null);
      onClose();
    } catch (err) {
      console.error('Error updating phone number:', err);
      setError(err.message || 'Failed to update phone number');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setSkipped(true);

    // Create or update user document with null phone number to track that they saw the modal
    try {
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          // Create user document for existing users
          await setDoc(userRef, {
            email: auth.currentUser.email || '',
            phoneNumber: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      }
    } catch (err) {
      console.error('Error creating user document:', err);
    }

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content phone-number-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Enable WhatsApp Notifications</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="phone-number-modal-body">
          <div className="phone-number-info">
            <Phone className="phone-icon" size={48} />
            <h3>Stay on top of your tasks!</h3>
            <p>
              Add your phone number to receive WhatsApp reminders 30 minutes before your tasks are due.
            </p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="phone-number-form">
            <div className="input-group">
              <Phone className="input-icon" />
              <input
                type="tel"
                placeholder="Phone Number (e.g., +1234567890)"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="input"
                autoFocus
              />
            </div>

            <div className="phone-number-actions">
              <button
                type="button"
                onClick={handleSkip}
                className="btn btn-secondary"
                disabled={loading}
              >
                Skip for now
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  'Saving...'
                ) : (
                  <>
                    <Check size={18} />
                    Save Phone Number
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

export default PhoneNumberModal;

