// Mock data for gaming social network

export interface Game {
  id: number;
  name: string;
  cover: string;
  rating: number;
  platforms: string[];
  genres: string[];
  releaseDate: string;
  description: string;
  metacriticScore?: number;
}

export interface Activity {
  id: number;
  userId: string;
  userName: string;
  userAvatar: string;
  action: 'rated' | 'added_to_wishlist' | 'completed' | 'now_playing';
  game: string;
  gameCover: string;
  rating?: number;
  timestamp: string;
}

export interface UserProfile {
  id: string;
  username: string;
  avatar: string;
  banner: string;
  gamesPlayed: number;
  followers: number;
  following: number;
  hoursPlayed: number;
  bio: string;
  favoritePlatforms: string[];
}

export interface Review {
  id: number;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  timestamp: string;
  helpful: number;
}

export const trendingGames: Game[] = [
  {
    id: 1,
    name: "Cyberpunk 2077",
    cover: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop",
    rating: 4.2,
    platforms: ["PC", "PS5", "Xbox"],
    genres: ["RPG", "Action"],
    releaseDate: "2020-12-10",
    description: "An open-world, action-adventure story set in Night City, a megalopolis obsessed with power, glamour and body modification.",
    metacriticScore: 86
  },
  {
    id: 2,
    name: "Baldur's Gate 3",
    cover: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=600&fit=crop",
    rating: 4.8,
    platforms: ["PC", "PS5"],
    genres: ["RPG", "Strategy"],
    releaseDate: "2023-08-03",
    description: "Gather your party and return to the Forgotten Realms in a tale of fellowship and betrayal, sacrifice and survival.",
    metacriticScore: 96
  },
  {
    id: 3,
    name: "Elden Ring",
    cover: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=600&fit=crop",
    rating: 4.6,
    platforms: ["PC", "PS5", "Xbox"],
    genres: ["RPG", "Action"],
    releaseDate: "2022-02-25",
    description: "A vast world where open fields with a variety of situations and huge dungeons with complex and three-dimensional designs are seamlessly connected.",
    metacriticScore: 96
  },
  {
    id: 4,
    name: "The Witcher 3",
    cover: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&h=600&fit=crop",
    rating: 4.7,
    platforms: ["PC", "PS5", "Xbox", "Switch"],
    genres: ["RPG", "Action"],
    releaseDate: "2015-05-19",
    description: "As war rages on throughout the Northern Realms, you take on the greatest contract of your life — tracking down the Child of Prophecy.",
    metacriticScore: 92
  },
  {
    id: 5,
    name: "Red Dead Redemption 2",
    cover: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=600&fit=crop",
    rating: 4.5,
    platforms: ["PC", "PS5", "Xbox"],
    genres: ["Action", "Adventure"],
    releaseDate: "2018-10-26",
    description: "America, 1899. The end of the Wild West era has begun. After a robbery goes badly wrong, Arthur Morgan must fight to survive.",
    metacriticScore: 97
  },
  {
    id: 6,
    name: "God of War Ragnarök",
    cover: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&h=600&fit=crop",
    rating: 4.6,
    platforms: ["PS5"],
    genres: ["Action", "Adventure"],
    releaseDate: "2022-11-09",
    description: "Kratos and Atreus embark on a mythic journey for answers before Ragnarök arrives.",
    metacriticScore: 94
  },
  {
    id: 7,
    name: "Hades",
    cover: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=600&fit=crop",
    rating: 4.4,
    platforms: ["PC", "PS5", "Xbox", "Switch"],
    genres: ["Action", "Roguelike"],
    releaseDate: "2020-09-17",
    description: "Defy the god of the dead as you hack and slash out of the Underworld in this rogue-like dungeon crawler.",
    metacriticScore: 93
  },
  {
    id: 8,
    name: "Starfield",
    cover: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=400&h=600&fit=crop",
    rating: 3.9,
    platforms: ["PC", "Xbox"],
    genres: ["RPG", "Action"],
    releaseDate: "2023-09-06",
    description: "In this next generation role-playing game set amongst the stars, create any character you want and explore with unparalleled freedom.",
    metacriticScore: 83
  }
];

