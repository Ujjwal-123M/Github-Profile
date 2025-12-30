import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { ContributionData, ContributionWeek, ContributionDay } from '../interfaces/github-user.interface';

@Injectable({
  providedIn: 'root'
})
export class ContributionApiService {
  private username = 'shreeramk'; // Default username - CHANGE THIS to update default profile

  constructor(private http: HttpClient) {}

  /**
   * Fetch GitHub contribution data
   * Note: GitHub doesn't have a public API for contribution graph
   * This service fetches the SVG and parses it, or uses a proxy service
   */
  getContributions(username: string = this.username): Observable<ContributionData> {
    // Using GitHub Contributions API v4
    // https://github-contributions-api.jogruber.de/v4/
    // Request last year's data
    const proxyUrl = `https://github-contributions-api.jogruber.de/v4/${username}?y=last`;
    
    return this.http.get<any>(proxyUrl).pipe(
      map((data: any) => {
        console.log('Raw contribution API response:', data);
        
        // Check for API errors
        if (data.error) {
          console.error('API returned error:', data.error);
          throw new Error(data.error);
        }
        
        // Get total contributions - API returns total.lastYear when using ?y=last
        // Or it could be in data.total object with year keys
        let totalContributions = 0;
        if (data.total) {
          if (data.total.lastYear !== undefined) {
            totalContributions = data.total.lastYear;
          } else {
            // Sum all years if multiple years returned
            totalContributions = Object.values(data.total).reduce((sum: number, val: any) => {
              return sum + (typeof val === 'number' ? val : 0);
            }, 0);
          }
        }
        
        const contributions: ContributionData = {
          totalContributions: totalContributions,
          weeks: []
        };

        // The API returns contributions as a flat array: [{ date, count, level }, ...]
        // We need to convert this to weeks format for the component
        if (data.contributions && Array.isArray(data.contributions) && data.contributions.length > 0) {
          contributions.weeks = this.convertContributionsToWeeks(data.contributions);
        }

        // Calculate total if not provided
        if (contributions.totalContributions === 0 && contributions.weeks.length > 0) {
          contributions.totalContributions = contributions.weeks.reduce((sum, week) => 
            sum + week.contributionDays.reduce((s, day) => s + day.contributionCount, 0), 0
          );
        }

        // If no valid data was parsed, throw error to trigger mock data fallback
        if (contributions.weeks.length === 0) {
          console.warn('API returned empty weeks data, falling back to mock data');
          throw new Error('Empty contribution data from API');
        }

        console.log('Parsed contributions:', {
          totalContributions: contributions.totalContributions,
          weeksCount: contributions.weeks.length,
          totalDays: contributions.weeks.reduce((sum, week) => sum + week.contributionDays.length, 0)
        });
        return contributions;
      }),
      catchError((error) => {
        console.error('Error fetching contributions from API, using mock data:', error);
        // Return mock data if API fails or returns empty data
        const mockData = this.getMockContributions(username);
        console.log('Using mock contribution data:', mockData);
        return of(mockData);
      })
    );
  }

  /**
   * Convert flat contributions array to weeks format
   * API returns: [{ date: "2024-01-01", count: 5, level: 2 }, ...]
   * We need: [{ contributionDays: [{ date, contributionCount, color, level }] }]
   */
  private convertContributionsToWeeks(contributions: Array<{date: string, count: number, level: number}>): ContributionWeek[] {
    const weeks: ContributionWeek[] = [];
    let currentWeek: ContributionDay[] = [];
    let currentWeekStart: Date | null = null;

    contributions.forEach((contribution: any) => {
      const date = new Date(contribution.date);
      
      // Get the Sunday of this week
      const dayOfWeek = date.getDay();
      const sunday = new Date(date);
      sunday.setDate(date.getDate() - dayOfWeek);
      sunday.setHours(0, 0, 0, 0);
      
      // If this is a new week, start a new week array
      if (!currentWeekStart || sunday.getTime() !== currentWeekStart.getTime()) {
        // Save previous week if it exists
        if (currentWeek.length > 0) {
          weeks.push({ contributionDays: currentWeek });
        }
        // Start new week
        currentWeek = [];
        currentWeekStart = new Date(sunday);
      }
      
      // Add day to current week
      currentWeek.push({
        date: contribution.date,
        contributionCount: contribution.count || 0,
        color: this.getColorForCount(contribution.count || 0),
        level: contribution.level !== undefined ? contribution.level : this.getContributionLevel(contribution.count || 0)
      });
    });
    
    // Don't forget the last week
    if (currentWeek.length > 0) {
      weeks.push({ contributionDays: currentWeek });
    }
    
    // Ensure all weeks have 7 days (pad with empty days if needed)
    const paddedWeeks: ContributionWeek[] = [];
    weeks.forEach((week, weekIndex) => {
      const paddedDays: ContributionDay[] = [];
      const firstDay = new Date(week.contributionDays[0].date);
      const weekStart = new Date(firstDay);
      weekStart.setDate(firstDay.getDate() - firstDay.getDay()); // Get Sunday
      
      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(weekStart);
        currentDate.setDate(weekStart.getDate() + i);
        const dateStr = currentDate.toISOString().split('T')[0];
        
        const existingDay = week.contributionDays.find(d => d.date === dateStr);
        if (existingDay) {
          paddedDays.push(existingDay);
        } else {
          // Pad with empty day
          paddedDays.push({
            date: dateStr,
            contributionCount: 0,
            color: this.getColorForCount(0),
            level: 0
          });
        }
      }
      
      paddedWeeks.push({ contributionDays: paddedDays });
    });
    
