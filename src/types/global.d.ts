declare global {
 interface Room {
 id: string
 name: string
 room_code: string
 admin_id: string
 created_at: string
 invite_link: string
 }

 type RoomType = {
  id: string;
  name: string;
  code: string;
};

 interface Member {
 id: string
 room_id: string
 name: string
 role: string
 joined_at: string
 is_active: boolean
 }

}

// This makes sure TypeScript treats this file as a module
export {};
