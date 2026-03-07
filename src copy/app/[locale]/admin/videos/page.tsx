import { VideoManager } from "@/components/admin/VideoManager";

export default function VideoManagementPage() {
    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Video Feed Management</h1>
                <p className="text-muted-foreground">Manage shorts and recommended video cards shown on the home/video pages.</p>
            </div>

            <VideoManager />
        </div>
    );
}
