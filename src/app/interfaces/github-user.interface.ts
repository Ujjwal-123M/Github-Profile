export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  bio: string | null;
  twitter_username: string | null;
  linkedin_username?: string | null; // LinkedIn username (not provided by GitHub API, but can be added via custom API)
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  icon: string;
  count?: number;
}

export interface Sponsor {
  id: string;
  login: string;
  avatar_url: string;
  html_url: string;
}

export interface Highlight {
  id: string;
  type: string;
  label: string;
  badge?: string;
}

export interface Organization {
  id: string;
  login: string;
  avatar_url: string;
  html_url: string;
}

export interface GitHubEvent {
  id: string;
  type: string;
  actor: {
    login: string;
    avatar_url: string;
  };
  repo: {
    name: string;
    url: string;
  };
  payload: any;
  created_at: string;
}

export interface ActivityOverview {
  totalRepos: number;
  repos: Array<{ name: string; full_name: string; url: string }>;
  contributedRepos: number;
}

export interface ContributionStats {
  commits: number;
  pullRequests: number;
  issues: number;
  codeReviews: number;
  total: number;
}

export interface ContributionActivity {
  date: string;
  type: 'commit' | 'pull_request' | 'issue' | 'code_review';
  description: string;
  repo: string;
  details?: string;
  count?: number;
  url?: string;
}

export interface ContributionDay {
  date: string;
  contributionCount: number;
  color: string;
  level: number;
}

export interface ContributionWeek {
  contributionDays: ContributionDay[];
}

export interface ContributionData {
  totalContributions: number;
  weeks: ContributionWeek[];
}

