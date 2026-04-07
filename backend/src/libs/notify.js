import Notification from "../models/notification.model.js";

/**
 * Create a notification — safe, never throws.
 * @param {string} userId
 * @param {"BID_ACCEPTED"|"BID_REJECTED"|"COUNTER_OFFER"|"ORDER_UPDATE"|"BID_UPDATED"} type
 * @param {string} message
 */
export const createNotification = async (userId, type, message) => {
  try {
    await Notification.create({ userId, type, message });
  } catch {
    // Notifications are non-critical — swallow errors silently
  }
};
