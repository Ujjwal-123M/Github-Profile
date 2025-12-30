import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GitHubApiService } from '../../services/github-api.service';
import { ActivityOverview, ContributionStats } from '../../interfaces/github-user.interface';

@Component({
  selector: 'app-activity-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activity-overview.component.html',
  styleUrl: './activity-overview.component.css'
})
export class ActivityOverviewComponent implements OnInit {
  @Input() username: string = 'skydoves';
  
  overview: ActivityOverview | null = null;
  stats: ContributionStats | null = null;
  loading = true;
  organizations: any[] = [];

  constructor(private githubService: GitHubApiService) {}

  ngOnInit(): void {
    this.loadActivityOverview();
    this.loadOrganizations();
  }

  /**
   * Load user's organizations from GitHub API
   */
  loadOrganizations(): void {
    this.githubService.getUserOrganizations(this.username).subscribe({
      next: (orgs) => {
        // Transform organizations to match the display format
        this.organizations = orgs.slice(0, 3).map(org => ({
          name: `@${org.login}`,
          icon: org.login.charAt(0).toUpperCase(),
          color: '#0969da',
          html_url: org.html_url
        }));
      },
      error: (err) => {
        console.error('Error loading organizations:', err);
        this.organizations = [];
      }
    });
  }

  loadActivityOverview(): void {
    this.loading = true;
    
    this.githubService.getActivityOverview(this.username).subscribe({
      next: (data) => {
        this.overview = data;
      },
      error: (error) => {
        console.error('Error loading activity overview:', error);
      }
    });

    this.githubService.getContributionStats(this.username).subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading contribution stats:', error);
        this.loading = false;
      }
    });
  }

  getPercentage(type: 'commits' | 'pullRequests' | 'issues' | 'codeReviews'): number {
    if (!this.stats || this.stats.total === 0) return 0;
    const value = this.stats[type];
    return Math.round((value / this.stats.total) * 100);
  }

  getRadarChartPoints(): string {
    if (!this.stats || this.stats.total === 0) {
      return '100,100 100,100 100,100 100,100';
    }

    const commitsPercent = this.getPercentage('commits');
    const prPercent = this.getPercentage('pullRequests');
    const reviewPercent = this.getPercentage('codeReviews');
    const issuesPercent = this.getPercentage('issues');

    // Center at 100,100, radius 80
    const topY = 100 - (reviewPercent * 0.8);
    const rightX = 100 + (issuesPercent * 0.8);
    const bottomY = 100 + (prPercent * 0.8);
    const leftX = 100 - (commitsPercent * 0.8);

    return `${100},${topY} ${rightX},100 ${100},${bottomY} ${leftX},100`;
  }

  getBarPosition(type: 'commits' | 'pullRequests' | 'issues' | 'codeReviews'): number {
    const percent = this.getPercentage(type);
    return 90 - (percent * 0.6);
  }

  getHorizontalBarPosition(type: 'commits'): number {
    const percent = this.getPercentage(type);
    // Extend left from center (90) based on percentage, max 80px from center
    return 90 - (percent * 0.8);
  }

  getVerticalBarPosition(type: 'codeReviews' | 'pullRequests'): number {
    const percent = this.getPercentage(type);
    if (type === 'codeReviews') {
      // Extend up from center (90) based on percentage
      return 90 - (percent * 0.8);
    } else {
      // Extend down from center (90) based on percentage
      return 90 + (percent * 0.8);
    }
  }

  getIssuesBarPosition(): number {
    const percent = this.getPercentage('issues');
    // Extend right from center (90) based on percentage
    return 90 + (percent * 0.8);
  }

  // Helper getters for template binding
  get codeReviewPosition(): number {
    return this.getVerticalBarPosition('codeReviews');
  }

  get pullRequestPosition(): number {
    return this.getVerticalBarPosition('pullRequests');
  }

  get commitsPosition(): number {
    return this.getHorizontalBarPosition('commits');
  }

  get issuesPosition(): number {
    return this.getIssuesBarPosition();
  }
}
