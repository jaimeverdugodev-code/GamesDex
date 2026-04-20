import { useState } from "react";
import { Search as SearchIcon, Filter, UserPlus } from "lucide-react";
import { GameCard } from "../components/game/GameCard";
import { trendingGames, forYouGames } from "../data/mockData";
import { Checkbox } from "../components/ui/checkbox";

export function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"games" | "users">("games");
  const [platformFilters, setPlatformFilters] = useState<string[]>([]);
  const [genreFilters, setGenreFilters] = useState<string[]>([]);

  const allGames = [...trendingGames, ...forYouGames];

  const filteredGames = allGames.filter((game) => {
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = platformFilters.length === 0 || 
      game.platforms.some(p => platformFilters.includes(p));
    const matchesGenre = genreFilters.length === 0 || 
      game.genres.some(g => genreFilters.includes(g));
    
    return matchesSearch && matchesPlatform && matchesGenre;
  });

  const mockUsers = [
    {
      id: 1,
      username: "GamerPro_87",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
      gamesPlayed: 234,
      mutualFriends: 12
    },
    {
      id: 2,
      username: "NightOwl_Gaming",
      avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop",
      gamesPlayed: 189,
      mutualFriends: 8
    },
    {
      id: 3,
      username: "ElitePlayer_99",
      avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop",
      gamesPlayed: 456,
      mutualFriends: 23
    }
  ];

  const togglePlatformFilter = (platform: string) => {
    setPlatformFilters(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const toggleGenreFilter = (genre: string) => {
    setGenreFilters(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#121212] pb-12">
      <div className="max-w-[1920px] mx-auto px-6 pt-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-6">Search</h1>
          
          {/* Search Bar */}
          <div className="relative max-w-3xl">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for games or users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-[#1a1a1a] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:border-[#bb86fc] focus:outline-none focus:ring-2 focus:ring-[#bb86fc]/20 transition-all"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("games")}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === "games"
                ? "bg-[#bb86fc] text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            Games
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === "users"
                ? "bg-[#bb86fc] text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            Users
          </button>
        </div>

        {activeTab === "games" ? (
          <div className="flex gap-8">
            {/* Filters Sidebar */}
            <div className="w-64 flex-shrink-0">
              <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 sticky top-24">
                <div className="flex items-center gap-2 mb-6">
                  <Filter className="w-5 h-5 text-[#bb86fc]" />
                  <h3 className="text-white font-semibold">Filters</h3>
                </div>

                {/* Platform Filters */}
                <div className="mb-6">
                  <h4 className="text-gray-300 font-semibold mb-3">Platform</h4>
                  <div className="space-y-3">
                    {["PC", "PS5", "Xbox", "Switch"].map((platform) => (
                      <label key={platform} className="flex items-center gap-3 cursor-pointer">
                        <Checkbox
                          checked={platformFilters.includes(platform)}
                          onCheckedChange={() => togglePlatformFilter(platform)}
                          className="border-gray-600 data-[state=checked]:bg-[#bb86fc] data-[state=checked]:border-[#bb86fc]"
                        />
                        <span className="text-gray-400">{platform}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Genre Filters */}
                <div>
                  <h4 className="text-gray-300 font-semibold mb-3">Genre</h4>
                  <div className="space-y-3">
                    {["RPG", "FPS", "Action", "Strategy", "Horror"].map((genre) => (
                      <label key={genre} className="flex items-center gap-3 cursor-pointer">
                        <Checkbox
                          checked={genreFilters.includes(genre)}
                          onCheckedChange={() => toggleGenreFilter(genre)}
                          className="border-gray-600 data-[state=checked]:bg-[#bb86fc] data-[state=checked]:border-[#bb86fc]"
                        />
                        <span className="text-gray-400">{genre}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                {(platformFilters.length > 0 || genreFilters.length > 0) && (
                  <button
                    onClick={() => {
                      setPlatformFilters([]);
                      setGenreFilters([]);
                    }}
                    className="w-full mt-6 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* Games Grid */}
            <div className="flex-1">
              <p className="text-gray-400 mb-6">
                {filteredGames.length} games found
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                {filteredGames.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl">
            <p className="text-gray-400 mb-6">
              {mockUsers.length} users found
            </p>
            <div className="space-y-4">
              {mockUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 flex items-center justify-between hover:border-[#bb86fc]/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-16 h-16 rounded-full ring-2 ring-gray-700"
                    />
                    <div>
                      <h3 className="text-white font-semibold text-lg">
                        {user.username}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {user.gamesPlayed} games played • {user.mutualFriends} mutual friends
                      </p>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-6 py-2 bg-[#bb86fc] hover:bg-[#a370e6] text-white font-semibold rounded-lg transition-colors">
                    <UserPlus className="w-4 h-4" />
                    Add Friend
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
