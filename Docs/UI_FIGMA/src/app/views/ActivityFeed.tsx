import { ActivityCard } from "../components/game/ActivityCard";
import { activities } from "../data/mockData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

export function ActivityFeed() {
  return (
    <div className="w-full min-h-screen bg-[#121212] pb-12">
      <div className="max-w-4xl mx-auto px-6 pt-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Activity Feed</h1>
          <p className="text-gray-400">Stay updated with your friends' gaming activities</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-[#1a1a1a] border border-gray-800 mb-6">
            <TabsTrigger 
              value="all"
              className="data-[state=active]:bg-[#bb86fc] data-[state=active]:text-white"
            >
              All Activity
            </TabsTrigger>
            <TabsTrigger 
              value="friends"
              className="data-[state=active]:bg-[#bb86fc] data-[state=active]:text-white"
            >
              Friends Only
            </TabsTrigger>
            <TabsTrigger 
              value="ratings"
              className="data-[state=active]:bg-[#bb86fc] data-[state=active]:text-white"
            >
              Ratings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {activities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </TabsContent>

          <TabsContent value="friends" className="space-y-4">
            {activities.filter(a => a.action !== 'now_playing').map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </TabsContent>

          <TabsContent value="ratings" className="space-y-4">
            {activities.filter(a => a.action === 'rated').map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </TabsContent>
        </Tabs>

        {/* Load More */}
        <div className="mt-8 text-center">
          <button className="px-8 py-3 bg-gray-800 hover:bg-[#bb86fc] text-white font-semibold rounded-lg transition-colors">
            Load More Activities
          </button>
        </div>
      </div>
    </div>
  );
}
