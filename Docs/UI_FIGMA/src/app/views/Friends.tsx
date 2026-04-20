import { UserPlus, Users } from "lucide-react";

export function Friends() {
  const mockFriends = [
    {
      id: 1,
      username: "GamerPro_87",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
      status: "Online",
      currentGame: "Cyberpunk 2077"
    },
    {
      id: 2,
      username: "NightOwl_Gaming",
      avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop",
      status: "Playing",
      currentGame: "Baldur's Gate 3"
    },
    {
      id: 3,
      username: "ElitePlayer_99",
      avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop",
      status: "Away",
      currentGame: null
    },
    {
      id: 4,
      username: "PixelMaster",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop",
      status: "Offline",
      currentGame: null
    }
  ];

  return (
    <div className="w-full min-h-screen bg-[#121212] pb-12">
      <div className="max-w-5xl mx-auto px-6 pt-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Friends</h1>
            <p className="text-gray-400">Connect and play with your gaming community</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-[#bb86fc] hover:bg-[#a370e6] text-white font-semibold rounded-lg transition-colors">
            <UserPlus className="w-5 h-5" />
            Add Friends
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-[#bb86fc]" />
              <span className="text-gray-400">Total Friends</span>
            </div>
            <p className="text-3xl font-bold text-white">156</p>
          </div>

          <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-gray-400">Online Now</span>
            </div>
            <p className="text-3xl font-bold text-white">23</p>
          </div>

          <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 bg-[#bb86fc] rounded-full animate-pulse" />
              <span className="text-gray-400">Playing</span>
            </div>
            <p className="text-3xl font-bold text-white">8</p>
          </div>
        </div>

        {/* Friends List */}
        <div className="space-y-4">
          {mockFriends.map((friend) => (
            <div
              key={friend.id}
              className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 flex items-center justify-between hover:border-[#bb86fc]/30 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={friend.avatar}
                    alt={friend.username}
                    className="w-16 h-16 rounded-full ring-2 ring-gray-700"
                  />
                  <div
                    className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-[#1a1a1a] ${
                      friend.status === "Online"
                        ? "bg-green-500"
                        : friend.status === "Playing"
                        ? "bg-[#bb86fc]"
                        : friend.status === "Away"
                        ? "bg-yellow-500"
                        : "bg-gray-500"
                    }`}
                  />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">
                    {friend.username}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {friend.currentGame ? (
                      <span>
                        Playing <span className="text-[#bb86fc]">{friend.currentGame}</span>
                      </span>
                    ) : (
                      friend.status
                    )}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
                  View Profile
                </button>
                <button className="px-4 py-2 bg-[#bb86fc] hover:bg-[#a370e6] text-white rounded-lg transition-colors">
                  Invite to Game
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
