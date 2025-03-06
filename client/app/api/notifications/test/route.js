import { NextResponse } from 'next/server';
import axios from '@/lib/axios';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';


export async function POST(req) {
  try {
     
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
     
    const body = await req.json();
    
    // Forward the request to the backend
    const response = await axios.post('/notifications/test', {
      title: body.title,
      message: body.message,
      type: body.type || 'WARNING',
      metadata: body.metadata || {}
    });
    
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error sending test notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: error.response?.status || 500 }
    );
  }
} 