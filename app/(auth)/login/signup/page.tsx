'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);


    if (!name.trim() || !email.trim() || password.length < 6) {
      toast.error('Please provide a name, valid email and a password (min 6 chars)');
      setLoading(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const bioValue = watch('bio');
  const bioLength = bioValue?.length || 0;

  // Get userId from session (NextAuth exposes as `id`)
  const userId = (session?.user as any)?.id || (session?.user as any)?._id;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user && userId) {
      setValue('name', session.user.name || '');
      setValue('bio', (session.user as any).bio || '');
      setValue('website', (session.user as any).website || '');
      setValue('location', (session.user as any).location || '');
      
      // Fetch user posts
      fetchUserPosts();
    }
  }, [session, setValue, userId]);

  const fetchUserPosts = async () => {
    try {
      setPostsLoading(true);
      setPostsError('');
      
      console.log('🔄 Fetching user posts...', { userId });
      
      if (!userId) {
        console.error(' No user ID available');
        setPostsError('User not authenticated');
        return;
      }

      // Try different approaches to fetch posts
      let publishedPosts: Post[] = [];
      let draftPosts: Post[] = [];

      try {
        // Approach 1: Try with string parameters
        console.log('📝 Trying to fetch posts with string parameters...');
        const [publishedResponse, draftsResponse] = await Promise.all([
          postsAPI.getUserPosts('true').catch(err => {
            console.error('Error fetching published posts with string:', err);
            return { posts: [] };
          }),
          postsAPI.getUserPosts('false').catch(err => {
            console.error('Error fetching draft posts with string:', err);
            return { posts: [] };
          })
        ]);

        publishedPosts = publishedResponse?.posts || [];
        draftPosts = draftsResponse?.posts || [];

        // If no posts found, try alternative approach
        if (publishedPosts.length === 0 && draftPosts.length === 0) {
          console.log('🔄 No posts found with string params, trying alternative...');
          
          // Try fetching all posts and filter locally
          const allPostsResponse = await postsAPI.getUserPosts().catch(err => {
            console.error('Error fetching all posts:', err);
            return { posts: [] };
          });
          
          const allPosts = allPostsResponse?.posts || [];
          publishedPosts = allPosts.filter((post: Post) => post.published);
          draftPosts = allPosts.filter((post: Post) => !post.published);
        }
      } catch (alternativeError) {
        console.error(' Alternative approach failed:', alternativeError);
        
        // Final fallback - empty arrays
        publishedPosts = [];
        draftPosts = [];
      }

      // Combine all posts for display (showing published first)
      const allPosts = [...publishedPosts, ...draftPosts];
      setUserPosts(allPosts);
      
      // Update stats with real data
      setUserStats(prev => ({
        ...prev,
        postsPublished: publishedPosts.length,
        postsDrafted: draftPosts.length,
        totalLikes: publishedPosts.reduce((total: number, post: any) => total + (post.likesCount || 0), 0)
      }));

      console.log('✅ Posts loaded successfully:', {
        published: publishedPosts.length,
        drafts: draftPosts.length,
        total: allPosts.length
      });

    } catch (err: any) {
      console.error(' Failed to fetch user posts:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to load posts. Please try again.';
      setPostsError(errorMessage);
    } finally {
      setPostsLoading(false);
    }
  };

  // DELETE functionality
  const handleDelete = async (postId: string, postTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${postTitle}"? This action cannot be undone.`)) {
>>>>>>> c793961 (working on comments post and get)
      return;
    }

    try {

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.message || 'Signup failed');
        setLoading(false);
        return;

      setPostsError('');
      console.log(' Deleting post:', { postId, userId });
      
      // Check if userId is available
      if (!userId) {
        throw new Error('User ID not found. Please log in again.');
 c793961 (working on comments post and get)
      }

      toast.success('Account created — please sign in');
      // Redirect to login
      router.push('/login');
    } catch (err) {
      console.error('Signup failed', err);
      toast.error('Signup failed — try again');

      console.log(' Post deleted successfully');
      
    } catch (err: any) {
      console.error('❌ Failed to delete post:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to delete post. Please try again.';
      setPostsError(errorMessage);
    }
  };

  // UPDATE publish status
  const handlePublishToggle = async (postId: string, currentStatus: boolean) => {
    try {
      setPostsError('');
      console.log('🔄 Toggling publish status:', { postId, currentStatus, userId });
      
      const newPublishStatus = !currentStatus;
      
      if (!userId) {
        throw new Error('User ID not found. Please log in again.');
      }
      
      // Update post with userId and postData
      await postsAPI.updatePost(postId, userId, {
        published: newPublishStatus
      });
      
      // Update local state
      setUserPosts(prevPosts => 
        prevPosts.map(post => 
          post._id === postId 
            ? { ...post, published: newPublishStatus }
            : post
        )
      );
      
      // Update stats
      setUserStats(prev => ({
        ...prev,
        postsPublished: newPublishStatus ? prev.postsPublished + 1 : prev.postsPublished - 1,
        postsDrafted: !newPublishStatus ? prev.postsDrafted + 1 : prev.postsDrafted - 1
      }));

      console.log(' Publish status updated:', newPublishStatus);
      
    } catch (err: any) {
      console.error(' Failed to update post:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to update post. Please try again.';
      setPostsError(errorMessage);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    setMessage('');

    try {
      // Simulate API call - replace with actual updateProfile API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update session with new data
      await update({
        ...session,
        user: {
          ...session?.user,
          name: data.name,
          bio: data.bio,
          website: data.website,
          location: data.location,
        }
      });

      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      setMessage('Error updating profile');
 c793961 (working on comments post and get)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f6] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-serif font-bold text-[#1a5f3f]">Create an account</h2>
          <p className="text-sm text-gray-600 mt-2">Join and start sharing your stories.</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none text-black"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none text-black"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none text-black"
                placeholder="At least 6 characters"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-[#1a5f3f] text-white rounded-lg hover:bg-[#155035] disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </div>
          </form>
        </div>

        <div className="text-center">
          <a href="/login" className="text-sm text-gray-600 hover:text-[#1a5f3f]">Already have an account? Sign in</a>
        </div>
      </div>
    </div>
  );
}

