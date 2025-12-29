import { BannerManager } from "@/components/admin/BannerManager";

export default function BannerManagementPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Banner Management</h1>
                <p className="text-muted-foreground">Manage the banners displayed on the homepage.</p>
            </div>
            <BannerManager />
        </div>
    );
}
