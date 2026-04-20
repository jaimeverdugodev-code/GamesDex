import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { GameCard } from "../components/game/GameCard";
import { Skeleton } from "../components/ui/skeleton";
import { trendingGames, forYouGames } from "../data/mockData";

export function Home() {
  const [loading, setLoading] = useState(true);
  const [trendingIndex, setTrendingIndex] = useState(0);

  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const nextTrending = () => {
    setTrendingIndex((prev) => (prev + 1) % (trendingGames.length - 4));
  };

  const prevTrending = () => {
    setTrendingIndex((prev) => (prev - 1 + (trendingGames.length - 4)) % (trendingGames.length - 4));
  };

  return (
    <div className="w-full min-h-screen bg-[#121212] pb-12">
      <div className="max-w-[1920px] mx-auto px-6 pt-24">
        {/* Hero Banner */}
        <div className="relative h-[400px] rounded-2xl overflow-hidden mb-12">
          <img
            src="https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1920&h=400&fit=crop"
            alt="Hero banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent">
            <div className="h-full flex flex-col justify-center px-12 max-w-2xl">
              <h1 className="text-5xl font-bold text-white mb-4">
                Discover Your Next Adventure
              </h1>
              <p className="text-xl text-gray-300 mb-6">
                Connect with gamers worldwide and explore AI-curated game recommendations
              </p>
              <div className="flex gap-4">
                <button className="px-8 py-3 bg-[#bb86fc] hover:bg-[#a370e6] text-white font-semibold rounded-lg transition-colors">
                  Browse Games
                </button>
                <button className="px-8 py-3 bg-transparent border-2 border-white hover:bg-white/10 text-white font-semibold rounded-lg transition-colors">
                  Join Community
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Trending Games Slider */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white">Trending Now</h2>
            <div className="flex gap-2">
              <button
                onClick={prevTrending}
                className="p-2 bg-gray-800 hover:bg-[#bb86fc] rounded-lg transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={nextTrending}
                className="p-2 bg-gray-800 hover:bg-[#bb86fc] rounded-lg transition-colors"
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden">
            <div
              className="flex gap-6 transition-transform duration-500"
              style={{ transform: `translateX(-${trendingIndex * (100 / 5 + 1.5)}%)` }}
            >
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-[calc(20%-19.2px)]">
                    <Skeleton className="w-full aspect-[2/3] rounded-lg bg-gray-800" />
                    <Skeleton className="w-3/4 h-5 mt-2 bg-gray-800" />
                    <Skeleton className="w-1/2 h-4 mt-2 bg-gray-800" />
                  </div>
                ))
              ) : (
                trendingGames.map((game) => (
                  <div key={game.id} className="flex-shrink-0 w-[calc(20%-19.2px)]">
                    <GameCard game={game} />
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* For You - AI Recommended */}
        <section>
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-white mb-2">For You</h2>
            <p className="text-gray-400">AI-curated recommendations based on your preferences</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-6">
            {loading ? (
              [...Array(8)].map((_, i) => (
                <div key={i}>
                  <Skeleton className="w-full aspect-[2/3] rounded-lg bg-gray-800" />
                  <Skeleton className="w-3/4 h-5 mt-2 bg-gray-800" />
                  <Skeleton className="w-1/2 h-4 mt-2 bg-gray-800" />
                </div>
              ))
            ) : (
              forYouGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
