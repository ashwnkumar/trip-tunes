declare global {
 interface Room {
 id: string
 name: string
 code: string
 admin_id: string
 created_at: string
 }
}

// This makes sure TypeScript treats this file as a module
export {};
