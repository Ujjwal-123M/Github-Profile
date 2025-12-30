import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Input,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContributionApiService } from '../../services/contribution-api.service';
import { ContributionData, ContributionDay } from '../../interfaces/github-user.interface';
import * as echarts from 'echarts';

@Component({
  selector: 'app-contribution-heatmap',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contribution-heatmap.component.html',
  styleUrl: './contribution-heatmap.component.css',
})
export class ContributionHeatmapComponent
  implements OnInit, AfterViewInit, OnDestroy, OnChanges, AfterViewChecked
{
  @ViewChild('heatmapChart', { static: false }) heatmapChart!: ElementRef;
  @Input() username: string = 'skydoves';

  contributionData: ContributionData | null = null;
  loading = true;
  error: string | null = null;
  private chart: any = null;
  private hasRendered = false;

  constructor(
    private contributionService: ContributionApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadContributions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['username'] && !changes['username'].firstChange) {
      this.loadContributions();
    }
  }

  ngAfterViewInit(): void {
    // Trigger change detection to ensure view is updated
    this.cdr.detectChanges();

    // If data is already loaded, try to render the chart
    if (this.contributionData && !this.loading && this.contributionData.weeks.length > 0) {
      this.tryRenderChart();
    }
  }

  ngAfterViewChecked(): void {
    // Try to render if we have data but haven't rendered yet
    if (
      !this.hasRendered &&
      this.contributionData &&
      !this.loading &&
      this.contributionData.weeks.length > 0 &&
      this.heatmapChart?.nativeElement
    ) {
      this.tryRenderChart();
    }
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.dispose();
    }
  }

  loadContributions(): void {
    this.loading = true;
    this.error = null;

    this.contributionService.getContributions(this.username).subscribe({
      next: (data) => {
        console.log('Contribution data received:', data);
        this.contributionData = data;
        this.loading = false;
        this.hasRendered = false;

        // Force change detection to update the view
        this.cdr.detectChanges();

        // Use requestAnimationFrame to ensure DOM is updated
        requestAnimationFrame(() => {
          // Try multiple times if element not ready
          this.tryRenderChart();
        });
      },
      error: (err) => {
        console.error('Error loading contributions:', err);
        this.error = 'Failed to load contribution data';
        this.loading = false;
      },
    });
  }

  private tryRenderChart(attempt: number = 0): void {
    const maxAttempts = 20;

    // Check if element exists
    const element = this.heatmapChart?.nativeElement;
    if (element && element.offsetWidth > 0) {
      console.log(
        'Chart element found with dimensions:',
        element.offsetWidth,
        'x',
        element.offsetHeight
      );
      this.renderHeatmap();
      return;
    }

    if (attempt < maxAttempts) {
      if (attempt === 0 || attempt % 5 === 0) {
        console.log(`Chart element not ready, retrying (attempt ${attempt + 1}/${maxAttempts})...`);
        // Force change detection on some attempts
        this.cdr.detectChanges();
      }
      setTimeout(() => this.tryRenderChart(attempt + 1), 50);
    } else {
      console.error('Chart element not found after', maxAttempts, 'attempts');
      console.error('Element reference:', this.heatmapChart);
      console.error('Has contributionData:', !!this.contributionData);
      console.error('Weeks count:', this.contributionData?.weeks?.length);
    }
  }

  renderHeatmap(): void {
    if (!this.contributionData) {
      console.log('Cannot render: no contribution data');
      return;
    }

    const chartElement = this.heatmapChart?.nativeElement;
    if (!chartElement) {
      console.error('Cannot render: chart element not found');
      return;
    }

    console.log('Rendering heatmap, element found:', chartElement);

    // Dispose existing chart if any
    if (this.chart) {
      this.chart.dispose();
      this.chart = null;
    }

    // Prepare data for ECharts calendar heatmap
    const data: Array<[string, number]> = [];

    if (this.contributionData.weeks && this.contributionData.weeks.length > 0) {
      this.contributionData.weeks.forEach((week) => {
        if (week.contributionDays && week.contributionDays.length > 0) {
          week.contributionDays.forEach((day) => {
            if (day && day.date) {
              data.push([day.date, day.contributionCount || 0]);
            }
          });
        }
      });
    }

    if (data.length === 0) {
      console.warn('No contribution data available, weeks:', this.contributionData.weeks?.length);
      // Try to reload or use fallback
      return;
    }

    console.log('Rendering heatmap with', data.length, 'data points');

    // Calculate date range (last year from today)
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 364); // 364 days = 52 weeks

    const startDateStr = this.formatDate(startDate);
    const endDateStr = this.formatDate(endDate);

    // Initialize ECharts with proper container size
    const container = chartElement;

    // Ensure container has dimensions
    if (!container.style.width) {
      container.style.width = '100%';
    }
    if (!container.style.height) {
      container.style.height = '150px';
    }
    if (!container.style.display || container.style.display === 'none') {
      container.style.display = 'block';
    }

    console.log(
      'Initializing ECharts with container:',
      container,
      'Dimensions:',
      container.offsetWidth,
      'x',
      container.offsetHeight
    );

    this.chart = echarts.init(container, null, {
      width: container.offsetWidth || 800,
      height: container.offsetHeight || 150,
    });

    const maxValue = Math.max(...data.map((item) => item[1]), 1);

    // Create pieces for piecewise visualMap to ensure distinct thresholds
    // This ensures 0, 1, 2, 3 contributions each have clearly visible, distinct colors
    const createPieces = (max: number) => {
      const pieces: Array<{min: number, max: number, color: string}> = [
        { min: 0, max: 0, color: '#ebedf0' },  // No contributions - light gray (clearly different)
      ];
      
      if (max >= 1) {
        pieces.push({ min: 1, max: 1, color: '#9be9a8' });  // 1 contribution - light green (clearly visible)
      }
      if (max >= 2) {
        pieces.push({ min: 2, max: 2, color: '#6dd585' });  // 2 contributions - medium-light green (distinct)
      }
      if (max >= 3) {
        pieces.push({ min: 3, max: 3, color: '#40c463' });  // 3 contributions - medium green (distinct)
      }
      if (max >= 4) {
        // For 4-9 contributions, use a darker green
        pieces.push({ min: 4, max: Math.min(9, max), color: '#30a14e' });
      }
      if (max >= 10) {
        // For 10+ contributions, use the darkest green
        pieces.push({ min: 10, max: max, color: '#216e39' });
      }
      
      return pieces;
    };

    const option: any = {
      tooltip: {
        position: 'top',
        backgroundColor: '#1f2328',
        borderColor: '#d0d7de',
        borderWidth: 1,
        textStyle: {
          color: '#ffffff',
          fontSize: 12,
        },
        formatter: (params: any) => {
          const date = params.data[0];
          const count = params.data[1];
          return `<div style="padding: 4px;"><strong>${count}</strong> contributions on ${this.formatDisplayDate(
            date
          )}</div>`;
        },
      },
      visualMap: {
        type: 'piecewise',
        min: 0,
        max: maxValue,
        calculable: false,
        show: false,
        // Use piecewise mapping to ensure distinct thresholds
        // This makes 0, 1, 2, 3 contributions each have clearly different colors
        pieces: createPieces(maxValue),
      },
      calendar: {
        top: 20,
        left: 20,
        right: 10,
        bottom: 10,
        cellSize: [10, 10],
        range: [startDateStr, endDateStr],
        itemStyle: {
          borderWidth: 1,
          borderColor: '#ffffff',
          borderCap: 'round',
          borderRadius: 2,
        },
        splitLine: {
          show: false,
        },
        yearLabel: {
          show: false,
        },
        dayLabel: {
          firstDay: 0,
          nameMap: ['', 'M', '', 'W', '', 'F', ''],
          margin: 4,
          color: '#656d76',
          fontSize: 11,
          fontWeight: 'normal',
          position: 'start',
        },
        monthLabel: {
          nameMap: [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
          ],
          margin: 8,
          color: '#656d76',
          fontSize: 11,
          fontWeight: 'normal',
          position: 'start',
        },
      },
      series: [
        {
          type: 'heatmap',
          coordinateSystem: 'calendar',
          data: data,
          label: {
            show: false,
          },
          itemStyle: {
            borderWidth: 1,
            borderColor: '#ffffff',
            borderRadius: 2,
          },
          emphasis: {
            itemStyle: {
              borderWidth: 1,
              borderColor: '#0969da',
              shadowBlur: 0,
              shadowColor: 'transparent',
              borderRadius: 2,
              opacity: 1,
              // Don't specify color - keeps original contribution color
            },
            focus: 'none', // Don't blur other items
            blurScope: 'none', // Don't blur on hover
            disabled: false,
          },
          // Disable hover effects on other items
          blur: {
            itemStyle: {
              opacity: 1, // Keep full opacity even when not hovered
            },
          },
        },
      ],
    };

    try {
      this.chart.setOption(option, true);
      this.hasRendered = true;
      console.log('Chart rendered successfully with', data.length, 'data points');

      // Force a resize to ensure proper display
      setTimeout(() => {
        if (this.chart) {
          this.chart.resize();
        }
      }, 100);
    } catch (error) {
      console.error('Error rendering chart:', error);
      this.hasRendered = false;
    }

    // Handle resize
    const resizeHandler = () => {
      if (this.chart) {
        this.chart.resize();
      }
    };
    window.addEventListener('resize', resizeHandler);
  }

  private formatDisplayDate(dateStr: string): string {
    const date = new Date(dateStr);
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getTotalContributions(): string {
    if (!this.contributionData) return '0';

    const total =
      this.contributionData.totalContributions ||
      this.contributionData.weeks.reduce(
        (sum, week) => sum + week.contributionDays.reduce((s, day) => s + day.contributionCount, 0),
        0
      );

    return total.toLocaleString();
  }
}
