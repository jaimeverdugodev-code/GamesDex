import { Edit, Users, Clock, Gamepad2 } from "lucide-react";
import { GameCard } from "../components/game/GameCard";
import { currentUser, myRatedGames } from "../data/mockData";

export function Profile() {
  return (
    <div className="w-full min-h-screen bg-[#121212] pb-12">
      <div className="max-w-[1400px] mx-auto pt-16">
        {/* Banner */}
        <div className="relative h-[300px] overflow-hidden">
          <img
            src={currentUser.banner}
            alt="Profile banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#121212]" />
        </div>

        {/* Profile Info */}
        <div className="px-6 -mt-24 relative z-10">
          <div className="flex items-end justify-between mb-8">
            <div className="flex items-end gap-6">
              {/* Avatar */}
              <img
                src={currentUser.avatar}
                alt={currentUser.username}
                className="w-40 h-40 rounded-full ring-8 ring-[#121212] shadow-2xl"
              />
              
              {/* User Info */}
              <div className="pb-4">
                <h1 className="text-4xl font-bold text-white mb-2">
                  {currentUser.username}
                </h1>
                <p className="text-gray-400 max-w-2xl">{currentUser.bio}</p>
              </div>
            </div>

            {/* Edit Button */}
            <button className="flex items-center gap-2 px-6 py-3 bg-[#bb86fc] hover:bg-[#a370e6] text-white font-semibold rounded-lg transition-colors mb-4">
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-6 mb-12">
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Gamepad2 className="w-5 h-5 text-[#bb86fc]" />
                <span className="text-gray-400">Games Played</span>
              </div>
              <p className="text-3xl font-bold text-white">
                {currentUser.gamesPlayed}
              </p>
            </div>

            <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-[#bb86fc]" />
                <span className="text-gray-400">Followers</span>
              </div>
              <p className="text-3xl font-bold text-white">
                {currentUser.followers.toLocaleString()}
              </p>
            </div>

            <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-[#03dac6]" />
                <span className="text-gray-400">Following</span>
              </div>
              <p className="text-3xl font-bold text-white">
                {currentUser.following.toLocaleString()}
              </p>
            </div>

            <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-[#03dac6]" />
                <span className="text-gray-400">Hours Played</span>
              </div>
              <p className="text-3xl font-bold text-white">
                {currentUser.hoursPlayed.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Favorite Platforms */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Favorite Platforms</h2>
            <div className="flex gap-3">
              {currentUser.favoritePlatforms.map((platform) => (
                <div
                  key={platform}
                  className="px-6 py-3 bg-gradient-to-r from-[#bb86fc] to-[#03dac6] text-white font-semibold rounded-lg"
                >
                  {platform}
                </div>
              ))}
            </div>
          </div>

          {/* My Rated Games */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">My Rated Games</h2>
              <button className="text-[#bb86fc] hover:text-[#a370e6] font-semibold transition-colors">
                View All
              </button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {myRatedGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
