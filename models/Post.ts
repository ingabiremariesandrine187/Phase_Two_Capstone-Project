import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IPost extends Document {
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  tags: string[];
  author: mongoose.Types.ObjectId;
  slug: string;
  published: boolean;
  publishedAt?: Date;
  readTime: number;
  wordCount: number;
  likes: mongoose.Types.ObjectId[];
  views: number;
  comments?: Array<{
    _id: string;
    content: string;
    user: mongoose.Types.ObjectId;
    createdAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    excerpt: {
      type: String,
      maxlength: [300, 'Excerpt cannot exceed 300 characters'],
      trim: true,
    },
    coverImage: {
      type: String,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    published: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    },
    readTime: {
      type: Number,
      default: 1,
    },
    wordCount: {
      type: Number,
      default: 0,
    },
    likes: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    views: {
      type: Number,
      default: 0,
    },
    comments: [{
      _id: String,
      content: String,
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  {
    timestamps: true,
  }
);

// Generate slug from title before saving
postSchema.pre('save', function (next) {
  const doc = this as any;
  
  if (doc.isModified('title') || !doc.slug) {
    doc.slug = doc.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 100);
  }

  // Set publishedAt if publishing for the first time
  if (doc.isModified('published') && doc.published && !doc.publishedAt) {
    doc.publishedAt = new Date();
  }

  // Calculate word count and read time
  if (doc.isModified('content')) {
    const words = doc.content.trim().split(/\s+/).length;
    doc.wordCount = words;
    doc.readTime = Math.ceil(words / 200) || 1;
  }

  next();
});

// ✅ FIXED: Remove duplicate slug index - only keep one
// Index for better query performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ published: 1, publishedAt: -1 });
postSchema.index({ tags: 1 });
// postSchema.index({ slug: 1 }); // REMOVED - already unique: true on the field

export const Post: Model<IPost> = mongoose.models.Post || mongoose.model<IPost>('Post', postSchema);