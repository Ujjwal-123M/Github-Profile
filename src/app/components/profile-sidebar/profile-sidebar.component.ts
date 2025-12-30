/**
 * Profile Sidebar Component
 * Displays user profile information in the left sidebar
 * Shows avatar, user details, stats, achievements, sponsors, highlights, and organizations
 */
import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GitHubUser, Achievement, Sponsor, Highlight, Organization } from '../../interfaces/github-user.interface';
import { GitHubApiService } from '../../services/github-api.service';

@Component({
  selector: 'app-profile-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-sidebar.component.html',
  styleUrl: './profile-sidebar.component.css'
})
export class ProfileSidebarComponent implements OnInit, OnChanges {
  @Input() user: GitHubUser | null = null; // User data passed from parent component
  
  // Profile sections data - initialized as empty arrays
  achievements: Achievement[] = [];
  sponsors: Sponsor[] = [];
  highlights: Highlight[] = [];
  organizations: Organization[] = [];

  constructor(private githubService: GitHubApiService) {}

  /**
   * Initialize component - Load all profile sections data dynamically
   * Called automatically when component is created
   */
  ngOnInit(): void {
    if (this.user) {
      this.loadOrganizations();
      this.loadAchievements();
      // Note: Sponsors and Highlights are not available via GitHub API
      // They remain empty arrays and sections won't display if no data
    }
  }

  /**
   * Handle input changes - Reload data when user changes
   * Called whenever the @Input() user property changes
   */
  ngOnChanges(changes: SimpleChanges): void {
    // Reload data when user input changes
    if (changes['user'] && this.user) {
      this.loadOrganizations();
      this.loadAchievements();
    }
  }

  /**
   * Load user's achievements
   * Note: GitHub doesn't have a public API for achievements yet
   * This method is prepared for when the API becomes available
   */
  loadAchievements(): void {
    if (!this.user) return;
    
    // Call the API service method (which currently returns empty array)
    // When GitHub API adds achievements endpoint, it will automatically work
    this.githubService.getUserAchievements(this.user.login).subscribe({
      next: (achievements) => {
        this.achievements = achievements;
      },
      error: (err) => {
        console.error('Error loading achievements:', err);
        this.achievements = [];
      }
    });
  }

  /**
   * Load user's organizations from GitHub API
   * Only displays section if organizations exist
   */
  loadOrganizations(): void {
    if (!this.user) return;
    
    this.githubService.getUserOrganizations(this.user.login).subscribe({
      next: (orgs) => {
        this.organizations = orgs;
      },
      error: (err) => {
        console.error('Error loading organizations:', err);
        this.organizations = [];
      }
    });
  }

  /**
   * Get avatar URL with proper fallback
   * Returns user's avatar_url if valid, otherwise returns GitHub identicon
   */
  getAvatarUrl(): string {
    if (this.user && this.user.avatar_url && this.user.avatar_url.trim() !== '') {
      return this.user.avatar_url;
    }
    if (this.user && this.user.login) {
      return `https://github.com/identicons/${this.user.login}.png`;
    }
    return 'https://github.com/identicons/github.png';
  }

  /**
   * Handle image loading errors
   * Falls back to GitHub identicon if avatar fails to load
   */
  handleImageError(event: any): void {
    if (this.user && this.user.login) {
      event.target.src = 'https://github.com/identicons/' + this.user.login + '.png';
    } else {
      event.target.src = 'https://github.com/identicons/github.png';
    }
  }
}

