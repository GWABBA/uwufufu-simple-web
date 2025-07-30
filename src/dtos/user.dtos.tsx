export interface SimpleUser {
  id?: number;
  name?: string;
  profileImage?: string;
}

export interface User extends SimpleUser {
  email?: string;
  createdAt?: string;
  updatedAt?: string;
  isVerified?: boolean;
  tier?: string;
  subscriptionEndDate?: Date;
  isAdmin?: boolean;
}
