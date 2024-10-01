// return format: 1988-11-23
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};


// return format: December 25, 1998
export const formatDateToLocal = (dateStr: string | Date) => {
  const date = new Date(dateStr);
  const formatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return formatter.format(date);
};

export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validateName = (name: string): boolean => {
  const re = /^[a-zA-Z\s'-.]+$/;
  return re.test(name);
};

export const onPhoneNumKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  // Allow only numbers, hypen, backspace, delete and arrow keys
  if (
    !/[0-9]/.test(e.key) &&
    e.key !== 'Backspace' &&
    e.key !== 'Delete' &&
    e.key !== 'ArrowLeft' &&
    e.key !== 'ArrowRight'
  ) {
    e.preventDefault();
  }
}

export const getLastLoginStatus = (dateString: string): string => {
  const givenDate = new Date(dateString);
  const currentDate = new Date();
  
  // Calculate the difference in time
  const diffTime = currentDate.getTime() - givenDate.getTime();
  
  // Convert difference to days
  const diffDays = diffTime / (1000 * 3600 * 24);
  
  // Return "Active" if within the last 31 days
  if (diffDays < 31) {
    return "Active";
  }

  // Calculate the difference in months
  const diffMonths = Math.floor(diffDays / 30); // Rough approximation for months

  if (diffMonths === 1) {
    return "Last login a month ago";
  } else {
    return `Last login ${diffMonths} months ago`;
  }
}

export const getFileContentType = (file: File): string => {
  const ext = file.name.split('.').pop()!.toLowerCase();
  switch (ext) {
    case 'mp4':
      return 'video/mp4';
    case 'avi':
      return 'video/x-msvideo'; // Common MIME type for .avi
    case 'mov':
      return 'video/quicktime'; // Common MIME type for .mov
    case 'wmv':
      return 'video/x-ms-wmv'; // Common MIME type for .wmv
    case 'mkv':
      return 'video/x-matroska'; // Common MIME type for .mkv
    default:
      return 'application/octet-stream';
  }
};

export const truncatedText = (text: string, max: number): string => {
  return text.length > max ? text.substring(0, max) + "..." : text;
};