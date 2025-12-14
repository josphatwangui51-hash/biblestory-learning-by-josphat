
/**
 * Service to handle visitor notifications.
 * 
 * To receive notifications on your phone or email:
 * 1. Create an account on a platform like Zapier.com or Make.com.
 * 2. Create a new "Webhook" trigger.
 * 3. Copy the provided Webhook URL.
 * 4. Paste it into the `WEBHOOK_URL` variable below.
 * 5. Set up an action in Zapier/Make to send you an SMS, Email, or WhatsApp message when the webhook is triggered.
 */

const WEBHOOK_URL = ""; // PASTE YOUR WEBHOOK URL HERE

export const notifyVisit = async () => {
  // check if code is running in browser
  if (typeof window === 'undefined') return;

  // Prevent duplicate notifications for the same session (so you don't get spammed on refresh)
  if (sessionStorage.getItem('visit_notified')) {
    return;
  }

  if (!WEBHOOK_URL) {
    console.log("Visitor Notification: WEBHOOK_URL is not set in services/notificationService.ts");
    return;
  }

  try {
    const payload = {
      event: "New Visitor",
      timestamp: new Date().toLocaleString(),
      screen: `${window.screen.width}x${window.screen.height}`,
      referrer: document.referrer || 'Direct',
      userAgent: navigator.userAgent
    };

    // Use fetch with keepalive to ensure request completes even if page closes quickly
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      keepalive: true
    });

    // Mark this session as notified
    sessionStorage.setItem('visit_notified', 'true');
    console.log("Visitor notification sent successfully.");

  } catch (error) {
    // Fail silently to avoid disturbing the user
    console.error("Failed to send visitor notification:", error);
  }
};
