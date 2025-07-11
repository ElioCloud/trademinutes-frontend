import { NextResponse } from 'next/server';

// Mock data - replace with actual database calls
const mockNotifications = [
  {
    id: '1',
    type: 'booking',
    title: 'New Booking Request',
    message: 'John Doe wants to book a session with you',
    timestamp: new Date().toISOString(),
    read: false
  },
  {
    id: '2',
    type: 'message',
    title: 'New Message',
    message: 'You have a new message from Sarah',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: true
  },
  {
    id: '3',
    type: 'booking',
    title: 'Booking Confirmed',
    message: 'Your session with Alice has been confirmed',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    read: false
  }
];

export async function GET() {
  // TODO: Get user ID from session and fetch their notifications
  return NextResponse.json(mockNotifications);
}

export async function PUT(request: Request) {
  const data = await request.json();
  
  if (data.action === 'markAsRead') {
    // TODO: Update notification read status in database
    return NextResponse.json({ success: true });
  }
  
  if (data.action === 'markAllAsRead') {
    // TODO: Update all notifications read status in database
    return NextResponse.json({ success: true });
  }
  
  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
} 