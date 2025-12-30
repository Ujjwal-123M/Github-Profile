import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GitHubApiService } from '../../services/github-api.service';
import { ContributionStats, ContributionActivity } from '../../interfaces/github-user.interface';

@Component({
  selector: 'app-contribution-activity',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contribution-activity.component.html',
  styleUrl: './contribution-activity.component.css'
})
export class ContributionActivityComponent implements OnInit {
  @Input() username: string = 'skydoves';
  
  stats: ContributionStats | null = null;
  activities: ContributionActivity[] = [];
  loading = true;

  constructor(private githubService: GitHubApiService) {}

  ngOnInit(): void {
    this.loadContributionData();
  }

  loadContributionData(): void {
    this.loading = true;
    
    this.githubService.getContributionStats(this.username).subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (error) => {
        console.error('Error loading contribution stats:', error);
      }
    });

    this.githubService.getContributionActivity(this.username).subscribe({
      next: (activities) => {
        this.activities = activities;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading contribution activity:', error);
        this.loading = false;
      }
    });
  }

  getPercentage(type: 'commits' | 'pullRequests' | 'issues' | 'codeReviews'): number {
    if (!this.stats || this.stats.total === 0) return 0;
    const value = this.stats[type];
    return Math.round((value / this.stats.total) * 100);
  }

  getCurrentMonth(): string {
    const now = new Date();
    return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
}