export const forYouGames: Game[] = [
  {
    id: 9,
    name: "Horizon Forbidden West",
    cover: "https://images.unsplash.com/photo-1511882150382-421056c89033?w=400&h=600&fit=crop",
    rating: 4.3,
    platforms: ["PS5", "PC"],
    genres: ["Action", "RPG"],
    releaseDate: "2022-02-18",
    description: "Join Aloy as she braves the Forbidden West - a majestic but dangerous frontier that conceals mysterious new threats.",
    metacriticScore: 88
  },
  {
    id: 10,
    name: "Resident Evil 4 Remake",
    cover: "https://images.unsplash.com/photo-1516825513084-7a3397fcd108?w=400&h=600&fit=crop",
    rating: 4.5,
    platforms: ["PC", "PS5", "Xbox"],
    genres: ["Horror", "Action"],
    releaseDate: "2023-03-24",
    description: "Survival is just the beginning. Six years have passed since the biological disaster in Raccoon City.",
    metacriticScore: 93
  },
  {
    id: 11,
    name: "Spider-Man 2",
    cover: "https://images.unsplash.com/photo-1608889476561-6242cfdbf622?w=400&h=600&fit=crop",
    rating: 4.7,
    platforms: ["PS5"],
    genres: ["Action", "Adventure"],
    releaseDate: "2023-10-20",
    description: "The incredible power of the symbiote forces Peter and Miles to face the ultimate test of strength, both inside and outside the mask.",
    metacriticScore: 90
  },
  {
    id: 12,
    name: "Hollow Knight",
    cover: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=400&h=600&fit=crop",
    rating: 4.6,
    platforms: ["PC", "PS5", "Xbox", "Switch"],
    genres: ["Metroidvania", "Action"],
    releaseDate: "2017-02-24",
    description: "Forge your own path in Hollow Knight! An epic action adventure through a vast ruined kingdom of insects and heroes.",
    metacriticScore: 87
  },
  {
    id: 13,
    name: "Final Fantasy XVI",
    cover: "https://images.unsplash.com/photo-1580327344181-c1163234e5a0?w=400&h=600&fit=crop",
    rating: 4.2,
    platforms: ["PS5", "PC"],
    genres: ["RPG", "Action"],
    releaseDate: "2023-06-22",
    description: "An epic dark fantasy world where the fate of the land is decided by the mighty Eikons.",
    metacriticScore: 87
  },
  {
    id: 14,
    name: "Sekiro: Shadows Die Twice",
    cover: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=400&h=600&fit=crop",
    rating: 4.5,
    platforms: ["PC", "PS5", "Xbox"],
    genres: ["Action", "Adventure"],
    releaseDate: "2019-03-22",
    description: "Carve your own clever path to vengeance in an all-new adventure from developer FromSoftware.",
    metacriticScore: 90
  },
  {
    id: 15,
    name: "Celeste",
    cover: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=600&fit=crop",
    rating: 4.4,
    platforms: ["PC", "PS5", "Xbox", "Switch"],
    genres: ["Platformer", "Indie"],
    releaseDate: "2018-01-25",
    description: "Help Madeline survive her inner demons on her journey to the top of Celeste Mountain.",
    metacriticScore: 94
  },
  {
    id: 16,
    name: "Doom Eternal",
    cover: "https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=400&h=600&fit=crop",
    rating: 4.3,
    platforms: ["PC", "PS5", "Xbox"],
    genres: ["FPS", "Action"],
    releaseDate: "2020-03-20",
    description: "Hell's armies have invaded Earth. Become the Slayer in an epic single-player campaign to conquer demons.",
    metacriticScore: 88
  }
];

