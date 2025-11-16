
export const APP_NAME ='public';
export const APP_DESCRIPTION = 'where a great stories come to life ';

export const POST_PER_PAGE =10;
export const COMMENTS_PER_PAGE = 20;

// Image upload settings
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Reading time calculation
export const WORDS_PER_MINUTE = 200;

// Cache revalidation times (in seconds)
export const REVALIDATE_TIME = {
  POSTS_LIST: 60, // 1 minute
  POST_DETAIL: 3600, // 1 hour
  USER_PROFILE: 300, // 5 minutes
};
