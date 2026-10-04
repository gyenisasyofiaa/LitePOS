"use client";

import Link from "next/link";
import { Eraser, Plus, Search, SquarePen, } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import type { Product } from "@/types/product";
import { formatCurrency } from "@/utils/currency";
import { deleteProduct, getProducts } from "@/services/product.service";
import { useAuth } from "@/context/auth-context";
// import { getProducts, deleteProduct } from "@/lib/product-storage";
// import { router } from "next/client";
// import { getProductById, updateProduct } from "@/services/product.service";

export default function ProductsPage(){
    const {user} = useAuth();
    const [search, setSearch] = useState("");
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // async function loadProducts(){
    //     try{
    //         setLoading(true);
    //         setError("");
    //         const data = await getProducts();
    //         setProducts(data);
    //     }catch (error){
    //         console.error(error);
    //         setError("Gagal Memuat Produk.");
    //     }finally{
    //         setLoading(false);
    //     }
    // }

    const loadProducts = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            setError("");
            setProducts(await getProducts(user.uid));
        }catch {
            setError("Gagal mengambil produk.")
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        void loadProducts();
    }, [loadProducts]);

    // const filtered = useMemo(() => {

    // })

    const filtered = useMemo(() => {
        const keyword = search.toLowerCase();
        return products.filter((product) => 
                product.name.toLowerCase().includes(keyword) ||
                product.sku.toLowerCase().includes(keyword)
);
    }, [products, search]);
    
    async function handleDelete(product: Product){
        if(!user || !window.confirm('Hapus Produk ${product.name}?')) return;
        await deleteProduct(user.uid, product.id);
        await loadProducts();
    }

    if (loading){
        return(
            <div className="rounded-2xl border bg-white p-6">
                Memuat Data Produk...
            </div>
        );
    }
    if(error){
        return(
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
                {error}
            </div>
        );
    }
    
    return (        
    <div>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm font-bold text-indigo-600">
                        Master Data
                    </p>
                <h1 className="mt-1 text-3xl font-black tracking-tight">
                    Produk
                </h1>
                    <p className="mt-2 text-sm text-slate-500">
                        Kelola Produk, Harga, dan  Stok
                    </p>
                </div>

                <Link href="/products/create">
                <Button className="w-full sm:w-auto">
                    <Plus size={18}/>
                    Tambah Produk
                </Button>
                </Link>
            </div>


            <div className="mb-5 max-w-md">
                {/* <Search/> */}
                <Input
                placeholder="Cari nama atau SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)} 
                className="pl-3"
                />
            </div>

            {loading && <div className="rounded-2xl bg-white p-8 text-sm text-slate-500">Memuat Produk...</div>}
            {error && <div className="rounded-2xl bg-rose-50 p-5 text-sm font-semibold text-rose-700">{error}</div>}
            {!loading && !error && products.length === 0 && <EmptyState title="Belum ada produk" description="Tambahkan produk pertama untuk memulai transaksi POS."/>}

                {!loading && filtered.length > 0 && (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                    <tr>
                                        <th className="px-5 py-4">Produk</th>
                                        <th className="px-5 py-4">SKU</th>
                                        <th className="px-5 py-4">Harga</th>
                                        <th className="px-5 py-4">Stok</th>
                                        <th className="px-5 py-4 text-right">Aksi</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {filtered.map((product) => {
                                        return (
                                        <tr key={product.id} className="hover:bg-slate-50/70">
                                            <td className="px-5 py-4 font-bold text-slate-900">
                                                {product.name}
                                            </td>
                                            <td className="px-5 py-4 font-bold text-slate-500">
                                                {product.sku}
                                            </td>
                                            <td className="px-5 py-4 font-bold text-slate-900">
                                                {formatCurrency(product.price)}
                                            </td>
                                            
                                            <td className="px-5 py-4">    
                                                <span
                                                className={`
                                                    rounded-full px-2.5 py-1 text-xs font-bold ${product.stock <= 5 ? "bg-amber-100 text-amber-100" : "bg-emerald-100 text-emerald-800"}
                                                    `}>
                                                {product.stock}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <Link 
                                                    href={`/products/${product.id}/edit`}
                                                    className="grid size-9 border-slate-600 hover:bg-slate-400 rounded-lg border px-3 py-2 text-sm bg-indigo-600 font-bold text-white" aria-label="Edit">
                                                        <SquarePen size={16}/> 
                                                    </Link>
                                                    <button
                                                    type="button"
                                                    onClick={()=> handleDelete(product)}
                                                     className="grid size-9 rounded-lg border border-rose-200 bg-rose-600 px-3 py-2 text-sm font-bold text-white hover:bg-rose-300" aria-label="Hapus">
                                                        <Eraser size={16}/>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
          
        {!loading && products.length > 0 && filtered.length === 0 && (
        <div className="rounded-2xl bg-white p-8 text-center text-sm text-slate-500">
          <Search className="mx-auto mb-2" />
          Produk tidak ditemukan
        </div>
      )}
        </div>
    );
}