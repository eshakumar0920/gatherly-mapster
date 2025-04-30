
// This file fixes the error in the MeetupCard component
// The key part is to fix the instanceof Date check for the dateTime property

// Import only the part with the bug to fix
const formatDate = (meetup: Meetup): string => {
  if (!meetup.dateTime) {
    return "Date unavailable";
  }

  // For already formatted strings like "Today @3pm", just return as is
  if (typeof meetup.dateTime === 'string' && 
      (meetup.dateTime.includes('@') || 
       meetup.dateTime.toLowerCase().includes('today') || 
       meetup.dateTime.toLowerCase().includes('tomorrow'))) {
    return meetup.dateTime;
  }

  // Try to parse as a date for other cases
  try {
    let dateObj: Date | null = null;

    if (typeof meetup.dateTime === 'string') {
      // First try ISO format
      const parsedDate = parseISO(meetup.dateTime);
      if (isValid(parsedDate)) {
        dateObj = parsedDate;
      } else {
        // Try with a more lenient approach
        const fallbackDate = new Date(meetup.dateTime);
        if (isValid(fallbackDate)) {
          dateObj = fallbackDate;
        }
      }
    } else if (meetup.dateTime instanceof Date) {
      dateObj = meetup.dateTime;
    }

    if (dateObj && isValid(dateObj)) {
      return format(dateObj, "MMM d, yyyy h:mm a");
    }

    // If we couldn't parse it, just return the original string
    return typeof meetup.dateTime === 'string' ? meetup.dateTime : "Date unavailable";
  } catch (error) {
    console.error("Error formatting date:", error);
    return typeof meetup.dateTime === 'string' ? meetup.dateTime : "Date unavailable";
  }
};

// Only export the function to be used for fixing the file externally
export { formatDate };
