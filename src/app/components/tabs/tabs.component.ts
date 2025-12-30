import { Component, signal, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.css'
})
export class TabsComponent {
  @Input() activeTab: 'overview' | 'repositories' | 'projects' | 'packages' | 'stars' = 'overview';
  @Input() reposCount?: number;
  @Input() starsCount?: number;
  @Output() tabChange = new EventEmitter<'overview' | 'repositories' | 'projects' | 'packages' | 'stars'>();

  setActiveTab(tab: 'overview' | 'repositories' | 'projects' | 'packages' | 'stars'): void {
    this.tabChange.emit(tab);
  }
}

