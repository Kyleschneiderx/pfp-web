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
