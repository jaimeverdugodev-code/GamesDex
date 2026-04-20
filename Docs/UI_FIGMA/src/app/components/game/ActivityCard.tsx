import { Star, Heart, MessageCircle, Bookmark } from "lucide-react";
import { Activity } from "../../data/mockData";

interface ActivityCardProps {
  activity: Activity;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const getActionText = () => {
    switch (activity.action) {
      case "rated":
        return "rated";
      case "added_to_wishlist":
        return "added to wishlist";
      case "completed":
        return "completed";
      case "now_playing":
        return "started playing";
      default:
        return "interacted with";
    }
  };

  const getActionIcon = () => {
    switch (activity.action) {
      case "rated":
        return <Star className="w-4 h-4 fill-[#03dac6] text-[#03dac6]" />;
      case "added_to_wishlist":
        return <Bookmark className="w-4 h-4 text-[#bb86fc]" />;
      case "completed":
        return <div className="w-4 h-4 bg-[#03dac6] rounded-full flex items-center justify-center">
          <span className="text-[#121212] text-xs">✓</span>
        </div>;
      case "now_playing":
        return <div className="w-4 h-4 bg-[#bb86fc] rounded-full animate-pulse" />;
    }
  };

  return (
    <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-800 hover:border-[#bb86fc]/30 transition-all">
      <div className="flex gap-4">
        {/* User Avatar */}
        <img
          src={activity.userAvatar}
          alt={activity.userName}
          className="w-12 h-12 rounded-full ring-2 ring-gray-700"
        />

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <p className="text-white">
                <span className="font-semibold hover:text-[#bb86fc] cursor-pointer">
                  {activity.userName}
                </span>{" "}
                <span className="text-gray-400">{getActionText()}</span>{" "}
                <span className="font-semibold text-[#bb86fc]">{activity.game}</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">{activity.timestamp}</p>
            </div>
            <div className="flex-shrink-0">
              {getActionIcon()}
            </div>
          </div>

          {/* Game Thumbnail & Rating */}
          <div className="flex items-center gap-3">
            <img
              src={activity.gameCover}
              alt={activity.game}
              className="w-24 h-14 object-cover rounded"
            />
            {activity.rating && (
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < activity.rating!
                        ? "fill-[#03dac6] text-[#03dac6]"
                        : "text-gray-700"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-6 mt-4">
            <button className="flex items-center gap-2 text-gray-400 hover:text-[#bb86fc] transition-colors">
              <Heart className="w-4 h-4" />
              <span className="text-sm">32</span>
            </button>
            <button className="flex items-center gap-2 text-gray-400 hover:text-[#bb86fc] transition-colors">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">8</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
