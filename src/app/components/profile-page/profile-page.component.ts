/**
 * Profile Page Component
 * Main component that displays the GitHub profile page
 * Handles user profile data fetching, tab navigation, and displays all profile sections
 */
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { GitHubApiService } from '../../services/github-api.service';
import { GitHubUser } from '../../interfaces/github-user.interface';
import { GitHubRepository } from '../../interfaces/github-repository.interface';
import { ProfileSidebarComponent } from '../profile-sidebar/profile-sidebar.component';
import { ContributionHeatmapComponent } from '../contribution-heatmap/contribution-heatmap.component';
import { TabsComponent } from '../tabs/tabs.component';
import { PopularRepositoriesComponent } from '../popular-repositories/popular-repositories.component';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer';
import { ActivityOverviewComponent } from '../activity-overview/activity-overview';
import { ContributionActivityComponent } from '../contribution-activity/contribution-activity';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [
    CommonModule,
    ProfileSidebarComponent,
    ContributionHeatmapComponent,
    TabsComponent,
    PopularRepositoriesComponent,
    HeaderComponent,
    FooterComponent,
    ActivityOverviewComponent,
    ContributionActivityComponent,
  ],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css',
})
export class ProfilePageComponent implements OnInit {
  user: GitHubUser | null = null;
  loading = true;
  error: string | null = null;
  username = 'shreeramk'; // Default username - CHANGE THIS to update default profile
  repositories: GitHubRepository[] = [];
  allRepositories: GitHubRepository[] = [];
  starredRepositories: GitHubRepository[] = [];
  projects: any[] = [];
  packages: any[] = [];
  starsCount: number = 0;
  activeTab: 'overview' | 'repositories' | 'projects' | 'packages' | 'stars' = 'overview';

  constructor(
    private githubService: GitHubApiService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  /**
   * Initialize component - Load user profile data
   * Gets username from route parameters or uses default 'skydoves'
   * Subscribes to route changes to handle dynamic username changes
   */
  ngOnInit(): void {
    // Get username from route params or use default
    const routeUsername = this.route.snapshot.params['username'];
    if (routeUsername) {
      this.username = routeUsername;
    }
    this.loadUserProfile();

    // Subscribe to route params for dynamic username changes (when navigating between profiles)
    this.route.params.subscribe((params) => {
      const newUsername = params['username'];
      if (newUsername && newUsername !== this.username) {
        this.username = newUsername;
        this.loadUserProfile();
      }
    });
  }

  /**
   * Load user profile data from GitHub API
   * Fetches user information and related data (repos, starred repos, etc.)
   * Handles errors gracefully
   */
  loadUserProfile(): void {
    this.loading = true;
    this.error = null;
    this.user = null;

    // Fetch user data from GitHub API
    this.githubService.getUser(this.username).subscribe({
      next: (userData) => {
        console.log('User data loaded:', userData);
        this.user = userData;
        this.error = null;
        
        // Load all data from API
        this.loadUserRepositories();
        this.loadStarredRepositories();
        // Projects and packages require authentication in GitHub API, so we leave them empty
        this.projects = [];
        this.packages = [];
        
        this.loading = false;
        console.log('Loading set to:', this.loading, 'User set to:', this.user?.login);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading user profile:', err);
        this.error = `Failed to load user profile: ${err.message || 'Unknown error'}`;
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }


  /**
   * Load user's repositories from GitHub API
   * Fetches all public repositories for the current user
   * Sorts by stars count for popular repositories display
   */
  loadUserRepositories(): void {
    this.githubService.getUserRepositories(this.username, 1, 100).subscribe({
      next: (repos) => {
        this.allRepositories = repos;
        
        // Sort repositories by stars count (descending) for popular repositories
        // Take top 6 most starred repositories for the popular section
        this.repositories = [...repos]
          .sort((a, b) => b.stargazers_count - a.stargazers_count)
          .slice(0, 6);
        
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading repositories:', err);
        this.allRepositories = [];
        this.repositories = [];
        this.cdr.detectChanges();
      },
    });
  }


  /**
   * Load user's starred repositories from GitHub API
   * Fetches repositories that the user has starred
   */
  loadStarredRepositories(): void {
    this.githubService.getStarredRepositories(this.username, 1, 30).subscribe({
      next: (starred) => {
        this.starredRepositories = starred;
        this.starsCount = starred.length;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading starred repositories:', err);
        this.starredRepositories = [];
        this.starsCount = 0;
        this.cdr.detectChanges();
      },
    });
  }

  /**
   * Switch between different profile tabs
   * @param tab - The tab to activate (overview, repositories, projects, packages, or stars)
   */
  setActiveTab(tab: 'overview' | 'repositories' | 'projects' | 'packages' | 'stars'): void {
    this.activeTab = tab;
  }
}
