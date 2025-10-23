import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  AchievementsDistributionDto,
  BalanceOverTimeDto,
  FilterForBalanceOverTimeDto,
  FiltersForBalanceProjectionDto,
  FinancialControlLevelEnum,
  FinancialSummaryDto,
  GoalsSummaryDto,
  ProjectedBalanceDto,
  TopRecurringGoalsAchievedDto,
  UnexpectedExpensesAnalysisDto
} from 'src/app/models/dashboard.model';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  sidebarOpen = false;

  // Data properties
  financialSummary: FinancialSummaryDto | null = null;
  balanceOverTime: BalanceOverTimeDto[] = [];
  goalsSummary: GoalsSummaryDto | null = null;
  unexpectedExpenses: UnexpectedExpensesAnalysisDto | null = null;
  topGoals: TopRecurringGoalsAchievedDto[] = [];
  goalsDistribution: AchievementsDistributionDto[] = [];
  balanceProjection: ProjectedBalanceDto[] = [];
  isEditingBalance = false;
  editedBalance = 0;

  // Chart data
  balanceChartData: any;
  balanceChartOptions: any;
  goalsDonutData: any;
  goalsDonutOptions: any;
  distributionChartData: any;
  distributionChartOptions: any;
  projectionChartData: any;
  projectionChartOptions: any;

  // Filters
  balanceFilter: FilterForBalanceOverTimeDto = {
    startDate: '',
    endDate: ''
  };

  projectionFilter: FiltersForBalanceProjectionDto = {
    periodValue: 6,
    isYear: false
  };

  //paginação
  currentPage = 1;
  itemsPerPage = 2;
  paginatedGoals: any[] = [];
  totalPages = 1;

  // Messages
  backendError = '';
  successMessage = '';
  loading = false;

  constructor(
    private dashboardService: DashboardService,
    private router: Router,
  ) {
    this.initializeFilters();
    this.initializeChartOptions();
  }

  ngOnInit(): void {
    this.loadAllData();
  }

  private initializeFilters(): void {
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 6);

    this.balanceFilter.startDate = sixMonthsAgo.toISOString().split('T')[0];
    this.balanceFilter.endDate = today.toISOString().split('T')[0];
  }

  private initializeChartOptions(): void {
    this.balanceChartOptions = {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Período' }
        },
        y: {
          title: { display: true, text: 'Saldo (R$)' },
          ticks: {
            callback: (value: any) => this.formatCurrency(value)
          }
        }
      }
    };

    this.goalsDonutOptions = {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        title: {
          display: true
        }
      }
    };

    this.distributionChartOptions = {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true
        }
      },
      scales: {
        x: { title: { display: true, text: 'Tipo de Período' } },
        y: { title: { display: true, text: 'Total de Conquistas' } }
      }
    };

    this.projectionChartOptions = {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true
        }
      },
      scales: {
        x: { title: { display: true, text: 'Período' } },
        y: {
          title: { display: true, text: 'Saldo Projetado (R$)' },
          ticks: {
            callback: (value: any) => this.formatCurrency(value)
          }
        }
      }
    };
  }

  loadAllData(): void {
    this.loading = true;

    this.dashboardService.updateEnvironmentBalance().subscribe({
      next: () => {
        this.loadFinancialSummary();
        this.loadBalanceOverTime();
        this.loadGoalsSummary();
        this.loadUnexpectedExpenses();
        this.loadTopGoals();
        this.loadGoalsDistribution();
        this.loadBalanceProjection();
      },
      error: (err) => {
        console.error('Erro ao atualizar metas', err);
        this.showError(err, 'Erro ao atualizar metas antes de carregar a lista');
      }
    });
  }

  loadFinancialSummary(): void {
    this.dashboardService.getFinancialSummary().subscribe({
      next: (data) => {
        this.financialSummary = data;
      },
      error: (err) => this.showError(err, 'Erro ao carregar resumo financeiro')
    });
  }

  enableBalanceEdit(): void {
    if (!this.financialSummary) return;
    this.isEditingBalance = true;
    this.editedBalance = this.financialSummary.currentBalance;
  }

  saveEditedBalance(): void {
    if (!this.financialSummary) return;

    const valueAsNumber = Number(this.editedBalance);

    if (isNaN(valueAsNumber)) {
      console.error('Valor inválido para saldo.');
      return;
    }

    this.dashboardService.editTotalBalance(valueAsNumber).subscribe({
      next: () => {
        this.financialSummary!.currentBalance = valueAsNumber;
        this.isEditingBalance = false;
      },
      error: (err) => {
        console.error('Erro ao editar saldo:', err);
        this.showError(err, 'Erro ao atualizar o saldo atual.');
        this.isEditingBalance = false;
      },
      complete: () => {
        this.showSuccess('Saldo atualizado com sucesso!')
      }
    });
  }

  loadBalanceOverTime(): void {
    //if (this.balanceFilter.startDate && this.balanceFilter.endDate) {
    const start = new Date(this.balanceFilter.startDate + 'T00:00:00');
    const end = new Date(this.balanceFilter.endDate + 'T00:00:00');

    const filterPayload = {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };

    this.dashboardService.getBalanceOverTime(filterPayload).subscribe({
      next: (data) => {
        this.balanceOverTime = data;
        this.updateBalanceChart();
      },
      error: (err) => this.showError(err, 'Erro ao carregar evolução do saldo')
    });
    //} else {
    //}
  }

  loadGoalsSummary(): void {
    this.dashboardService.getNonRecurringGoals().subscribe({
      next: (data) => {
        this.goalsSummary = data;
        this.updateGoalsDonutChart();
      },
      error: (err) => this.showError(err, 'Erro ao carregar resumo de metas')
    });
  }

  loadUnexpectedExpenses(): void {
    this.dashboardService.getUnplannedExpensesAnalysis().subscribe({
      next: (data) => {
        this.unexpectedExpenses = data;
      },
      error: (err) => this.showError(err, 'Erro ao carregar análise de gastos inesperados')
    });
  }

  loadTopGoals(): void {
    this.dashboardService.getTopGoalsAchieved().subscribe({
      next: (data) => {
        this.topGoals = data;
        this.updatePagination();
      },
      error: (err) => this.showError(err, 'Erro ao carregar metas mais alcançadas')
    });
  }

  loadGoalsDistribution(): void {
    this.dashboardService.getGoalsDistribution().subscribe({
      next: (data) => {
        this.goalsDistribution = data;
        this.updateDistributionChart();
      },
      error: (err) => this.showError(err, 'Erro ao carregar distribuição de metas')
    });
  }

  loadBalanceProjection(): void {
    this.dashboardService.getBalanceProjection(this.projectionFilter).subscribe({
      next: (data) => {
        this.balanceProjection = data;
        this.updateProjectionChart();
        this.loading = false;
      },
      error: (err) => {
        this.showError(err, 'Erro ao carregar projeção de saldo');
        this.loading = false;
      }
    });
  }

  private updateBalanceChart(): void {
    this.balanceChartData = {
      labels: this.balanceOverTime.map(item => new Date(item.date).toLocaleDateString('pt-BR')),
      datasets: [{
        label: 'Saldo',
        data: this.balanceOverTime.map(item => item.balance),
        borderColor: '#4DDD7F',
        backgroundColor: 'rgba(77, 221, 127, 0.1)',
        tension: 0.4,
        fill: true
      }]
    };
  }

  private updateGoalsDonutChart(): void {
    if (!this.goalsSummary) return;

    this.goalsDonutData = {
      labels: ['Concluídas', 'Pendentes'],
      datasets: [{
        data: [this.goalsSummary.completed, this.goalsSummary.pending],
        backgroundColor: ['#4DDD7F', '#FF6B6B'],
        hoverBackgroundColor: ['#45C46A', '#FF5252']
      }]
    };
  }

  private updateDistributionChart(): void {
    this.distributionChartData = {
      labels: this.goalsDistribution.map(item => item.periodType),
      datasets: [{
        label: 'Conquistas',
        data: this.goalsDistribution.map(item => item.totalAchievements),
        backgroundColor: '#4DDD7F'
      }]
    };
  }

  private updateProjectionChart(): void {
    this.projectionChartData = {
      labels: this.balanceProjection.map(item => item.periodLabel),
      datasets: [{
        label: 'Saldo Projetado',
        data: this.balanceProjection.map(item => item.projectedBalance),
        borderColor: '#FF9800',
        backgroundColor: 'rgba(255, 152, 0, 0.1)',
        tension: 0.4,
        fill: true
      }]
    };
  }

  onBalanceFilterChange(): void {
    if (this.balanceFilter.startDate && this.balanceFilter.endDate) {
      this.loadBalanceOverTime();
    }
  }

  onProjectionFilterChange(): void {
    this.loadBalanceProjection();
  }

  getFinancialLevelText(level: FinancialControlLevelEnum): string {
    switch (level) {
      case FinancialControlLevelEnum.None: return 'Sem nível';
      case FinancialControlLevelEnum.Beginner: return 'Iniciante';
      case FinancialControlLevelEnum.Learning: return 'Aprendendo';
      case FinancialControlLevelEnum.Intermediate: return 'Intermediário';
      case FinancialControlLevelEnum.Advanced: return 'Avançado';
      case FinancialControlLevelEnum.Expert: return 'Especialista';
      case FinancialControlLevelEnum.Master: return 'Mestre';
      case FinancialControlLevelEnum.FinancialController: return 'Controlador Financeiro';
      default: return 'Não Definido';
    }
  }

  getFinancialLevelColor(level: FinancialControlLevelEnum): string {
    switch (level) {
      case FinancialControlLevelEnum.None: return '#A52A2A';
      case FinancialControlLevelEnum.Beginner: return '#E74C3C';
      case FinancialControlLevelEnum.Learning: return '#E67E22';
      case FinancialControlLevelEnum.Intermediate: return '#F1C40F';
      case FinancialControlLevelEnum.Advanced: return '#2ECC71';
      case FinancialControlLevelEnum.Expert: return '#3498DB';
      case FinancialControlLevelEnum.Master: return '#9B59B6';
      case FinancialControlLevelEnum.FinancialController: return '#FFD700';
      default: return '#9E9E9E';
    }
  }

  getAlertLevelColor(alertLevel: string): string {
    if (!alertLevel) return '#9E9E9E';

    switch (alertLevel.trim().toLowerCase()) {
      case 'baixo': return '#4DDD7F';
      case 'moderado': return '#FF9800';
      case 'alto': return '#FF5252';
      default: return '#9E9E9E';
    }
  }

  updatePagination(): void {
    if (!this.topGoals) return;
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedGoals = this.topGoals.slice(start, end);
    this.totalPages = Math.ceil(this.topGoals.length / this.itemsPerPage);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  logout(): void {
    sessionStorage.removeItem('env');
    this.router.navigate(['/environments']);
  }

  private showError(err: any, defaultMessage: string): void {
    this.backendError = err?.error || defaultMessage;
    setTimeout(() => {
      this.backendError = '';
    }, 5000);
  }

  private showSuccess(message: string): void {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = '';
    }, 5000);
  }

  closeError(): void {
    this.backendError = '';
    this.successMessage = '';
  }
}