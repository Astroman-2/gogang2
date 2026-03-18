export const ROLES = {
  ADMIN: 'Admin',
  PHYSICIAN: 'Physician',
  CLINICIAN: 'Clinician',
};

export const APPOINTMENT_STATUSES = {
  PENDING: 'Pending Auth',
  AUTHORIZED: 'Authorized',
  COMPLETED: 'Completed',
};

export const PAYMENT_STATUSES = {
  PENDING: 'Pending',
  PAID: 'Paid',
  OVERDUE_30: 'Overdue 30 Days',
  OVERDUE_60: 'Overdue 60 Days',
  OVERDUE_90: 'Overdue 90+ Days',
};

export const APPOINTMENT_TYPES = {
  CHECKUP: 'Checkup',
  CONSULTATION: 'Consultation',
  FOLLOW_UP: 'Follow-Up',
  PROCEDURE: 'Procedure',
  EMERGENCY: 'Emergency',
};

export const GENDER = {
  MALE: 'Male',
  FEMALE: 'Female',
  OTHER: 'Other',
};

export const BLOOD_TYPES = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
];

export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getStatusColor = (status) => {
  const colors = {
    [APPOINTMENT_STATUSES.PENDING]: 'yellow',
    [APPOINTMENT_STATUSES.AUTHORIZED]: 'blue',
    [APPOINTMENT_STATUSES.COMPLETED]: 'green',
    [PAYMENT_STATUSES.PENDING]: 'yellow',
    [PAYMENT_STATUSES.PAID]: 'green',
    [PAYMENT_STATUSES.OVERDUE_30]: 'orange',
    [PAYMENT_STATUSES.OVERDUE_60]: 'red',
    [PAYMENT_STATUSES.OVERDUE_90]: 'red',
  };
  return colors[status] || 'gray';
};
