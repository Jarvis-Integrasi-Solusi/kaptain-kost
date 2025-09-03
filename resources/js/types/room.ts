import { RoomCategory } from './room-category';

export interface Room {
    id: number;
    name: string;
    description?: string;
    room_category_id: number;
    roomImages?: RoomImage[];
    image: string;
    room_category: RoomCategory;
    occupancy_status: 'available' | 'reserved' | 'occupied' | 'unavailable';
    created_at?: string;
    updated_at?: string;
}

export interface RoomImage {
    id: number;
    room_id: number;
    image: string;
    url: string;
    created_at: string;
    updated_at: string;
}
