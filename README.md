# Trip Tunes 🎵🚗

> The ultimate road trip playlist experience. Built for those long drives with friends where everyone wants to be the DJ.

[![Next.js](https://img.shields.io/badge/Next.js-15.5.5-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Realtime-green)](https://supabase.com/)
[![Spotify](https://img.shields.io/badge/Spotify-API-1DB954)](https://developer.spotify.com/)

## What is this?

Trip Tunes is a collaborative playlist app I built for road trips with friends. You know that moment when everyone's fighting over the aux cord? Yeah, this solves that.

Create a room, share the link, and everyone can add songs to the playlist in real-time. No more passing phones around, no more "wait, let me add this one song." Just pure collaborative vibes.

## Why though?

I got tired of the chaos that comes with managing music on road trips. Someone's phone dies, someone else doesn't have Spotify Premium, and suddenly you're stuck listening to the same 10 songs on repeat.

So I built this. Now everyone can contribute to the playlist from their own phone, see what's been added, and keep the energy going — whether you're cruising down the highway or stuck in traffic.

## Features

### Core Functionality

- **Create Rooms** — Start a new room for your trip
- **Join Rooms** — Friends can join via invite link or room code
- **Real-time Collaboration** — Everyone sees updates instantly
- **Spotify Integration** — Search and add songs from Spotify's massive library
- **Live Playlist** — See what everyone's adding in real-time
- **Member Management** — See who's in the room and who added what
- **Room Presence** — Know who's currently active in the room
- **Admin Controls** — Room creator can manage the playlist and members

### Room Features

- **Unique Room Codes** — Each room gets a unique shareable code
- **Invite Links** — Share via link or QR code
- **Room Details** — See when the room was created and who's the admin
- **Leave/Delete Room** — Clean up when the trip is over
- **Persistent Storage** — Rooms and playlists are saved

### Playlist Features

- **Spotify Search** — Search for any song, artist, or album
- **Add Songs** — One tap to add songs to the playlist
- **Song Details** — See album art, artist, and who added each song
- **Timestamps** — Know when each song was added
- **Remove Songs** — Admins can remove songs if needed
- **Duplicate Prevention** — Can't add the same song twice

### Real-time Updates

- **Live Member List** — See who's online right now
- **Instant Playlist Updates** — Songs appear immediately for everyone
- **Toast Notifications** — Get notified when songs are added or removed
- **Presence Tracking** — Know who's active in the room

## Tech Stack

### Frontend

- **Next.js 15.5.5** — React framework with App Router
- **React 19.1.0** — UI library
- **TypeScript 5** — Type safety
- **TailwindCSS 4** — Utility-first styling

### Backend & Database

- **Supabase** — Backend as a service
  - PostgreSQL database
  - Real-time subscriptions
  - Row-level security
- **Dexie 4.2.1** — IndexedDB wrapper for local storage

### APIs & Integrations

- **Spotify Web API** — Music search and metadata
- **Spotify OAuth** — Authentication for API access

### UI Components

- **Radix UI** — Accessible component primitives
  - Dialog
  - Dropdown Menu
  - Alert Dialog
  - Label
- **Sonner** — Toast notifications
- **Vaul** — Drawer component
- **Lucide React** — Icon library
- **QRCode.react** — QR code generation

### Utilities

- **class-variance-authority** — Component variants
- **clsx** — Conditional classnames
- **tailwind-merge** — Merge Tailwind classes
- **uuid** — Unique ID generation
- **next-themes** — Dark mode support

## How It Works

### Room Creation Flow

1. User creates a room with a name
2. System generates a unique room code
3. User becomes the admin
4. Invite link is generated and shareable
5. Room is stored in Supabase

### Joining Flow

1. Friend receives invite link or room code
2. Enters their name
3. Joins the room
4. Gets added to the members list
5. Can start adding songs immediately

### Playlist Flow

1. User searches for a song via Spotify API
2. Selects a song from search results
3. Song is added to Supabase database
4. Real-time subscription broadcasts to all members
5. Everyone sees the new song instantly

### Real-time Magic

Trip Tunes uses Supabase's real-time subscriptions to keep everything in sync:

- **Playlist Updates** — New songs appear instantly
- **Member Presence** — See who's online
- **Room Deletions** — Everyone gets kicked if admin deletes the room
- **Song Removals** — Updates propagate immediately

## Project Structure

```
trip-tunes/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── join/              # Join room page
│   │   ├── room/              # Room pages
│   │   │   └── [roomId]/      # Dynamic room routes
│   │   │       ├── Members.tsx
│   │   │       ├── Playlist.tsx
│   │   │       ├── RoomDetailsPage.tsx
│   │   │       └── RoomPresence.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx           # Home page
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── components/            # Reusable components
│   │   ├── form/             # Form components
│   │   ├── ui/               # UI primitives
│   │   ├── CreateRoom.tsx
│   │   ├── JoinRoom.tsx
│   │   └── ConfirmDialog.tsx
│   ├── contexts/             # React Context
│   │   └── GlobalContext.tsx
│   ├── lib/                  # Utilities and helpers
│   │   ├── dexie.ts          # IndexedDB setup
│   │   ├── spotifyHelper.ts  # Spotify API helpers
│   │   ├── supabaseClient.ts # Supabase client
│   │   └── utils.ts
│   ├── types/                # TypeScript types
│   └── utils/                # Utility functions
├── public/                   # Static assets
└── package.json              # Dependencies
```

## Database Schema

### Tables

**rooms**

- `id` — UUID primary key
- `name` — Room name
- `room_code` — Unique room code
- `invite_link` — Shareable invite link
- `admin_id` — Reference to admin member
- `created_at` — Timestamp

**members**

- `id` — UUID primary key
- `name` — Member name
- `room_id` — Reference to room
- `role` — admin or member
- `created_at` — Timestamp

**songs**

- `id` — UUID primary key
- `room_id` — Reference to room
- `member_id` — Who added the song
- `spotify_id` — Spotify track ID
- `metadata` — Song details (JSON)
- `added_at` — Timestamp

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account
- Spotify Developer account

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
```

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/trip-tunes.git
cd trip-tunes

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

The application will be available at `http://localhost:3000`

### Supabase Setup

1. Create a new Supabase project
2. Run the SQL migrations to create tables
3. Enable real-time for the `songs` table
4. Set up row-level security policies
5. Copy your project URL and anon key to `.env.local`

### Spotify API Setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Copy your Client ID and Client Secret
4. Add them to `.env.local`

## Usage

### For the Road Trip Organizer

1. Open Trip Tunes
2. Click "Create Room"
3. Enter a room name and your name
4. Share the invite link with your friends
5. Start adding songs!

### For Friends Joining

1. Click the invite link
2. Enter your name
3. Start adding your favorite road trip bangers
4. Enjoy the collaborative vibes

## What I Learned

Building this project taught me:

- **Real-time Subscriptions** — Working with Supabase real-time features
- **Spotify API** — Integrating third-party music APIs
- **Collaborative Features** — Building multi-user experiences
- **Next.js App Router** — Modern Next.js patterns
- **TypeScript** — Type-safe React development
- **State Management** — Managing complex real-time state
- **User Experience** — Designing for group interactions

## Future Enhancements

Ideas for future road trips:

- [ ] Spotify playback integration (actually play the songs)
- [ ] Voting system for songs
- [ ] Song queue ordering
- [ ] Room themes and customization
- [ ] Trip statistics (most active contributor, etc.)
- [ ] Export playlist to Spotify
- [ ] Voice commands for hands-free adding
- [ ] Offline mode for areas with no signal
- [ ] Song recommendations based on playlist
- [ ] Integration with Apple Music

## Known Limitations

- **Spotify Premium** — Some features require Spotify Premium
- **Internet Required** — Need connection for real-time updates
- **No Playback** — Currently just a playlist builder, not a player
- **Mobile Optimization** — Best experienced on mobile browsers

## Contributing

This was built for personal use, but contributions are welcome! Feel free to:

- Report bugs
- Suggest features
- Improve the UI/UX
- Add new integrations
- Optimize performance

## License

MIT — Use it for your road trips!

## Acknowledgments

Built for those long drives with friends where the music matters just as much as the destination. Thanks to everyone who's ever fought over the aux cord — this one's for you.

---

**Ready for your next road trip? Create a room and let the music flow!**

_For road trippers, by a road tripper. Built with Next.js, Supabase, and good vibes._
