"use client";
import Link from "next/link";
import{
    Boxes,
    LayoutDashboard,
    LogOut,
    ReceiptText,
    ShoppingCart,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

const menu = [
    {
        href: "/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
    },
    {
        href: "/products",
        label: "Produk",
        icon: Boxes,
    },
    {
        href: "/transactions/new",
        label: "Kasir / POS",
        icon: ShoppingCart,
    },
    {
        href: "/transactions",
        label: "Riwayat",
        icon: ReceiptText,
    },
]

export function Sidebar(){
    const pathname = usePathname();
    const router = useRouter();
    const { logout } = useAuth();

    async function handleLogout() {
        await logout();
        router.replace("/login");
    }
    return (
        <aside className="bg-slate-950 text-white lg:min-h-screen lg:w-64 border-slate-200 border-b lg:border-0 lg:border-r lg:border-slate-800">
            <div className="flex items-center justify-between p-5 lg:block">
                <div className="text-xl font-black tracking-tight">
                    MiniPOS
                </div>
                <div className="mt-1 text-xs text-slate-400">
                    Bootcamp Project
                </div>
                <button onClick={handleLogout} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden" aria-label="Logout"> 
                    <LogOut size={18}/>
                </button>
            </div>

                <nav className="gap-2 px-4 flex overflow-x-auto pb-4 lg:grid lg:pb-0">
                    {menu.map((item) => {
                        const Icon = item.icon;
                        const active = pathname === item.href || 
                                    (item.href === "/dashboard" && 
                                    pathname.startsWith(item.href));
                        return(
                            <Link
                            key={item.href} 
                            href={item.href}
                            className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition 
                            ${active ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-900 hover:text-white"}
                            `}
                            >
                                    <Icon size={18}/>
                                    {item.label}
                            </Link>
                        )
                    })}
                </nav>

                <div className="mt-auto hidden p-4 lg:block">
                    <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-900 hover:text-white">
                        <LogOut size={18}/> LogOut
                    </button>
                </div>
                </aside>
                );
}
