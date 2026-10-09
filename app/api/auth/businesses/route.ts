import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL =
    process.env.API_URL || 'http://localhost:3001';

export async function POST(request: Request) {
    try {
        // Get JWT from the cookie
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json(
                { message: 'Non authentifié' },
                { status: 401 },
            );
        }

        // Get data sent by the frontend
        const body = await request.json();

        // Send request to NestJS backend
        const response = await fetch(`${API_URL}/businesses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });

        // Get NestJS response
        const data = await response.json();

        // Return NestJS response to the frontend
        return NextResponse.json(data, {
            status: response.status,
        });
    } catch (error) {
        console.error('Create business error:', error);

        return NextResponse.json(
            { message: 'Erreur interne du serveur' },
            { status: 500 },
        );
    }
}