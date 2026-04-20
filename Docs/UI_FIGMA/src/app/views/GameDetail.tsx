import { useState } from "react";
import { useParams } from "react-router";
import { Star, Plus, Heart, Share2, Calendar } from "lucide-react";
import { ReviewCard } from "../components/game/ReviewCard";
import { trendingGames, forYouGames, gameReviews } from "../data/mockData";

export function GameDetail() {
  const { id } = useParams();
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const allGames = [...trendingGames, ...forYouGames];
  const game = allGames.find((g) => g.id === Number(id));

  if (!game) {
    return (
      <div className="w-full min-h-screen bg-[#121212] flex items-center justify-center">
        <p className="text-white text-xl">Game not found</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#121212] pb-12">
      <div className="max-w-[1600px] mx-auto pt-16">
        {/* Hero Section */}
        <div className="relative h-[600px] overflow-hidden">
          <img
            src={game.cover}
            alt={game.name}
            className="w-full h-full object-cover blur-2xl scale-110 opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#121212]/50 via-[#121212]/80 to-[#121212]" />
          
          <div className="absolute inset-0 flex items-center px-12">
            <div className="flex gap-12 max-w-[1400px] mx-auto w-full">
              {/* Game Cover */}
              <img
                src={game.cover}
                alt={game.name}
                className="w-[300px] aspect-[2/3] object-cover rounded-xl shadow-2xl"
              />

              {/* Game Info */}
              <div className="flex-1 flex flex-col justify-center">
                <h1 className="text-6xl font-bold text-white mb-4">
                  {game.name}
                </h1>
                
                {/* Meta Info */}
                <div className="flex items-center gap-6 mb-6">
                  <div className="flex items-center gap-2">
                    <Star className="w-6 h-6 fill-[#03dac6] text-[#03dac6]" />
                    <span className="text-3xl font-bold text-white">
                      {game.rating.toFixed(1)}
                    </span>
                  </div>
                  {game.metacriticScore && (
                    <div className="px-4 py-2 bg-green-600 rounded text-white font-bold">
                      {game.metacriticScore} Metacritic
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-300">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(game.releaseDate).getFullYear()}</span>
                  </div>
                </div>

                {/* Platforms & Genres */}
                <div className="flex gap-4 mb-6">
                  <div className="flex gap-2">
                    {game.platforms.map((platform) => (
                      <span
                        key={platform}
                        className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm"
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    {game.genres.map((genre) => (
                      <span
                        key={genre}
                        className="px-3 py-1 bg-[#bb86fc]/20 text-[#bb86fc] rounded-full text-sm font-semibold"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-3xl">
                  {game.description}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button className="flex items-center gap-2 px-8 py-4 bg-[#bb86fc] hover:bg-[#a370e6] text-white font-bold rounded-lg transition-colors text-lg">
                    <Plus className="w-5 h-5" />
                    Add to List
                  </button>
                  <button className="flex items-center gap-2 px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors text-lg">
                    Write Review
                  </button>
                  <button className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                    <Heart className="w-6 h-6 text-white" />
                  </button>
                  <button className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                    <Share2 className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-12 mt-12">
          {/* Your Rating */}
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-8 mb-12">
            <h3 className="text-2xl font-bold text-white mb-4">Rate This Game</h3>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onMouseEnter={() => setHoverRating(rating)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setUserRating(rating)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-10 h-10 ${
                        rating <= (hoverRating || userRating)
                          ? "fill-[#03dac6] text-[#03dac6]"
                          : "text-gray-700"
                      }`}
                    />
                  </button>
                ))}
              </div>
              {userRating > 0 && (
                <span className="text-xl text-white font-semibold">
                  {userRating} / 5
                </span>
              )}
            </div>
          </div>

          {/* Reviews */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white">
                User Reviews ({gameReviews.length})
              </h2>
              <select className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#bb86fc] focus:outline-none">
                <option>Most Helpful</option>
                <option>Most Recent</option>
                <option>Highest Rated</option>
                <option>Lowest Rated</option>
              </select>
            </div>

            <div className="space-y-6">
              {gameReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>

            {/* Load More Reviews */}
            <div className="mt-8 text-center">
              <button className="px-8 py-3 bg-gray-800 hover:bg-[#bb86fc] text-white font-semibold rounded-lg transition-colors">
                Load More Reviews
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
