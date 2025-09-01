import { RoomCategory } from './room-category';

export interface Room {
    id: number;
    name: string;
    description?: string;
    image?: string;
    room_category_id: number;
    room_category: RoomCategory;
    created_at?: string;
    updated_at?: string;
}
