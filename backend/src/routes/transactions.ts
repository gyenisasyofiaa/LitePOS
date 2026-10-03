import { Router } from "express";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "../firebase-admin.js";
import type { AuthenticatedRequest } from "../auth.js";
import { createInvoiceNumber, serializeFirestoreValue } from "../utils.js";

const router = Router();

type PaymentMethod = "cash" | "transfer" | "qris";

type CheckoutItem = {
  productId: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  stock: number;
};

function transactionsRef(uid: string) {
  return adminDb.collection("users").doc(uid).collection("transactions");
}

function validateCheckout(body: unknown) {
  const data = body as Record<string, unknown>;
  const rawItems = Array.isArray(data.items) ? data.items as Array<Record<string, unknown>> : [];
  const paymentMethod = data.paymentMethod as PaymentMethod;
  const paymentAmount = Number(data.paymentAmount);

  if (!rawItems.length) throw new Error("Keranjang masih kosong.");
  if (!["cash", "transfer", "qris"].includes(paymentMethod)) {
    throw new Error("Metode pembayaran tidak valid.");
  }
  if (!Number.isFinite(paymentAmount) || paymentAmount < 0) {
    throw new Error("Jumlah pembayaran tidak valid.");
  }

  const quantities = new Map<string, number>();

  for (const item of rawItems) {
    const productId = String(item.productId || "");
    const quantity = Number(item.quantity);

    if (!productId || !Number.isInteger(quantity) || quantity <= 0) {
      throw new Error("Data item transaksi tidak valid.");
    }

    quantities.set(productId, (quantities.get(productId) ?? 0) + quantity);
  }

  return { quantities, paymentMethod, paymentAmount };
}

router.post("/checkout", async (req, res) => {
  try {
    const uid = (req as AuthenticatedRequest).user.uid;
    const { quantities, paymentMethod, paymentAmount } = validateCheckout(req.body);
    const transactionRef = transactionsRef(uid).doc();
    const invoiceNumber = createInvoiceNumber();

    let response: { total: number; items: Array<{
      productId: string;
      name: string;
      sku: string;
      price: number;
      quantity: number;
    }> } = { total: 0, items: [] };

    await adminDb.runTransaction(async (transaction) => {
      const productRefs = [...quantities.keys()].map((productId) =>
        adminDb.collection("users").doc(uid).collection("products").doc(productId),
      );

      // Semua read dilakukan sebelum write.
      const snapshots = [];
      for (const ref of productRefs) {
        snapshots.push(await transaction.get(ref));
      }

      const cleanItems = snapshots.map((snapshot, index) => {
        const productId = productRefs[index].id;
        const requestedQuantity = quantities.get(productId) ?? 0;

        if (!snapshot.exists) {
          throw new Error("Salah satu produk tidak ditemukan.");
        }

        const data = snapshot.data() ?? {};
        const currentStock = Number(data.stock ?? 0);

        if (currentStock < requestedQuantity) {
          throw new Error(`Stok ${String(data.name ?? "produk")} tidak mencukupi.`);
        }

        return {
          productId,
          name: String(data.name ?? ""),
          sku: String(data.sku ?? ""),
          price: Number(data.price ?? 0),
          quantity: requestedQuantity,
          currentStock,
        };
      });

      const total = cleanItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      if (paymentMethod === "cash" && paymentAmount < total) {
        throw new Error("Uang pembayaran masih kurang.");
      }

      for (const item of cleanItems) {
        const ref = productRefs.find((productRef) => productRef.id === item.productId)!;
        transaction.update(ref, {
          stock: item.currentStock - item.quantity,
          updatedAt: FieldValue.serverTimestamp(),
        });
      }

      const itemsForStorage = cleanItems.map(({ currentStock: _stock, ...item }) => item);
      const change = paymentMethod === "cash" ? paymentAmount - total : 0;

      transaction.set(transactionRef, {
        invoiceNumber,
        items: itemsForStorage,
        subtotal: total,
        total,
        paymentMethod,
        paymentAmount: paymentMethod === "cash" ? paymentAmount : total,
        change,
        createdAt: FieldValue.serverTimestamp(),
      });

      response = { total, items: itemsForStorage };
    });

    return res.status(201).json({
      transactionId: transactionRef.id,
      invoiceNumber,
      total: response.total,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Transaksi gagal disimpan.";
    return res.status(400).json({ message });
  }
});

router.get("/", async (req, res) => {
  try {
    const uid = (req as AuthenticatedRequest).user.uid;
    const snapshot = await transactionsRef(uid).orderBy("createdAt", "desc").get();

    return res.json(
      snapshot.docs.map((doc) => ({
        id: doc.id,
        ...serializeFirestoreValue(doc.data()),
      })),
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Gagal mengambil transaksi." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const uid = (req as AuthenticatedRequest).user.uid;
    const snapshot = await transactionsRef(uid).doc(req.params.id).get();

    if (!snapshot.exists) return res.status(404).json({ message: "Transaksi tidak ditemukan." });

    return res.json({
      id: snapshot.id,
      ...serializeFirestoreValue(snapshot.data()),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Gagal mengambil transaksi." });
  }
});

export default router;
