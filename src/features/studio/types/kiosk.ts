export interface Room {
  id: string;
  name: string;
  layout: {
    x: number;
    y: number;
    width: number;
    height: number;
    color?: string;
  };
}

export interface StudioData {
  studio: {
    id: string;
    name: string;
    location: {
      city: string;
      state: string;
    };
    description?: string;
    logo?: string;
    contact: {
      email?: string;
      phone?: string;
      website?: string;
    };
    kiosk: {
      eduMode: boolean;
      networkName?: string | null;
    };
  };
  rooms: Room[];
  floorplan: {
    walls: Array<{
      id: string;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      stroke?: string;
      strokeWidth?: number;
    }>;
    structures: Array<{
      id: string;
      label?: string;
      layout: {
        x: number;
        y: number;
        width: number;
        height: number;
        color?: string;
      };
    }>;
  };
  bookings: Array<{
    id: string;
    roomId: string;
    roomName?: string;
    startTime?: string;
    endTime?: string;
    status: string;
    serviceType?: string;
    isClassBooking?: boolean;
    className?: string;
    professorName?: string;
    lessonPlan?: string;
  }>;
  timestamp: string;
}
