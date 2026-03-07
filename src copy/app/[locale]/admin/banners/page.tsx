import { BannerManager } from "@/components/admin/BannerManager";
import { QuickPortalManager } from "@/components/admin/QuickPortalManager";

export default function BannerManagementPage() {
    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Banner Management</h1>
                <p className="text-muted-foreground">Manage homepage hero banners and quick portal cards.</p>
            </div>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Hero Banners</h2>
                <BannerManager />
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Quick Portals</h2>
                <QuickPortalManager />
            </section>
        </div>
    );
}
