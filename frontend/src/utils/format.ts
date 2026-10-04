import { Timestamp } from "firebase/firestore";

export function formatRupiah(value: number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(value);
}

export function formatCurrency(value: number){
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(value);
}

// export function formatDate(value?: Timestamp){
//     if(!value) return "-";
//     return new Intl.DateTimeFormat("id-ID", {
//         dateStyle: "medium",
//         timeStyle: "short",
//     }).format(value.toDate());
// }

export function formatDate( value?: Timestamp | Date | string | null ) {
    if (!value) return "-"; 
    let date: Date; if (value instanceof Timestamp) { 
        date = value.toDate(); 
    } else if (value instanceof Date) { 
        date = value; 
    } else { date = new Date(value);
    } return 
    new Intl.DateTimeFormat("id-ID", { 
        dateStyle: "medium", 
        timeStyle: "short", 
    }).format(date); 
}