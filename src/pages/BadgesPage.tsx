
import React from 'react';
import { ArrowLeft, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { stickers } from '@/utils/badgeData';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserStore } from '@/services/meetupService';
import Navigation from '@/components/Navigation';

const BadgesPage = () => {
  const navigate = useNavigate();
  const { level } = useUserStore();
  
  // Display level starting from 1, and make sure the first two badges are available
  const displayLevel = level;
  
  return (
    <div className="pb-20">
      <div className="p-4 pt-6 flex justify-between items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-medium">
          <span className="font-bold">i</span>mpulse
        </h1>
        <div className="w-8" /> {/* Empty div for balanced layout */}
      </div>

      <header className="p-4">
        <div className="flex items-center">
          <Trophy className="h-7 w-7 mr-2 text-primary" />
          <h1 className="text-2xl font-bold">Badges</h1>
        </div>
        <p className="text-muted-foreground">
          Collect badges as you level up and participate
        </p>
      </header>

      <Tabs defaultValue="all" className="px-4">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="all">All Badges</TabsTrigger>
          <TabsTrigger value="unlocked">Unlocked</TabsTrigger>
          <TabsTrigger value="locked">Locked</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <ScrollArea className="h-[calc(100vh-250px)] pr-4">
            <div className="space-y-6 pb-8">
              {stickers.map((sticker, index) => {
                const IconComponent = sticker.icon;
                // First two badges are always unlocked (level 1 and 2)
                const isUnlocked = sticker.level <= displayLevel || sticker.level <= 2;
                
                return (
                  <Card key={index} className={`${isUnlocked ? '' : 'opacity-70'}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center">
                          <div className={`p-2 rounded-full mr-3 ${sticker.color} bg-primary/10`}>
                            <IconComponent className="h-8 w-8" />
                          </div>
                          {sticker.name}
                        </CardTitle>
                        <div className="text-sm font-medium px-3 py-1 rounded-full bg-muted">
                          Level {sticker.level}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm">
                        {sticker.description || "Unlock this badge to reveal its meaning"}
                      </CardDescription>
                      {!isUnlocked && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          You'll unlock this at level {sticker.level}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="unlocked">
          <ScrollArea className="h-[calc(100vh-250px)] pr-4">
            <div className="space-y-6 pb-8">
              {stickers.filter(s => s.level <= displayLevel || s.level <= 2).map((sticker, index) => {
                const IconComponent = sticker.icon;
                
                return (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center">
                          <div className={`p-2 rounded-full mr-3 ${sticker.color} bg-primary/10`}>
                            <IconComponent className="h-8 w-8" />
                          </div>
                          {sticker.name}
                        </CardTitle>
                        <div className="text-sm font-medium px-3 py-1 rounded-full bg-muted">
                          Level {sticker.level}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm">
                        {sticker.description}
                      </CardDescription>
                      <div className="mt-2 text-xs text-primary">
                        Unlocked!
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="locked">
          <ScrollArea className="h-[calc(100vh-250px)] pr-4">
            <div className="space-y-6 pb-8">
              {stickers.filter(s => s.level > displayLevel && s.level > 2).map((sticker, index) => {
                const IconComponent = sticker.icon;
                
                return (
                  <Card key={index} className="opacity-70">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center">
                          <div className="p-2 rounded-full mr-3 bg-muted text-muted-foreground">
                            <IconComponent className="h-8 w-8" />
                          </div>
                          {sticker.name}
                        </CardTitle>
                        <div className="text-sm font-medium px-3 py-1 rounded-full bg-muted">
                          Level {sticker.level}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm">
                        Unlock this badge to reveal its meaning
                      </CardDescription>
                      <div className="mt-2 text-xs text-muted-foreground">
                        You'll unlock this at level {sticker.level}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <Navigation />
    </div>
  );
};

export default BadgesPage;
