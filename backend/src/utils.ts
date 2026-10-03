export function createInvoiceNumber() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replaceAll("-", "");
  const time = now.toTimeString().slice(0, 8).replaceAll(":", "");
  const random = Math.floor(100 + Math.random() * 900);
  return `INV-${date}-${time}-${random}`;
}

export function serializeFirestoreValue(value: unknown): unknown {
  if (value && typeof value === "object" && "toDate" in value && typeof (value as { toDate?: unknown }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }

  if (Array.isArray(value)) return value.map(serializeFirestoreValue);

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [key, serializeFirestoreValue(nested)]),
    );
  }

  return value;
}
