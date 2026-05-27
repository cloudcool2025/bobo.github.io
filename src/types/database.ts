export interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  initiator_id: string;
  opponent_id: string;
  initiator_score: number;
  opponent_score: number;
  initiator_fouls: number;
  opponent_fouls: number;
  initiator_lucky: number;
  opponent_lucky: number;
  winner_id: string | null;
  status: 'pending' | 'playing' | 'finished';
  created_at: string;
  finished_at: string | null;
}

export interface MatchWithProfiles extends Match {
  initiator: UserProfile;
  opponent: UserProfile;
  winner: UserProfile | null;
}

export interface UserStats {
  user_id: string;
  total_matches: number;
  wins: number;
  losses: number;
  win_rate: number;
  total_fouls: number;
  total_lucky: number;
}

export type AuthUser = {
  id: string;
  email: string;
  created_at: string;
};
