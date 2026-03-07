import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, isPasswordHash, verifyPassword } from '@/lib/password';

export async function POST(request: Request) {
    try {
        const payload = await request.json();
        const identifier = String(payload.email ?? payload.username ?? '').trim().toLowerCase();
        const password = String(payload.password ?? '');

        if (!identifier || !password) {
            return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { username: identifier }
        });

        if (!user) {
            return NextResponse.json({ success: false }, { status: 401 });
        }

        const valid = await verifyPassword(password, user.password);
        if (!valid) {
            return NextResponse.json({ success: false }, { status: 401 });
        }

        // If this account still uses legacy plain-text password, upgrade on successful login.
        if (!isPasswordHash(user.password)) {
            const upgradedHash = await hashPassword(password);
            await prisma.user.update({
                where: { id: user.id },
                data: { password: upgradedHash },
            });
        }

        return NextResponse.json({ success: true, role: user.role, username: user.username });
    } catch {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