    return paddedWeeks;
  }

  private getContributionLevel(count: number): number {
    if (count === 0) return 0;
    if (count <= 3) return 1;
    if (count <= 6) return 2;
    if (count <= 10) return 3;
    return 4;
  }

  private getMockContributions(username: string = 'skydoves'): ContributionData {
    // Generate realistic mock contribution data
    // Target: ~5000 contributions for skydoves (or generate proportional data for others)
    const targetContributions = username === 'skydoves' ? 5000 : Math.floor(Math.random() * 3000) + 1000;
    const avgDailyContributions = targetContributions / 365;
    
    const weeks: ContributionWeek[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Go back 371 days (53 weeks) to ensure full year coverage
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 371);
    
    // Find the Sunday of that week (GitHub starts weeks on Sunday)
    const dayOfWeek = startDate.getDay();
    const daysToSunday = dayOfWeek === 0 ? 0 : -dayOfWeek;
    const weekStart = new Date(startDate);
    weekStart.setDate(startDate.getDate() + daysToSunday);
    weekStart.setHours(0, 0, 0, 0);

    let totalGenerated = 0;
    
    // Generate 53 weeks of data
    for (let weekIndex = 0; weekIndex < 53; weekIndex++) {
      const weekDate = new Date(weekStart);
      weekDate.setDate(weekStart.getDate() + (weekIndex * 7));
      
      const days: ContributionDay[] = [];
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const currentDate = new Date(weekDate);
        currentDate.setDate(weekDate.getDate() + dayIndex);
        currentDate.setHours(0, 0, 0, 0);
        
        // Skip future dates
        if (currentDate > today) {
          break;
        }
        
        // Generate contribution count with realistic distribution
        // Most days have some activity, with peaks on certain days
        let count = 0;
        const rand = Math.random();
        const dayOfWeekIndex = currentDate.getDay();
        
        // Higher activity on weekdays (Mon-Fri)
        const isWeekday = dayOfWeekIndex >= 1 && dayOfWeekIndex <= 5;
        
        if (rand < 0.15) {
          // 15% chance of no contributions (mostly weekends)
          count = isWeekday ? (Math.random() < 0.5 ? 0 : Math.floor(Math.random() * 5)) : 0;
        } else if (rand < 0.35) {
          // 20% chance of light activity (1-5)
          count = Math.floor(Math.random() * 5) + 1;
        } else if (rand < 0.60) {
          // 25% chance of medium activity (5-15)
          count = Math.floor(Math.random() * 11) + 5;
        } else if (rand < 0.80) {
          // 20% chance of high activity (15-25)
          count = Math.floor(Math.random() * 11) + 15;
        } else {
          // 20% chance of very high activity (25-40) - peak days
          count = Math.floor(Math.random() * 16) + 25;
        }
        
        // Boost weekday contributions slightly
        if (isWeekday && count > 0) {
          count = Math.floor(count * 1.2);
        }
        
        totalGenerated += count;
        
        days.push({
          date: currentDate.toISOString().split('T')[0],
          contributionCount: count,
          color: this.getColorForCount(count),
          level: this.getContributionLevel(count)
        });
      }
      
      if (days.length > 0) {
        weeks.push({ contributionDays: days });
      }
    }

    // Adjust contributions to match target more closely
    const adjustmentFactor = targetContributions / Math.max(totalGenerated, 1);
    if (Math.abs(adjustmentFactor - 1) > 0.1) {
      weeks.forEach(week => {
        week.contributionDays.forEach(day => {
          if (day.contributionCount > 0) {
            day.contributionCount = Math.max(1, Math.floor(day.contributionCount * adjustmentFactor));
          }
        });
      });
      
      totalGenerated = weeks.reduce((sum, week) => 
        sum + week.contributionDays.reduce((s, day) => s + day.contributionCount, 0), 0
      );
    }

    return {
      totalContributions: totalGenerated,
      weeks
    };
  }

  private getColorForCount(count: number): string {
    // GitHub contribution colors
    if (count === 0) return '#ebedf0';
    if (count <= 3) return '#9be9a8';
    if (count <= 6) return '#40c463';
    if (count <= 10) return '#30a14e';
    return '#216e39';
  }
}

