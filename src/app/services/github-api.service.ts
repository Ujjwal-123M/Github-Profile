/**
 * GitHub API Service
 * Handles all API calls to GitHub's REST API
 * Provides methods to fetch user data, repositories, events, and activity statistics
 */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { GitHubUser, ContributionData, GitHubEvent, ActivityOverview, ContributionStats, ContributionActivity, Achievement } from '../interfaces/github-user.interface';
import { GitHubRepository } from '../interfaces/github-repository.interface';

@Injectable({
  providedIn: 'root'
})
export class GitHubApiService {
  private baseUrl = 'https://api.github.com';
  private username = 'shreeramk'; // Default username - CHANGE THIS to update default profile
  
  // GitHub API requires Accept header for proper responses
  private httpOptions = {
    headers: new HttpHeaders({
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'GitHub-Profile-App' // GitHub recommends identifying your application
    })
  };

  constructor(private http: HttpClient) {}

  /**
   * Fetch user profile data from GitHub API and merge with custom profile extensions
   * @param username - GitHub username (defaults to configured default username)
   * @returns Observable with user profile data (includes LinkedIn from custom API)
   */
  getUser(username: string = this.username): Observable<GitHubUser> {
    // Fetch GitHub user data and custom profile extensions in parallel
    const gitHubUser$ = this.http.get<GitHubUser>(`${this.baseUrl}/users/${username}`, this.httpOptions);
    // Fetch custom profile extensions (LinkedIn, etc.) from API endpoint
    // In production, replace '/assets/user-profile-extension.json' with your actual API endpoint
    const profileExtension$ = this.http.get<{[key: string]: {linkedin_username?: string}}>('/assets/user-profile-extension.json', this.httpOptions).pipe(
      catchError(error => {
        // Profile extensions are optional, return empty object on error
        console.warn('Could not fetch profile extensions:', error);
        return of({});
      })
    );

    return forkJoin({
      user: gitHubUser$,
      extension: profileExtension$
    }).pipe(
      map(({user, extension}) => {
        // Merge GitHub user data with custom profile extensions
        // Type guard to ensure extension has index signature
        const extensionData = extension as {[key: string]: {linkedin_username?: string}};
        const userExtension = extensionData[username] || {};
        return {
          ...user,
          linkedin_username: userExtension.linkedin_username || null
        };
      }),
      catchError(error => {
        // Handle rate limiting and other errors
        if (error.status === 403) {
          throw new Error('GitHub API rate limit exceeded. Please try again later or use a GitHub personal access token for higher limits.');
        }
        throw error;
      })
    );
  }

  getContributions(username: string = this.username): Observable<ContributionData> {
    // GitHub doesn't have a public API for contributions, so we'll scrape the SVG
    // For now, we'll use a mock service and you can integrate with a proxy/service
    // that fetches the contribution graph
    return this.http.get<ContributionData>(`${this.baseUrl}/users/${username}`);
  }

  /**
   * Fetch repositories that the user has starred
   * @param username - GitHub username
   * @param page - Page number for pagination
   * @param perPage - Number of items per page
   * @returns Observable with array of starred repositories
   */
  getStarredRepositories(username: string = this.username, page: number = 1, perPage: number = 30): Observable<GitHubRepository[]> {
    return this.http.get<GitHubRepository[]>(`${this.baseUrl}/users/${username}/starred?page=${page}&per_page=${perPage}`, this.httpOptions).pipe(
      catchError(error => {
        if (error.status === 403) {
          console.warn('GitHub API rate limit exceeded for starred repositories');
        }
        return of([]);
      })
    );
  }

  /**
   * Fetch user's public repositories
   * @param username - GitHub username
   * @param page - Page number for pagination
   * @param perPage - Number of items per page
   * @returns Observable with array of user repositories (sorted by last updated)
   */
  getUserRepositories(username: string = this.username, page: number = 1, perPage: number = 30): Observable<GitHubRepository[]> {
    return this.http.get<GitHubRepository[]>(`${this.baseUrl}/users/${username}/repos?page=${page}&per_page=${perPage}&sort=updated`, this.httpOptions).pipe(
      catchError(error => {
        if (error.status === 403) {
          console.warn('GitHub API rate limit exceeded for repositories');
        }
        return of([]);
      })
    );
  }

  /**
   * Fetch public events for a user (commits, PRs, issues, etc.)
   * @param username - GitHub username
   * @param page - Page number for pagination
   * @param perPage - Number of items per page
   * @returns Observable with array of public events
   */
  getUserEvents(username: string = this.username, page: number = 1, perPage: number = 30): Observable<GitHubEvent[]> {
    return this.http.get<GitHubEvent[]>(`${this.baseUrl}/users/${username}/events/public?page=${page}&per_page=${perPage}`, this.httpOptions).pipe(
      catchError(error => {
        console.error('Error fetching user events:', error);
        return of([]);
      })
    );
  }

  /**
   * Get activity overview data for a user
   * Processes repository data to show contributed repositories and organization info
   * @param username - GitHub username
   * @returns Observable with activity overview data
   */
  getActivityOverview(username: string = this.username): Observable<ActivityOverview> {
    return this.getUserRepositories(username, 1, 100).pipe(
      map((repos) => {
        const repoList = repos.slice(0, 3).map(repo => ({
          name: repo.name,
          full_name: repo.full_name,
          url: repo.html_url
        }));
        
        return {
          totalRepos: repos.length,
          repos: repoList,
          contributedRepos: repos.length
        };
      }),
      catchError(error => {
        console.error('Error fetching activity overview:', error);
        return of({
          totalRepos: 0,
          repos: [],
          contributedRepos: 0
        });
      })
    );
  }

