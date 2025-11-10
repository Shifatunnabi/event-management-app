import crypto from "crypto";

const QR_SECRET_KEY = process.env.QR_SECRET_KEY || "";

if (!QR_SECRET_KEY) {
  console.warn("⚠️ QR_SECRET_KEY is not set in environment variables");
}

/**
 * Generate a unique ticket ID
 */
export function generateTicketId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = crypto.randomBytes(8).toString("hex");
  return `TKT-${timestamp}-${randomPart}`.toUpperCase();
}

/**
 * Generate secure QR data with HMAC-SHA256 signature
 * @param ticketId - Unique ticket identifier
 * @param eventId - Event ID
 * @param userId - User ID
 * @returns Object with qrData and qrSignature
 */
export function generateSecureQR(
  ticketId: string,
  eventId: string,
  userId: string
): { qrData: string; qrSignature: string } {
  // Create the payload
  const payload = {
    ticketId,
    eventId,
    userId,
    timestamp: Date.now(),
  };

  // Convert payload to JSON string
  const qrData = JSON.stringify(payload);

  // Generate HMAC-SHA256 signature
  const qrSignature = crypto
    .createHmac("sha256", QR_SECRET_KEY)
    .update(qrData)
    .digest("hex");

  return {
    qrData,
    qrSignature,
  };
}

/**
 * Validate QR signature
 * @param qrData - QR data string
 * @param qrSignature - QR signature to validate
 * @returns boolean indicating if signature is valid
 */
export function validateQRSignature(
  qrData: string,
  qrSignature: string
): boolean {
  try {
    // Regenerate signature from data
    const expectedSignature = crypto
      .createHmac("sha256", QR_SECRET_KEY)
      .update(qrData)
      .digest("hex");

    // Compare signatures using timing-safe comparison
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "hex"),
      Buffer.from(qrSignature, "hex")
    );
  } catch (error) {
    console.error("QR signature validation error:", error);
    return false;
  }
}

/**
 * Parse QR data
 * @param qrData - QR data string
 * @returns Parsed QR payload or null
 */
export function parseQRData(qrData: string): {
  ticketId: string;
  eventId: string;
  userId: string;
  timestamp: number;
} | null {
  try {
    const payload = JSON.parse(qrData);

    if (
      !payload.ticketId ||
      !payload.eventId ||
      !payload.userId ||
      !payload.timestamp
    ) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error("QR data parsing error:", error);
    return null;
  }
}

/**
 * Validate and parse QR code
 * @param qrData - QR data string
 * @param qrSignature - QR signature
 * @returns Parsed QR data if valid, null otherwise
 */
export function validateAndParseQR(
  qrData: string,
  qrSignature: string
): {
  ticketId: string;
  eventId: string;
  userId: string;
  timestamp: number;
} | null {
  // First validate signature
  if (!validateQRSignature(qrData, qrSignature)) {
    console.error("Invalid QR signature");
    return null;
  }

  // Then parse data
  const parsedData = parseQRData(qrData);
  if (!parsedData) {
    console.error("Failed to parse QR data");
    return null;
  }

  return parsedData;
}

/**
 * Generate a unique session ID for reservations
 */
export function generateSessionId(): string {
  return `SESSION-${Date.now()}-${crypto.randomBytes(16).toString("hex")}`;
}
