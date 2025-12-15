// SMS service utility for sending text message reminders

/**
 * Sends an SMS notification to the user's phone number
 * @param {string} phoneNumber - The user's phone number
 * @param {string} message - The message to send
 * @returns {Promise<boolean>} - Returns true if SMS was sent successfully
 */
export const sendSMS = async (phoneNumber, message) => {
  if (!phoneNumber || !message) {
    console.error('Phone number and message are required');
    return false;
  }

  try {
    const apiUrl = import.meta.env.VITE_SMS_API_URL || 'http://localhost:3001/api/send-sms';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: phoneNumber.trim(),
        message: message.trim(),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Failed to send SMS:', errorData);
      return false;
    }

    const data = await response.json();
    console.log('SMS sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
};

/**
 * Formats a task reminder message for SMS
 * @param {Object} task - The task object
 * @returns {string} - Formatted reminder message
 */
export const formatReminderMessage = (task, minutesBefore = 30) => {
  const taskTitle = task.title || 'Untitled Task';

  let timeText = `${minutesBefore} minutes`;
  if (minutesBefore >= 60) {
    const hours = Math.floor(minutesBefore / 60);
    timeText = `${hours} hour${hours > 1 ? 's' : ''}`;
  }

  // "Reminder: [name of task] is due in [amount of time]"
  return `Reminder: "${taskTitle}" is due in ${timeText}.`;
};

