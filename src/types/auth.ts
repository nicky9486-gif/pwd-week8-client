export type UserType = 'user' | 'admin';
export type SocialProvider = 'google' | 'custom:naver';
export interface AppUser {
  id: string;
  email: string | null;
  name: string;
  avatar: string | null;
  provider: string;
  userType: UserType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface Credentials { email: string; password: string }
export interface SignUpInput extends Credentials { name: string }
export interface AuthResult {
  success: boolean;
  message: string;
  needsConfirmation?: boolean;
}
export interface ProviderState {
  email: { provider: 'email'; enabled: boolean };
  google: { provider: 'google'; enabled: boolean };
  naver: { provider: 'custom:naver'; enabled: boolean };
}
