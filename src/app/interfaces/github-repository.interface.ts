export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  forks_count: number;
  updated_at: string;
  private: boolean;
  fork: boolean;
  parent?: {
    full_name: string;
  };
}

