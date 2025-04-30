
/**
 * Utility functions for user avatars
 */

// Define gender options for avatar generation
type GenderOption = 'male' | 'female' | 'other';

// Define skin tone options to ensure diversity
type SkinToneOption = 'light' | 'medium' | 'dark';

/**
 * Generates a diverse and happy avatar URL using DiceBear avatars
 * @param userId - The user's ID 
 * @param name - The user's name
 * @returns A URL string for the avatar image
 */
export const getAvatarForUser = (userId: string | null, name: string): string => {
  // If no user id or name is provided, return a default avatar
  if (!userId && !name) {
    return "https://api.dicebear.com/7.x/avataaars/svg?seed=default&mouth=smile&eyes=happy";
  }
  
  // Create a deterministic but varied seed based on the name or ID
  const seed = name || userId || 'default';
  
  // Use name or ID hash to deterministically select gender and skin tone
  // This ensures the same person always gets the same avatar
  const nameHash = hashString(seed);
  
  // Determine gender (evenly distributed across options)
  const genderOptions: GenderOption[] = ['male', 'female', 'other'];
  const gender = genderOptions[nameHash % genderOptions.length];
  
  // Determine skin tone (evenly distributed across options)
  const skinToneOptions: SkinToneOption[] = ['light', 'medium', 'dark'];
  const skinTone = skinToneOptions[(nameHash + 1) % skinToneOptions.length];
  
  // Map skin tone to DiceBear skin color parameter
  const skinColor = getSkinColor(skinTone);
  
  // Generate the avatar URL with parameters for happiness and diversity
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&gender=${gender}&mouth=smile&skinColor=${skinColor}&eyes=happy&facialHairProbability=${gender === 'male' ? 50 : 0}&accessories=eyepatch,kurt,prescription02,round,sunglasses&accessoriesProbability=20`;
};

/**
 * Maps skin tone option to DiceBear skinColor parameter
 */
const getSkinColor = (tone: SkinToneOption): string => {
  switch (tone) {
    case 'light':
      return 'pale';
    case 'medium':
      return 'light';
    case 'dark':
      return 'dark';
    default:
      return 'light';
  }
};

/**
 * Simple string hash function to generate a number from a string
 * Used to deterministically select avatar features
 */
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

