import { Star, ThumbsUp } from "lucide-react";
import { Review } from "../../data/mockData";

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
      <div className="flex gap-4">
        {/* User Avatar */}
        <img
          src={review.userAvatar}
          alt={review.userName}
          className="w-12 h-12 rounded-full ring-2 ring-gray-700"
        />

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h4 className="text-white font-semibold hover:text-[#bb86fc] cursor-pointer">
                {review.userName}
              </h4>
              <p className="text-sm text-gray-500">{review.timestamp}</p>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < review.rating
                      ? "fill-[#03dac6] text-[#03dac6]"
                      : "text-gray-700"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Review Text */}
          <p className="text-gray-300 leading-relaxed mb-4">{review.comment}</p>

          {/* Footer */}
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-gray-300">
              <ThumbsUp className="w-4 h-4" />
              <span className="text-sm">Helpful ({review.helpful})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
