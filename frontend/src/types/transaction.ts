import { Timestamp } from "firebase/firestore";

export type PaymentMethod = 
| "cash"
| "qris"
| "transfer";

export type CartItem = {
    productId: string;
    name: string;
    sku: string;
    price: number;
    quantity: number;
    stock: number;
};
export type TransactionItem = Omit<CartItem, "stock">
export type SaleTransaction = {
    id: string;
    invoiceNumber: string;
    items: TransactionItem[];
    subtotal: number;
    total: number;
    paymentMethod: PaymentMethod;
    paymentAmount: number;
    change: number;
    createdAt?: Timestamp;
};
 
