'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  User, 
  Mail, 
  Calendar, 
  Edit3, 
  BookOpen, 
  Heart, 
  BarChart3,
  Settings,
  Camera,
  Check,
  X
} from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  location: z.string().max(100, 'Location too long').optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface UserStats {
  postsPublished: number;
  postsDrafted: number;
  totalLikes: number;
  memberSince: string;
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [userStats, setUserStats] = useState<UserStats>({
    postsPublished: 0,
    postsDrafted: 3,
    totalLikes: 24,
    memberSince: '2025'
  });

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

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      setValue('name', session.user.name || '');
      setValue('bio', (session.user as any).bio || '');
      setValue('website', (session.user as any).website || '');
      setValue('location', (session.user as any).location || '');
    }
  }, [session, setValue]);

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
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form values
    if (session?.user) {
      setValue('name', session.user.name || '');
      setValue('bio', (session.user as any).bio || '');
      setValue('website', (session.user as any).website || '');
      setValue('location', (session.user as any).location || '');
    }
    setMessage('');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Loading your profile...</div>
      </div>
    );
  }

  const user = session?.user;

  // Safe access to extended user properties
  const userBio = (user as any)?.bio || "Passionate writer sharing thoughts and stories with the world. Love exploring new ideas and connecting with readers.";
  const userWebsite = (user as any)?.website || '';
  const userLocation = (user as any)?.location || '';

  return (
    <div className="min-h-screen bg-[#faf9f6] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          {/* Cover Photo */}
          <div className="h-48 bg-gradient-to-r from-[#1a5f3f] to-[#2d7a52] relative">
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          </div>
          
          {/* Profile Info */}
          <div className="px-8 pb-8 -mt-16 relative">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between">
              <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center shadow-lg">
                    {user?.image ? (
                      <img
                        src={user.image}
                        alt={user.name || 'User'}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-[#1a5f3f] flex items-center justify-center text-white text-4xl font-bold">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <button className="absolute bottom-2 right-2 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white hover:bg-gray-600 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                {/* User Basic Info */}
                <div className="space-y-2">
                  {isEditing ? (
                    <input
                      {...register('name')}
                      type="text"
                      className="text-3xl font-serif font-bold text-gray-900 bg-transparent border-b-2 border-[#1a5f3f] outline-none"
                    />
                  ) : (
                    <h1 className="text-3xl font-serif font-bold text-gray-900">
                      {user?.name}
                    </h1>
                  )}
                  
                  <div className="flex items-center space-x-4 text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Mail className="w-4 h-4" />
                      <span>{user?.email}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {userStats.memberSince}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 mt-4 md:mt-0">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSubmit(onSubmit)}
                      disabled={isLoading}
                      className="flex items-center space-x-2 px-4 py-2 bg-[#1a5f3f] text-white rounded-lg hover:bg-[#155035] disabled:opacity-50 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      <span>{isLoading ? 'Saving...' : 'Save'}</span>
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>
            </div>

            {/* Bio */}
            <div className="mt-6 max-w-2xl">
              {isEditing ? (
                <div>
                  <textarea
                    {...register('bio')}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f] focus:border-[#1a5f3f] outline-none resize-none"
                    placeholder="Tell your story..."
                    defaultValue={userBio}
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>Share what makes you unique</span>
                    <span>{bioLength}/500</span>
                  </div>
                  {errors.bio && (
                    <p className="text-red-600 text-sm mt-1">{errors.bio.message}</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-700 text-lg leading-relaxed">
                  {userBio}
                </p>
              )}
            </div>

            {/* Additional Info - Show only if exists or in edit mode */}
            {(userWebsite || userLocation || isEditing) && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                {isEditing ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Website
                      </label>
                      <input
                        {...register('website')}
                        type="url"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f] focus:border-[#1a5f3f] outline-none"
                        placeholder="https://example.com"
                        defaultValue={userWebsite}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <input
                        {...register('location')}
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f] focus:border-[#1a5f3f] outline-none"
                        placeholder="Your city, country"
                        defaultValue={userLocation}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {userWebsite && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <span className="font-medium">Website:</span>
                        <a href={userWebsite} target="_blank" rel="noopener noreferrer" className="text-[#1a5f3f] hover:underline">
                          {userWebsite}
                        </a>
                      </div>
                    )}
                    {userLocation && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <span className="font-medium">Location:</span>
                        <span>{userLocation}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats and Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-serif font-bold text-gray-800 mb-6 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Your Stats
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <BookOpen className="w-5 h-5 text-[#1a5f3f]" />
                    <span className="text-gray-700">Published</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{userStats.postsPublished}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Edit3 className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-700">Drafts</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{userStats.postsDrafted}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Heart className="w-5 h-5 text-red-500" />
                    <span className="text-gray-700">Total Likes</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{userStats.totalLikes}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
              <h2 className="text-xl font-serif font-bold text-gray-800 mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Quick Actions
              </h2>
              
              <div className="space-y-2">
                <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  Account Settings
                </button>
                <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  Reading History
                </button>
                <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  Notifications
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-2">
            {/* Message Alert */}
            {message && (
              <div className={`mb-6 p-4 rounded-lg ${
                message.includes('Error') 
                  ? 'bg-red-50 text-red-700 border border-red-200' 
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}>
                {message}
              </div>
            )}

            {/* Recent Activity Placeholder */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-serif font-bold text-gray-800 mb-6">
                Recent Activity
              </h2>
              
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-serif text-gray-600 mb-2">No activity yet</h3>
                <p className="text-gray-500 mb-4">Start writing to see your activity here</p>
                <button 
                  onClick={() => router.push('/new')}
                  className="px-6 py-2 bg-[#1a5f3f] text-white rounded-lg hover:bg-[#155035] transition-colors"
                >
                  Write Your First Story
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}