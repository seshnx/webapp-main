import type { StudioData } from '@/types/kiosk';

const now = new Date();

const makeDemoTime = (offsetHours: number, durationHours: number) => {
  const start = new Date(now.getTime() + offsetHours * 3600000);
  const end = new Date(start.getTime() + durationHours * 3600000);
  return { startTime: start.toISOString(), endTime: end.toISOString() };
};

export const DEMO_DATA: StudioData = {
  studio: {
    id: 'demo',
    name: 'SeshNx Demo Studio',
    location: { city: 'Los Angeles', state: 'CA' },
    description: 'Full-service recording and production facility',
    contact: {
      email: 'hello@seshnx.com',
      phone: '+1 (310) 555-0100',
      website: 'https://seshnx.com',
    },
    kiosk: { eduMode: false, networkName: 'Studio WiFi' },
  },
  rooms: [
    { id: 'room-a', name: 'Studio A', layout: { x: 80, y: 80, width: 200, height: 150, color: '#3B82F6' } },
    { id: 'room-b', name: 'Studio B', layout: { x: 320, y: 80, width: 180, height: 150, color: '#8B5CF6' } },
    { id: 'room-c', name: 'Vocal Booth', layout: { x: 80, y: 280, width: 120, height: 100, color: '#10B981' } },
    { id: 'room-d', name: 'Mix Suite', layout: { x: 240, y: 280, width: 140, height: 100, color: '#F59E0B' } },
    { id: 'lounge', name: 'Lounge', layout: { x: 420, y: 280, width: 100, height: 100, color: '#6B7280' } },
  ],
  floorplan: {
    walls: [
      { id: 'w1', x1: 50, y1: 50, x2: 550, y2: 50 },
      { id: 'w2', x1: 550, y1: 50, x2: 550, y2: 420 },
      { id: 'w3', x1: 550, y1: 420, x2: 50, y2: 420 },
      { id: 'w4', x1: 50, y1: 420, x2: 50, y2: 50 },
      { id: 'w5', x1: 300, y1: 50, x2: 300, y2: 420 },
      { id: 'w6', x1: 50, y1: 250, x2: 550, y2: 250 },
    ],
    structures: [
      { id: 's1', label: 'Reception', layout: { x: 400, y: 340, width: 100, height: 60, color: '#94a3b8' } },
    ],
  },
  bookings: [
    {
      id: 'b1', roomId: 'room-a', roomName: 'Studio A',
      ...makeDemoTime(-0.5, 2),
      status: 'in_progress', serviceType: 'Recording Session',
    },
    {
      id: 'b2', roomId: 'room-b', roomName: 'Studio B',
      ...makeDemoTime(1, 1.5),
      status: 'confirmed', serviceType: 'Mix & Master',
    },
    {
      id: 'b3', roomId: 'room-c', roomName: 'Vocal Booth',
      ...makeDemoTime(2.5, 1),
      status: 'confirmed', serviceType: 'Vocal Recording',
    },
    {
      id: 'b4', roomId: 'room-d', roomName: 'Mix Suite',
      ...makeDemoTime(-2, 1),
      status: 'confirmed', serviceType: 'Stem Mixing',
    },
  ],
  timestamp: new Date().toISOString(),
};