export const activities: Activity[] = [
  {
    id: 1,
    userId: "user1",
    userName: "GamerPro_87",
    userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
    action: "rated",
    game: "Cyberpunk 2077",
    gameCover: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&h=120&fit=crop",
    rating: 4,
    timestamp: "2 hours ago"
  },
  {
    id: 2,
    userId: "user2",
    userName: "NightOwl_Gaming",
    userAvatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop",
    action: "added_to_wishlist",
    game: "Baldur's Gate 3",
    gameCover: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200&h=120&fit=crop",
    timestamp: "4 hours ago"
  },
  {
    id: 3,
    userId: "user3",
    userName: "ElitePlayer_99",
    userAvatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop",
    action: "completed",
    game: "Elden Ring",
    gameCover: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=200&h=120&fit=crop",
    timestamp: "6 hours ago"
  },
  {
    id: 4,
    userId: "user4",
    userName: "PixelMaster",
    userAvatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop",
    action: "rated",
    game: "The Witcher 3",
    gameCover: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=200&h=120&fit=crop",
    rating: 5,
    timestamp: "8 hours ago"
  },
  {
    id: 5,
    userId: "user5",
    userName: "ShadowHunter",
    userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    action: "now_playing",
    game: "Red Dead Redemption 2",
    gameCover: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=200&h=120&fit=crop",
    timestamp: "12 hours ago"
  },
  {
    id: 6,
    userId: "user6",
    userName: "DragonSlayer_2077",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    action: "rated",
    game: "God of War Ragnarök",
    gameCover: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=200&h=120&fit=crop",
    rating: 5,
    timestamp: "1 day ago"
  },
  {
    id: 7,
    userId: "user7",
    userName: "CyberNinja_X",
    userAvatar: "https://images.unsplash.com/photo-1639149888905-fb39731f2e6c?w=100&h=100&fit=crop",
    action: "added_to_wishlist",
    game: "Hades",
    gameCover: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&h=120&fit=crop",
    timestamp: "1 day ago"
  },
  {
    id: 8,
    userId: "user8",
    userName: "RetroGamer_92",
    userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    action: "completed",
    game: "Hollow Knight",
    gameCover: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=200&h=120&fit=crop",
    timestamp: "2 days ago"
  }
];

export const currentUser: UserProfile = {
  id: "currentUser",
  username: "MyGamerTag_2077",
  avatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&h=200&fit=crop",
  banner: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1920&h=400&fit=crop",
  gamesPlayed: 127,
  followers: 2453,
  following: 892,
  hoursPlayed: 3847,
  bio: "Passionate gamer | RPG enthusiast | Speedrunner | Streaming on weekends",
  favoritePlatforms: ["PC", "PS5", "Switch"]
};

export const myRatedGames: Game[] = [
  trendingGames[0],
  trendingGames[1],
  trendingGames[2],
  trendingGames[3],
  forYouGames[0],
  forYouGames[1]
];

export const gameReviews: Review[] = [
  {
    id: 1,
    userId: "user1",
    userName: "GamerPro_87",
    userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
    rating: 5,
    comment: "Absolutely incredible experience! The narrative depth and character development are unmatched. Spent over 100 hours and still discovering new things. The combat system is intuitive yet challenging. Highly recommend for any RPG fan!",
    timestamp: "March 15, 2026",
    helpful: 247
  },
  {
    id: 2,
    userId: "user9",
    userName: "StorySeeker_101",
    userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    rating: 4,
    comment: "Great game with some minor technical issues. The world-building is phenomenal and the choices actually matter. Lost a few hours of progress to a bug, but the devs are actively patching. Still worth every penny.",
    timestamp: "March 12, 2026",
    helpful: 156
  },
  {
    id: 3,
    userId: "user10",
    userName: "RPG_Veteran",
    userAvatar: "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=100&h=100&fit=crop",
    rating: 5,
    comment: "This is what modern RPGs should aspire to be. The attention to detail is staggering. Every quest feels meaningful, and the companion characters are incredibly well-written. The soundtrack is also a masterpiece.",
    timestamp: "March 10, 2026",
    helpful: 412
  },
  {
    id: 4,
    userId: "user11",
    userName: "CasualGamer_55",
    userAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
    rating: 3,
    comment: "Good game but not for everyone. The learning curve is steep and it can be overwhelming for newcomers. Graphics are stunning though, and the lore is deep if you're into that.",
    timestamp: "March 8, 2026",
    helpful: 89
  }
];
