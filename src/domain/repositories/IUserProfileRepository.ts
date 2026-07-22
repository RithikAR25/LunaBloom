import type { UserProfile } from '../models/UserProfile';

export interface IUserProfileRepository {
  /** Returns the single user profile, or null on first launch */
  get(): Promise<UserProfile | null>;
  save(profile: UserProfile): Promise<void>;
  update(data: Partial<UserProfile>): Promise<void>;
}
