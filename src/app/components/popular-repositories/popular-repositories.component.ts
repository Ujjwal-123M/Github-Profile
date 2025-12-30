import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GitHubRepository } from '../../interfaces/github-repository.interface';

@Component({
  selector: 'app-popular-repositories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popular-repositories.component.html',
  styleUrl: './popular-repositories.component.css'
})
export class PopularRepositoriesComponent {
  @Input() repositories: GitHubRepository[] = [];
  @Input() username: string = '';
  @Input() title: string = 'Popular repositories';
  @Input() showCustomizeLink: boolean = true;

  getLanguageColor(language: string): string {
    const colors: { [key: string]: string } = {
      'TypeScript': '#3178c6',
      'JavaScript': '#f1e05a',
      'HTML': '#e34c26',
      'CSS': '#563d7c',
      'Python': '#3572A5',
      'Java': '#b07219',
      'Kotlin': '#A97BFF',
      'Dart': '#00B4AB',
      'Go': '#00ADD8',
      'Rust': '#dea584',
      'C++': '#f34b7d',
      'C': '#555555',
      'C#': '#239120',
      'Ruby': '#701516',
      'PHP': '#4F5D95',
      'Swift': '#FA7343',
      'Shell': '#89e051',
      'Dockerfile': '#384d54',
      'Vue': '#41b883',
      'React': '#61dafb'
    };
    return colors[language] || '#586e75';
  }
}

