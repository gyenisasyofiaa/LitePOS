"use client";

import { useRouter } from "next/navigation";
import { ProductForm } from "@/components/products/product-form";
import { createProduct } from "@/services/product.service";
import { useAuth } from "@/context/auth-context";


export default function CreateProductPage(){
    const router = useRouter();   
    const {user} = useAuth();
   

    return(
        <div className="max-w-2xl">
            <p className="text-sm font-bold text-indigo-600">
                Master Data
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight">
                Tambah Produk
            </h1>
            <p className="mt-2 text-sm text-slate-500">
                Isi data produk yang akan dijual
            </p>
    
            <div className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
                <ProductForm 
                onSubmit={async (data) => {
                    if(!user) return;
                    await createProduct(user.uid, data);
                    router.push("/products")
                }}
                submitLabel="Simpan"/>
            </div>
        </div>
    )

}


