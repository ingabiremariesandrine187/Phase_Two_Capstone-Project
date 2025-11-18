// app/new/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Save, Eye, Tag, FileText } from 'lucide-react';

export default function NewPostPage() {
  const { status } = useSession();
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading' || status === 'unauthenticated') {
    return null;
  }

  const handleAddTag = () => {
    if (newTag.trim() && tags.length < 5) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    alert('Draft saved!');
  };

  const handlePreview = () => {
    alert('Preview feature coming soon!');
  };

  // Calculate stats
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;
  const readTime = Math.ceil(wordCount / 200) || 1;

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-serif font-bold text-[#1a5f3f]">
                Publique
              </span>
              <nav className="hidden md:flex ml-8 space-x-6">
                <button className="text-gray-700 hover:text-[#1a5f3f] font-serif transition-colors">
                  Home
                </button>
                <button className="text-gray-700 hover:text-[#1a5f3f] font-serif transition-colors">
                  Explore
                </button>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors font-serif"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
              </button>
              
              <button
                onClick={handlePreview}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-serif"
              >
                <Eye className="w-4 h-4" />
                <span>Preview</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Editor - 2/3 width */}
          <div className="lg:col-span-2">
            {/* Title Input */}
            <input
              type="text"
              placeholder="Title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-4xl font-serif font-bold text-gray-800 placeholder-gray-400 outline-none bg-transparent mb-8"
            />
            
            {/* Content Textarea */}
            <textarea
              placeholder="Tell your story..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-96 text-lg text-gray-700 placeholder-gray-400 outline-none bg-transparent resize-none leading-relaxed"
            />
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-8">
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
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1a5f3f] focus:border-[#1a5f3f]"
                  disabled={tags.length >= 5}
                />
                <button
                  onClick={handleAddTag}
                  disabled={tags.length >= 5 || !newTag.trim()}
                  className="px-4 py-2 bg-[#1a5f3f] text-white rounded-lg hover:bg-[#155035] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  Add
                </button>
              </div>
              
              {/* Tags List */}
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-500 transition-colors"
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}