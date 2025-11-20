import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { socialAPI } from '@/lib/api';

export const useLikes = (identifier: string, userId?: string) => {
  return useQuery({
    queryKey: ['likes', identifier, userId],
    queryFn: () => socialAPI.getLikes(identifier, userId),
    enabled: !!identifier,
  });
};

export const useLikePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      identifier, 
      userId 
    }: { 
      identifier: string; 
      userId: string;
    }) => socialAPI.likePost(identifier, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['likes', variables.identifier] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

export const useUnlikePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      identifier, 
      userId 
    }: { 
      identifier: string; 
      userId: string;
    }) => socialAPI.unlikePost(identifier, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['likes', variables.identifier] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

export const useFollowUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      targetUserId, 
      currentUserId 
    }: { 
      targetUserId: string; 
      currentUserId: string;
    }) => socialAPI.followUser(targetUserId, currentUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

export const useUnfollowUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      targetUserId, 
      currentUserId 
    }: { 
      targetUserId: string; 
      currentUserId: string;
    }) => socialAPI.unfollowUser(targetUserId, currentUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};