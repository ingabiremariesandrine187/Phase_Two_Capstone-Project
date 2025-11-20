'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Save, Eye, Tag, FileText, Upload, Image as ImageIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import { postsAPI, uploadAPI } from '../../lib/api'; 

// Dynamically import Jodit to avoid SSR issues
const JoditEditor = dynamic(() => import('jodit-react'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
      <div className="text-gray-500">Loading editor...</div>
    </div>
  )
});

interface PostData {
  title: string;
  content: string;
  tags: string[];
  excerpt?: string;
  coverImage?: string;
  published: boolean;
}

export default function NewPostPage() {
  const { status, data: session } = useSession();
  const router = useRouter();
  
  const [post, setPost] = useState<PostData>({
    title: '',
    content: '',
    tags: [],
    excerpt: '',
    coverImage: '',
    published: false
  });
  const [newTag, setNewTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Fixed Jodit editor configuration with proper styling
  const editorConfig = {
    readonly: false,
    placeholder: 'Tell your story...',
    uploader: {
      insertImageAsBase64URI: true,
      imagesExtensions: ['jpg', 'png', 'jpeg', 'gif'],
    },
    image: {
      edit: false,
      resize: false,
    },
    buttons: [
      'bold', 'italic', 'underline', 'strikethrough', '|',
      'ul', 'ol', '|',
      'outdent', 'indent', '|',
      'font', 'fontsize', 'brush', '|',
      'image', 'video', '|',
      'align', '|',
      'link', '|',
      'source'
    ],
    height: 500,
    style: {
      'color': '#000000', // Ensure black text
      'font-size': '18px',
      'line-height': '1.6',
      'font-family': 'Georgia, serif'
    },
    controls: {
      fontsize: {
        list: ['8', '10', '12', '14', '16', '18', '24', '30', '36', '48']
      }
    }
  };

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  const handleAddTag = () => {
    if (newTag.trim() && post.tags.length < 5) {
      setPost({
        ...post,
        tags: [...post.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setPost({
      ...post,
      tags: post.tags.filter(tag => tag !== tagToRemove)
    });
  };

  // ✅ UPDATED: Image upload using real API
  const handleImageUpload = async (file: File) => {
    setImageUploading(true);
    try {
      const response = await uploadAPI.uploadImage(file);
      
      setPost({
        ...post,
        coverImage: response.imageUrl
      });
      
      alert('Cover image uploaded successfully!');
    } catch (error: any) {
      alert(error.message || 'Failed to upload image');
      console.error('Upload error:', error);
    } finally {
      setImageUploading(false);
    }
  };

  // ✅ UPDATED: Save draft using real API
  const handleSaveDraft = async () => {
    if (!post.title.trim() && !post.content.trim()) {
      alert('Please add some content before saving');
      return;
    }

    setIsSaving(true);
    try {
      const userId = (session?.user as any)?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const response = await postsAPI.createPost({
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        coverImage: post.coverImage,
        tags: post.tags,
        published: false // false for draft
      }, userId);

      if (response.success) {
        alert('Draft saved successfully!');
        // Optionally redirect to drafts page or reset form
      } else {
        throw new Error(response.error || 'Failed to save draft');
      }
    } catch (error: any) {
      console.error('Save error:', error);
      alert(error.message || 'Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ UPDATED: Publish using real API
  const handlePublish = async () => {
    if (!post.title.trim() || !post.content.trim()) {
      alert('Please add a title and content before publishing');
      return;
    }

    setIsPublishing(true);
    try {
      const userId = (session?.user as any)?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const response = await postsAPI.createPost({
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        coverImage: post.coverImage,
        tags: post.tags,
        published: true // true for publish
      }, userId);

      if (response.success) {
        alert('Post published successfully!');
        router.push(`/posts/${response.post.slug}`);
      } else {
        throw new Error(response.error || 'Failed to publish post');
      }
    } catch (error: any) {
      console.error('Publish error:', error);
      alert(error.message || 'Failed to publish post');
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePreview = () => {
    // Store the current post data for preview
    const previewData = {
      ...post,
      author: session?.user,
      createdAt: new Date().toISOString(),
      id: 'preview'
    };
    
    sessionStorage.setItem('previewData', JSON.stringify(previewData));
    window.open('/preview', '_blank');
  };

  // Calculate stats
  const wordCount = post.content.trim() ? post.content.trim().split(/\s+/).length : 0;
  const charCount = post.content.length;
  const readTime = Math.ceil(wordCount / 200) || 1;

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Editor - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cover Image Upload */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="w-4 h-4 text-gray-600" />
                <h3 className="font-serif font-bold text-gray-800">Cover Image</h3>
              </div>
              {post.coverImage ? (
                <div className="relative">
                  <img 
                    src={post.coverImage} 
                    alt="Cover" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => setPost({...post, coverImage: ''})}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors w-6 h-6 flex items-center justify-center text-sm"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-4">Upload a cover image</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                    disabled={imageUploading}
                    className="hidden"
                    id="cover-upload"
                  />
                  <label
                    htmlFor="cover-upload"
                    className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer text-sm ${
                      imageUploading 
                        ? 'bg-gray-400 text-white cursor-not-allowed' 
                        : 'bg-[#1a5f3f] text-white hover:bg-[#155035] hover:shadow-md'
                    }`}
                  >
                    <span>{imageUploading ? 'Uploading...' : 'Choose Image'}</span>
                  </label>
                </div>
              )}
            </div>

            {/* Title Input */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <input
                type="text"
                placeholder="Title..."
                value={post.title}
                onChange={(e) => setPost({...post, title: e.target.value})}
                className="w-full text-4xl font-serif font-bold text-gray-900 placeholder-gray-500 outline-none bg-transparent caret-[#1a5f3f]"
              />
            </div>

            {/* Excerpt Input */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <textarea
                placeholder="Add a brief excerpt (optional)..."
                value={post.excerpt}
                onChange={(e) => setPost({...post, excerpt: e.target.value})}
                className="w-full text-lg text-gray-900 placeholder-gray-500 outline-none bg-transparent resize-none leading-relaxed caret-[#1a5f3f]"
                rows={2}
              />
            </div>
            
            {/* Rich Text Editor */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <style jsx global>{`
                .jodit-wysiwyg {
                  color: #000000 !important;
                  font-size: 18px !important;
                  line-height: 1.6 !important;
                  font-family: Georgia, serif !important;
                }
                .jodit-container .jodit-wysiwyg * {
                  color: inherit !important;
                }
              `}</style>
              <JoditEditor
                value={post.content}
                config={editorConfig}
                onBlur={(newContent: string) => setPost({...post, content: newContent})}
                onChange={(newContent: string) => setPost({...post, content: newContent})}
              />
            </div>

            {/* Action Buttons - Moved to bottom of editor section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleSaveDraft}
                    disabled={isSaving || (!post.title.trim() && !post.content.trim())}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-serif text-sm"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
                  </button>
                  
                  <button
                    onClick={handlePreview}
                    disabled={!post.content.trim()}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-serif text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Preview</span>
                  </button>
                </div>
                
                <button
                  onClick={handlePublish}
                  disabled={isPublishing || !post.title.trim() || !post.content.trim()}
                  className="flex items-center space-x-2 px-6 py-2 bg-[#1a5f3f] text-white rounded-lg hover:bg-[#155035] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 font-serif text-sm font-medium shadow-sm"
                >
                  <span>{isPublishing ? 'Publishing...' : 'Publish'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-6">
            {/* Publishing Tips */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-serif font-bold text-gray-800 mb-4">Publishing Tips</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Use clear, descriptive titles</li>
                <li>• Break content into sections</li>
                <li>• Add relevant tags</li>
                <li>• Include a compelling intro</li>
                <li>• Proofread before publishing</li>
              </ul>
            </div>

            {/* Tags Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-4 h-4 text-gray-600" />
                <h3 className="font-serif font-bold text-gray-800">Tags</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Add up to 5 tags to help readers find your article
              </p>
              
              {/* Tag Input */}
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Add a tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1a5f3f] focus:border-[#1a5f3f] transition-colors"
                  disabled={post.tags.length >= 5}
                />
                <button
                  onClick={handleAddTag}
                  disabled={post.tags.length >= 5 || !newTag.trim()}
                  className="px-4 py-2 bg-[#1a5f3f] text-white rounded-lg hover:bg-[#155035] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium"
                >
                  Add
                </button>
              </div>
              
              {/* Tags List */}
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm transition-colors hover:bg-gray-200"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-500 transition-colors text-lg leading-none w-4 h-4 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Article Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-gray-600" />
                <h3 className="font-serif font-bold text-gray-800">Article Stats</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Words:</div>
                  <div className="font-serif font-bold text-gray-800">{wordCount}</div>
                </div>
                <div>
                  <div className="text-gray-600">Characters:</div>
                  <div className="font-serif font-bold text-gray-800">{charCount}</div>
                </div>
                <div>
                  <div className="text-gray-600">Read time:</div>
                  <div className="font-serif font-bold text-gray-800">{readTime} min</div>
                </div>
                <div>
                  <div className="text-gray-600">Tags:</div>
                  <div className="font-serif font-bold text-gray-800">{post.tags.length}/5</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}