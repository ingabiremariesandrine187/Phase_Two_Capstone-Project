import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsAPI } from '../../lib/api';

// Define Comment interface here instead of importing from usePosts
export interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
    image?: string;
  };
  createdAt: string;
  postId: string;
}

export const useComments = (identifier: string) => {
  return useQuery({
    queryKey: ['comments', identifier],
    queryFn: () => commentsAPI.getComments(identifier),
    enabled: !!identifier,
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      identifier, 
      content, 
      userId 
    }: { 
      identifier: string; 
      content: string; 
      userId: string;
    }) => commentsAPI.createComment(identifier, content, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.identifier] });
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      commentId, 
      userId 
    }: { 
      commentId: string; 
      userId: string;
    }) => commentsAPI.deleteComment(commentId, userId),
    onSuccess: (_, variables) => {
      // We need to invalidate all comments queries since we don't know the postId
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
};