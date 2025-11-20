import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postsAPI } from '../../lib/api';

// Types
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

export interface Like {
  _id: string;
  user: string;
  post: string;
  createdAt: string;
}

// Posts hooks
export const usePosts = (published?: boolean) => {
  return useQuery({
    queryKey: ['posts', published],
    queryFn: () => postsAPI.getUserPosts(published?.toString()),
  });
};

export const useAllPosts = () => {
  return useQuery({
    queryKey: ['posts', 'all'],
    queryFn: async () => {
      const [published, drafts] = await Promise.all([
        postsAPI.getUserPosts('true'),
        postsAPI.getUserPosts('false')
      ]);
      return {
        published: published.posts || [],
        drafts: drafts.posts || []
      };
    },
  });
};

export const usePost = (postId: string) => {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: () => postsAPI.getPost(postId),
    enabled: !!postId,
  });
};

// FIXED: CreatePost now accepts an object with both postData and userId
export const useCreatePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      postData, 
      userId 
    }: { 
      postData: { 
        title: string; 
        content: string; 
        excerpt?: string; 
        coverImage?: string; 
        tags: string[]; 
        published: boolean; 
      };
      userId: string;
    }) => postsAPI.createPost(postData, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

// FIXED: UpdatePost signature matches the mutation pattern
export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      postId, 
      userId, 
      postData 
    }: { 
      postId: string; 
      userId: string; 
      postData: any;
    }) => postsAPI.updatePost(postId, userId, postData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', variables.postId] });
    },
  });
};

// FIXED: DeletePost signature matches the mutation pattern
export const useDeletePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      postId, 
      userId 
    }: { 
      postId: string; 
      userId: string;
    }) => postsAPI.deletePost(postId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};