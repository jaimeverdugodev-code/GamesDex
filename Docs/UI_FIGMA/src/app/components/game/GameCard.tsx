import { Star } from "lucide-react";
import { Game } from "../../data/mockData";
import { Link } from "react-router";

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  return (
    <Link to={`/game/${game.id}`} className="group block">
      <div className="relative overflow-hidden rounded-lg bg-gray-900 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-[#bb86fc]/20">
        <img
          src={game.cover}
          alt={game.name}
          className="w-full aspect-[2/3] object-cover"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 fill-[#03dac6] text-[#03dac6]" />
              <span className="text-white font-semibold">{game.rating.toFixed(1)}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {game.platforms.slice(0, 3).map((platform) => (
                <span
                  key={platform}
                  className="px-2 py-1 bg-gray-800/80 rounded text-xs text-gray-300"
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <h3 className="mt-2 text-white font-semibold line-clamp-1 group-hover:text-[#bb86fc] transition-colors">
        {game.name}
      </h3>
      <div className="flex items-center gap-2 mt-1">
        <Star className="w-3 h-3 fill-[#03dac6] text-[#03dac6]" />
        <span className="text-sm text-gray-400">{game.rating.toFixed(1)}</span>
        <span className="text-sm text-gray-600">•</span>
        <span className="text-sm text-gray-400">{game.genres[0]}</span>
      </div>
    </Link>
  );
}
