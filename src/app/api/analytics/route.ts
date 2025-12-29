import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        // In a real app, you would aggregate data from VisitLog
        // For now, we will return the mock data structure expected by the frontend
        // but we can also fetch real counts if we had them.

        // Mock data for charts
        const chartData = [
            { name: 'Mon', visitors: 4000, pageViews: 2400 },
            { name: 'Tue', visitors: 3000, pageViews: 1398 },
            { name: 'Wed', visitors: 2000, pageViews: 9800 },
            { name: 'Thu', visitors: 2780, pageViews: 3908 },
            { name: 'Fri', visitors: 1890, pageViews: 4800 },
            { name: 'Sat', visitors: 2390, pageViews: 3800 },
            { name: 'Sun', visitors: 3490, pageViews: 4300 },
        ];

        // Mock data for recent visitors
        // In real implementation: await prisma.visitLog.findMany({ take: 5, orderBy: { createdAt: 'desc' } })
        const recentVisitors = [
            { id: 1, user: "User_123", page: "/home", time: "2 mins ago", status: "Active" },
            { id: 2, user: "Guest_456", page: "/board", time: "5 mins ago", status: "Idle" },
            { id: 3, user: "User_789", page: "/video", time: "12 mins ago", status: "Active" },
            { id: 4, user: "Guest_101", page: "/home", time: "15 mins ago", status: "Offline" },
            { id: 5, user: "User_202", page: "/admin", time: "25 mins ago", status: "Active" },
        ];

        return NextResponse.json({
            chartData,
            recentVisitors,
            stats: {
                totalVisitors: 12345,
                pageViews: 45678,
                bannerClicks: 2345,
                activeUsers: 573
            }
        });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
