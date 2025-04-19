
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { levelingApi, UserProgress, LevelInfo, LootBox } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export function useLeveling() {
  const { user } = useAuth();
  const { toast } = useToast();
  const userId = user?.id ? parseInt(user.id) : 0;

  // Get user progress
  const { 
    data: progress,
    isLoading: isLoadingProgress,
    error: progressError,
    refetch: refetchProgress
  } = useQuery({
    queryKey: ['userProgress', userId],
    queryFn: () => levelingApi.getUserProgress(userId),
    enabled: !!userId,
  });

  // Get levels
  const { 
    data: levels,
    isLoading: isLoadingLevels 
  } = useQuery({
    queryKey: ['levels'],
    queryFn: () => levelingApi.getLevels(),
  });

  // Get lootboxes
  const { 
    data: lootboxes,
    isLoading: isLoadingLootboxes,
    refetch: refetchLootboxes
  } = useQuery({
    queryKey: ['lootboxes', userId],
    queryFn: () => levelingApi.getUserLootboxes(userId),
    enabled: !!userId,
  });

  // Open lootbox mutation
  const { mutate: openLootbox } = useMutation({
    mutationFn: ({ lootboxId }: { lootboxId: number }) => 
      levelingApi.openLootbox(userId, lootboxId),
    onSuccess: () => {
      refetchLootboxes();
      toast({
        title: "Lootbox opened!",
        description: "Check your inventory for new items!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error opening lootbox",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    progress: progress?.data,
    levels: levels?.data,
    lootboxes: lootboxes?.data,
    isLoadingProgress,
    isLoadingLevels,
    isLoadingLootboxes,
    progressError,
    openLootbox,
    refetchProgress,
    refetchLootboxes,
  };
}
