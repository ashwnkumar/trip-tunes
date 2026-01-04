declare global {
  interface Room {
    id: string;
    name: string;
    room_code: string;
    admin_id: string;
    created_at: string;
    invite_link: string;
  }

  type RoomType = {
    id: string;
    name: string;
    code: string;
  };

  interface Member {
    id: string;
    room_id: string;
    name: string;
    role: string;
    joined_at: string;
    is_active: boolean;
  }

  interface SongDetails {
    id: string;
    name: string;
    artist: string;
    album: string;
    url: string;
  }

  interface PlaylistItem {
    id: string;
    added_by: string;
    metadata: SongDetails;
    added_at: string;
  }

  interface ConfirmActionButton {
    label: string;
    onClick: () => void;
    className?: string;
    variant?:
      | "default"
      | "destructive"
      | "outline"
      | "secondary"
      | "ghost"
      | "link";
  }

  interface OnlinePresence {
    id: string;
    name: string;
    joined_at: string;
  }
}

// This makes sure TypeScript treats this file as a module
export {};
