"use client";
import { ProductInput, } from "@/types/product";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProductForm } from "@/components/products/product-form";
import { useAuth } from "@/context/auth-context";
import { getProdutc, updateProduct } from "@/services/product.service";

export default function EditProductPage(){
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const {user} = useAuth();
    const [initialData, setInitialData] = useState<ProductInput | null>(null);
    const [notFound, setNotFound] = useState(false);

    useEffect(()=> {
        if (!user) return;
        getProdutc(user.uid, params.id).then((product) => {
            if(!product) return setNotFound(true);
            setInitialData({name: product.name, sku: product.sku, price: product.price, stock: product.stock});
        });
    }, [user, params.id]);
    
    if (notFound)
        return <div className="rounded-2xl bg-white p-6">Produk Tidak Ditemukan</div>;
    if (!initialData) 
        return <div className="rounded-2xl bg-white p-6">Memuat Produk...</div>;
    
    
    
    return (
        <div className="mx-auto max-w-3xl">
        <div className="mb-6">
            <p className="text-sm font-bold text-indigo-600">
                Produk
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight">
                Edit Produk
            </h1>
            <ProductForm
            initialData={initialData}
            submitLabel="Simpan Perubahan"
            onSubmit={async (data) => {
                if (!user) return;
                await updateProduct(user.uid, params.id, data);
                router.push("/products")
            }}
            />
            s
        </div>
        </div>
    )
}

