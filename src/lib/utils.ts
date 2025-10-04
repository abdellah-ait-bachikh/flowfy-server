import { Expo, ExpoPushMessage, ExpoPushTicket } from "expo-server-sdk";

const expo = new Expo();

/**
 * Send push notifications using Expo
 * @param tokens array of Expo push tokens
 * @param message object with title, body, and optional data
 */
export async function sendPushNotifications(
  tokens: string[],
  message: {
    title?: string;
    body?: string;
    data?: Record<string, any>;
  }
): Promise<ExpoPushTicket[]> {
  const { title, body, data } = message;

  const messages: ExpoPushMessage[] = tokens.map((token) => ({
    to: token,
    sound: "default",
    title: title || "Notification",
    body: body || "Hello!",
    data: data || {},
  }));

  const chunks = expo.chunkPushNotifications(messages);
  const tickets: ExpoPushTicket[] = [];

  for (const chunk of chunks) {
    const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
    tickets.push(...ticketChunk);
  }

  return tickets;
}

/**
 * Send push notification to a single user
 * @param token Expo push token
 * @param message object with title, body, and optional data
 */
export async function sendPushNotificationToUser(
  token: string,
  message: {
    title?: string;
    body?: string;
    data?: Record<string, any>;
  }
): Promise<ExpoPushTicket[]> {
  if (!Expo.isExpoPushToken(token)) {
    throw new Error("Invalid Expo push token");
  }

  return await sendPushNotifications([token], message);
}
