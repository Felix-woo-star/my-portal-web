import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { password, username } = await request.json();

        // Support legacy "admin" password check for backward compatibility or migration
        if (password === 'admin' && (username === 'admin' || !username)) {
            return NextResponse.json({ success: true, role: 'ADMIN' });
        }

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (user && user.password === password) {
            return NextResponse.json({ success: true, role: user.role });
        }

        return NextResponse.json({ success: false }, { status: 401 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
