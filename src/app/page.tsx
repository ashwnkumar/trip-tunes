import CreateRoom from "@/components/CreateRoom";
import JoinRoom from "@/components/JoinRoom";
import { Music2, Users, Sparkles, Radio, Headphones, Play } from "lucide-react";

export default function Page() {
  return (
    <div className="w-full min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 lg:py-20">
        <div className="flex flex-col items-center justify-center gap-16 max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center space-y-6 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              <span>Collaborative Music Experience</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
              Trip Tunes
            </h1>

            <p className="text-xl sm:text-2xl text-foreground font-semibold">
              The ultimate road trip playlist experience
            </p>

            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Create a room, invite your friends, and build your perfect travel
              soundtrack together — live and in sync. Whether you&apos;re
              cruising down the highway or stuck in traffic, the vibes never
              stop.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
            <CreateRoom />
            <JoinRoom />
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-8">
            <div className="group bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/50 transition-all duration-200">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Radio className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                Real-time Sync
              </h3>
              <p className="text-sm text-muted-foreground">
                Everyone in the room sees updates instantly. Add songs, see
                who&apos;s online, all in real-time.
              </p>
            </div>

            <div className="group bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-accent/50 transition-all duration-200">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                Collaborate Together
              </h3>
              <p className="text-sm text-muted-foreground">
                Invite friends to join your room and build the perfect playlist
                together.
              </p>
            </div>

            <div className="group bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/50 transition-all duration-200">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Headphones className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                Spotify Integration
              </h3>
              <p className="text-sm text-muted-foreground">
                Search millions of songs from Spotify and add them to your
                shared playlist.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
