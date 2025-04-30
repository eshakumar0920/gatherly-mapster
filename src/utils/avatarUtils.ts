
/**
 * Utility functions for user avatars
 */

/**
 * Generates a simple avatar for a user based on their name
 * @param userId - The user's ID
 * @param name - The user's name
 * @returns A string with the user's initials
 */
export const getAvatarForUser = (userId: string | null, name: string): string | null => {
  // If no user id or name is provided, return null
  if (!userId && !name) return null;
  
  // Return the first letter of the name or "U" for unknown
  return name ? name.charAt(0).toUpperCase() : "U";
};
