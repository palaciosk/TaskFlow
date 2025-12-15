// Reminder system - alerts 30 minutes before task is due
import { sendSMS, formatReminderMessage } from './sms';

export const scheduleReminder = (task, onReminder, phoneNumber = null) => {
  if (!task.dueDate) return null;

  const dueDate = new Date(task.dueDate);
  // Default to 30 minutes if not set
  const minutesBefore = task.reminderMinutes || 30;
  const reminderTime = new Date(dueDate.getTime() - minutesBefore * 60 * 1000);
  const now = new Date();

  // Only schedule if reminder time is in the future
  if (reminderTime <= now) return null;

  const timeUntilReminder = reminderTime.getTime() - now.getTime();

  const timeoutId = setTimeout(async () => {
    onReminder(task);

    // Show browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      let timeText = `${minutesBefore} minutes`;
      if (minutesBefore >= 60) {
        const hours = Math.floor(minutesBefore / 60);
        timeText = `${hours} hour${hours > 1 ? 's' : ''}`;
      }

      new Notification(`Task Reminder: ${task.title}`, {
        body: `Your task "${task.title}" is due in ${timeText}!`,
        icon: '/favicon.svg',
        tag: `reminder-${task.id}` // Prevents duplicate notifications
      });
    }

    // Send WhatsApp notification if phone number is provided
    if (phoneNumber) {
      const message = formatReminderMessage(task, minutesBefore);
      await sendSMS(phoneNumber, message);
    }
  }, timeUntilReminder);

  return timeoutId;
};

export const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission();
  }
};