  /**
   * Calculate contribution statistics from user events
   * Analyzes events to count commits, pull requests, issues, and code reviews
   * @param username - GitHub username
   * @returns Observable with contribution statistics
   */
  getContributionStats(username: string = this.username): Observable<ContributionStats> {
    return this.getUserEvents(username, 1, 100).pipe(
      map((events) => {
        // Initialize counters for different contribution types
        let commits = 0;
        let pullRequests = 0;
        let issues = 0;
        let codeReviews = 0;

        events.forEach(event => {
          switch (event.type) {
            case 'PushEvent':
              commits += event.payload.commits?.length || 0;
              break;
            case 'PullRequestEvent':
              if (event.payload.action === 'opened' || event.payload.action === 'closed') {
                pullRequests++;
              }
              break;
            case 'IssuesEvent':
              if (event.payload.action === 'opened') {
                issues++;
              }
              break;
            case 'PullRequestReviewEvent':
              codeReviews++;
              break;
          }
        });

        const total = commits + pullRequests + issues + codeReviews;
        return { commits, pullRequests, issues, codeReviews, total };
      }),
      catchError(error => {
        console.error('Error fetching contribution stats:', error);
        return of({ commits: 0, pullRequests: 0, issues: 0, codeReviews: 0, total: 0 });
      })
    );
  }

  /**
   * Get detailed contribution activity timeline
   * Processes events to create a chronological list of contributions
   * Groups commits by date and includes PRs and issues
   * @param username - GitHub username
   * @returns Observable with array of contribution activities
   */
  getContributionActivity(username: string = this.username): Observable<ContributionActivity[]> {
    return this.getUserEvents(username, 1, 100).pipe(
      map((events) => {
        const activities: ContributionActivity[] = [];
        // Map to group commits by date for aggregation
        const commitMap = new Map<string, { count: number, repos: Set<string> }>();

        events.slice(0, 100).forEach(event => {
          const eventDate = new Date(event.created_at);
          const date = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const repoName = event.repo.name;
          const repoShort = repoName.split('/')[1];

          switch (event.type) {
            case 'PushEvent':
              const commitCount = event.payload.commits?.length || 0;
              if (commitCount > 0) {
                const key = date;
                if (commitMap.has(key)) {
                  const existing = commitMap.get(key)!;
                  existing.count += commitCount;
                  existing.repos.add(repoShort);
                } else {
                  commitMap.set(key, {
                    count: commitCount,
                    repos: new Set([repoShort])
                  });
                }
              }
              break;
            case 'PullRequestEvent':
              if (event.payload.action === 'opened') {
                const pr = event.payload.pull_request;
                activities.push({
                  date,
                  type: 'pull_request',
                  description: `Created a pull request in ${repoName}${pr?.comments_count > 0 ? ` that received ${pr.comments_count} ${pr.comments_count === 1 ? 'comment' : 'comments'}` : ''}`,
                  repo: repoShort,
                  details: pr?.title || 'Pull request',
                  url: pr?.html_url || `https://github.com/${repoName}/pulls`
                });
              }
              break;
            case 'IssuesEvent':
              if (event.payload.action === 'opened') {
                activities.push({
                  date,
                  type: 'issue',
                  description: `Opened an issue in ${repoName}`,
                  repo: repoShort,
                  url: event.payload.issue?.html_url || `https://github.com/${repoName}/issues`
                });
              }
              break;
          }
        });

        // Convert commit map to activities grouped by date
        commitMap.forEach((data, date) => {
          const repoCount = data.repos.size;
          activities.push({
            date,
            type: 'commit',
            description: `Created ${data.count} ${data.count === 1 ? 'commit' : 'commits'} in ${repoCount} ${repoCount === 1 ? 'repository' : 'repositories'}`,
            repo: '',
            count: data.count
          });
        });

        // Sort by date (newest first)
        const sortedActivities = activities
          .sort((a, b) => {
            const dateA = new Date(a.date + ' ' + new Date().getFullYear());
            const dateB = new Date(b.date + ' ' + new Date().getFullYear());
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, 20);

        return sortedActivities;
      }),
      catchError(error => {
        console.error('Error fetching contribution activity:', error);
        return of([]);
      })
    );
  }

  /**
   * Fetch user's organizations from GitHub API
   * @param username - GitHub username
   * @returns Observable with array of organizations
   */
  getUserOrganizations(username: string = this.username): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/users/${username}/orgs`, this.httpOptions).pipe(
      map((orgs) => orgs.map(org => ({
        id: String(org.id),
        login: org.login,
        avatar_url: org.avatar_url,
        html_url: org.html_url
      }))),
      catchError(error => {
        console.error('Error fetching organizations:', error);
        return of([]);
      })
    );
  }

  /**
   * Fetch user's achievements from API
   * Note: GitHub doesn't currently have a public API for achievements
   * This method fetches achievements from a mock API endpoint (JSON file)
   * In production, replace the URL with your actual achievements API endpoint
   * @param username - GitHub username
   * @returns Observable with array of achievements
   */
  getUserAchievements(username: string = this.username): Observable<Achievement[]> {
    // Fetch achievements from API endpoint (currently using local JSON file as mock API)
    // In production, replace '/assets/achievements.json' with your actual API endpoint
    // Example: return this.http.get<{[key: string]: Achievement[]}>(`https://api.example.com/users/${username}/achievements`, this.httpOptions)
    return this.http.get<{[key: string]: Achievement[]}>('/assets/achievements.json', this.httpOptions).pipe(
      map((data) => {
        // Return achievements for the specific username, or empty array if not found
        return data[username] || [];
      }),
      catchError(error => {
        console.error('Error fetching achievements:', error);
        // Return empty array on error (achievements are optional)
        return of([]);
      })
    );
  }
}

