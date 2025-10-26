import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RankingDto } from 'src/app/models/ranking.model';
import { RankingService } from 'src/app/services/ranking/ranking.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-ranking',
  templateUrl: './ranking.component.html',
  styleUrls: ['./ranking.component.css']
})
export class RankingComponent implements OnInit {
  sidebarOpen = false;
  rankingList: RankingDto[] = [];
  backendError = '';
  successMessage = '';

  private rankingService: RankingService;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    this.rankingService = new RankingService(this.http);
  }

  ngOnInit(): void {
    this.loadRanking();
  }

  loadRanking(): void {
    this.rankingService.getRanking().subscribe({
      next: (data) => {
        const rankingData = data || [];

        rankingData.sort((a, b) => b.totalGoalsAchieved - a.totalGoalsAchieved);

        this.rankingList = rankingData;
      },
      error: (err) => {
        console.error('Erro ao buscar ranking', err);
        this.showError(err, 'Erro ao carregar o ranking');
      }
    });
  }

  getLevelColor(level: string): string {
    switch (level) {
      case 'Iniciante': return '#E74C3C';
      case 'Aprendendo': return '#E67E22';
      case 'Intermediário': return '#F1C40F';
      case 'Avançado': return '#2ECC71';
      case 'Especialista': return '#3498DB';
      case 'Mestre': return '#9B59B6';
      case 'Controlador': return '#FFD700';
      default: return '';
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout(): void {
    sessionStorage.removeItem('env');
    this.router.navigate(['/environments']);
  }

  formatDate(dateStr: string | null): string {
    return dateStr || '';
  }

  private showError(err: any, defaultMessage: string): void {
    this.backendError = err?.error || defaultMessage;
    setTimeout(() => {
      this.backendError = '';
    }, 5000);
  }

  closeError(): void {
    this.backendError = '';
    this.successMessage = '';
  }
}