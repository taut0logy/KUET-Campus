import { NextResponse } from 'next/server';
import axios from '@/lib/axios';

export async function POST(req) {
  try {
    const body = await req.json();
    
    // Forward the request to the backend
    const response = await axios.post('/notifications/test/channel', body);
    
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error sending channel notification:', error);
    return NextResponse.json(
      { error: 'Failed to send channel notification' },
      { status: error.response?.status || 500 }
    );
  }
} 