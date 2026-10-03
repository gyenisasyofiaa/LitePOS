import { Router } from "express";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "../firebase-admin.js";
import type { AuthenticatedRequest } from "../auth.js";
import { serializeFirestoreValue } from "../utils.js";

const router = Router();

function productsRef(uid: string) {
  return adminDb.collection("users").doc(uid).collection("products");
}

function validateProduct(body: unknown) {
  const data = body as Record<string, unknown>;
  const name = typeof data.name === "string" ? data.name.trim() : "";
  const sku = typeof data.sku === "string" ? data.sku.trim().toUpperCase() : "";
  const price = Number(data.price);
  const stock = Number(data.stock);

  if (!name || !sku) throw new Error("Nama dan SKU wajib diisi.");
  if (!Number.isFinite(price) || price <= 0) throw new Error("Harga harus lebih dari 0.");
  if (!Number.isInteger(stock) || stock < 0) throw new Error("Stok tidak boleh negatif.");

  return { name, sku, price, stock };
}

router.get("/", async (req, res) => {
  try {
    const uid = (req as AuthenticatedRequest).user.uid;
    const snapshot = await productsRef(uid).orderBy("createdAt", "desc").get();

    return res.json(
      snapshot.docs.map((doc) => ({
        id: doc.id,
        ...serializeFirestoreValue(doc.data()),
      })),
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Gagal mengambil produk." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const uid = (req as AuthenticatedRequest).user.uid;
    const snapshot = await productsRef(uid).doc(req.params.id).get();

    if (!snapshot.exists) return res.status(404).json({ message: "Produk tidak ditemukan." });

    return res.json({
      id: snapshot.id,
      ...serializeFirestoreValue(snapshot.data()),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Gagal mengambil produk." });
  }
});

router.post("/", async (req, res) => {
  try {
    const uid = (req as AuthenticatedRequest).user.uid;
    const input = validateProduct(req.body);
    const ref = await productsRef(uid).add({
      ...input,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    const snapshot = await ref.get();
    return res.status(201).json({
      id: snapshot.id,
      ...serializeFirestoreValue(snapshot.data()),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal membuat produk.";
    return res.status(400).json({ message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const uid = (req as AuthenticatedRequest).user.uid;
    const ref = productsRef(uid).doc(req.params.id);
    const existing = await ref.get();

    if (!existing.exists) return res.status(404).json({ message: "Produk tidak ditemukan." });

    const input = validateProduct(req.body);
    await ref.update({
      ...input,
      updatedAt: FieldValue.serverTimestamp(),
    });

    const snapshot = await ref.get();
    return res.json({
      id: snapshot.id,
      ...serializeFirestoreValue(snapshot.data()),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal memperbarui produk.";
    return res.status(400).json({ message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const uid = (req as AuthenticatedRequest).user.uid;
    const ref = productsRef(uid).doc(req.params.id);
    const existing = await ref.get();

    if (!existing.exists) return res.status(404).json({ message: "Produk tidak ditemukan." });

    await ref.delete();
    return res.json({ message: "Produk berhasil dihapus." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Gagal menghapus produk." });
  }
});

export default router;
