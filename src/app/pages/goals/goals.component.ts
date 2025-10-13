import { HttpClient } from '@angular/common/http';
import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { GoalDataForViewDto, GoalDataDto, GoalPeriodTypeEnum } from 'src/app/models/goal.model';
import { EnvironmentService } from 'src/app/services/environment/environment.service';
import { GoalsService } from 'src/app/services/goals/goals.service';

@Component({
  selector: 'app-goals',
  templateUrl: './goals.component.html',
  styleUrls: ['./goals.component.css']
})
export class GoalsComponent implements OnInit {
  sidebarOpen = false;

  nonRecurringGoals: GoalDataForViewDto[] = [];
  recurringGoals: GoalDataForViewDto[] = [];

  newGoalForm: GoalDataDto = {
    description: '',
    value: 0,
    periodType: null,
    startDate: null,
    singleDate: null,
  };

  goalToDelete: GoalDataForViewDto | null = null;
  envToEdit: GoalDataForViewDto = {
    id: '', goalNumber: 0, description: '', value: 0, status: null, periodType: null, startDate: null, singleDate: null
  };

  showCreateModal = false;
  showDeleteModal = false;
  showEditModal = false;
  openMenuId: string | null = null;
  menuPosition = { top: 0, left: 0 };

  backendError = '';
  successMessage = '';
  periodTypes = GoalPeriodTypeEnum;

  private goalsService: GoalsService;

  constructor(
    private environmentService: EnvironmentService,
    private router: Router,
    private http: HttpClient
  ) {
    this.goalsService = new GoalsService(this.http);
  }

  ngOnInit(): void {
    this.loadGoals();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.options-btn') && !target.closest('.options-menu')) {
      this.openMenuId = null;
    }
  }

  loadGoals(): void {
    const env = sessionStorage.getItem('env')

    if (env)
      this.environmentService.setEnvironment(env)

    this.goalsService.getAllGoals().subscribe({
      next: (data) => {
        const goals = (data || []).map(goal => ({
          ...goal,
          id: goal.id || ''
        }));

        this.separateAndSortGoals(goals);
      },
      error: (err) => {
        console.error('Erro ao buscar metas', err);
        this.showError(err, 'Erro ao carregar lista de metas.');
      }
    });
  }

  private separateAndSortGoals(goals: GoalDataForViewDto[]): void {
    this.nonRecurringGoals = goals.filter(goal => goal.periodType === GoalPeriodTypeEnum.None);
    this.recurringGoals = goals.filter(goal => goal.periodType !== GoalPeriodTypeEnum.None);

    this.nonRecurringGoals.sort((a, b) => {
      const dateA = new Date(a.singleDate || '');
      const dateB = new Date(b.singleDate || '');
      return dateA.getTime() - dateB.getTime();
    });

    this.recurringGoals.sort((a, b) => {
      const periodA = a.periodType || 0;
      const periodB = b.periodType || 0;
      return periodA - periodB;
    });
  }

  newGoal(): void {
    this.resetForm();
    this.showCreateModal = true;
    this.openMenuId = null;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.resetForm();
  }

  resetForm(): void {
    this.newGoalForm = {
      description: '',
      value: 0,
      periodType: null,
      startDate: null,
      singleDate: null
    };
  }

  saveGoal(): void {
    if (!this.validateForm()) return;

    const goalPayload: GoalDataDto = {
      description: this.newGoalForm.description,
      value: this.newGoalForm.value,
      periodType: this.newGoalForm.periodType,
      startDate: this.newGoalForm.periodType !== GoalPeriodTypeEnum.None ? (new Date()).toISOString().split('T')[0] : null,
      singleDate: this.newGoalForm.singleDate
    };

    this.goalsService.createGoal(goalPayload).subscribe({
      next: () => {
        this.showSuccess('Meta cadastrada com sucesso!');
        this.closeCreateModal();
        this.loadGoals();
      },
      error: (err) => {
        console.error('Erro ao cadastrar meta', err);
        this.showError(err, 'Erro ao cadastrar a meta.');
      }
    });
  }

  validateForm(): boolean {
    this.backendError = '';

    if (!this.newGoalForm.description || this.newGoalForm.description.trim() === '') {
      this.showError(null, 'A Descrição da Meta é obrigatória.');
      return false;
    }
    if (!this.newGoalForm.value || this.newGoalForm.value <= 0) {
      this.showError(null, 'O Valor da Meta deve ser maior que zero.');
      return false;
    }
    if (this.newGoalForm.periodType === null) {
      this.showError(null, 'O Tipo de Período é obrigatório.');
      return false;
    }

    if (this.newGoalForm.periodType === GoalPeriodTypeEnum.None) {
      if (!this.newGoalForm.singleDate) {
        this.showError(null, 'A Data de Vencimento é obrigatória para metas pontuais.');
        return false;
      }

      const targetDate = new Date(this.newGoalForm.singleDate + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (targetDate < today) {
        this.showError(null, 'A Data de Vencimento deve ser hoje ou no futuro.');
        return false;
      }
    }

    return true;
  }

  onEdit(goal: GoalDataForViewDto): void {
    this.openMenuId = null;
    this.envToEdit = { ...goal };

    if (this.envToEdit.startDate) {
      this.envToEdit.startDate = this.envToEdit.startDate.split('T')[0];
    }
    if (this.envToEdit.singleDate) {
      this.envToEdit.singleDate = this.envToEdit.singleDate.split('T')[0];
    }

    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
  }

  saveEdit(): void {
    if (!this.validateEditForm()) return;

    const editPayload: GoalDataDto = {
      id: this.envToEdit.id,
      description: this.envToEdit.description || '',
      value: this.envToEdit.value || 0,
      periodType: this.envToEdit.periodType,
      startDate: this.envToEdit.periodType !== GoalPeriodTypeEnum.None ? this.envToEdit.startDate : null,
      singleDate: this.envToEdit.periodType === GoalPeriodTypeEnum.None ? this.envToEdit.singleDate : null
    };

    this.goalsService.updateGoal(editPayload).subscribe({
      next: () => {
        this.showSuccess('Meta atualizada com sucesso!');
        this.closeEditModal();
        this.loadGoals();
      },
      error: (err) => {
        console.error('Erro ao atualizar meta', err);
        this.showError(err, 'Erro ao atualizar a meta');
      }
    });
  }

  validateEditForm(): boolean {
    this.backendError = '';

    if (!this.envToEdit.description || this.envToEdit.description.trim() === '') {
      this.showError(null, 'A Descrição da Meta é obrigatória.');
      return false;
    }
    if (!this.envToEdit.value || this.envToEdit.value <= 0) {
      this.showError(null, 'O Valor da Meta deve ser maior que zero.');
      return false;
    }
    if (this.envToEdit.periodType === null) {
      this.showError(null, 'O Tipo de Período é obrigatório.');
      return false;
    }

    if (this.envToEdit.periodType === GoalPeriodTypeEnum.None) {
      if (!this.envToEdit.singleDate) {
        this.showError(null, 'A Data de Vencimento é obrigatória para metas pontuais.');
        return false;
      }
    }

    return true;
  }

  onDelete(goal: GoalDataForViewDto): void {
    this.openMenuId = null;
    this.goalToDelete = goal;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.goalToDelete = null;
    this.showDeleteModal = false;
  }

  confirmDelete(): void {
    if (!this.goalToDelete?.id) return;

    this.goalsService.deleteGoal(this.goalToDelete.id).subscribe({
      next: () => {
        this.showSuccess(`Meta "${this.goalToDelete?.goalNumber}" excluída com sucesso!`);
        this.cancelDelete();
        this.loadGoals();
      },
      error: (err) => {
        console.error('Erro ao excluir meta', err);
        this.showError(err, 'Erro ao excluir a meta.');
      }
    });
  }

  toggleOptions(id: string | undefined, event: MouseEvent): void {
    event.stopPropagation();

    if (this.openMenuId === id) {
      this.openMenuId = null;
      return;
    }

    const rect = (event.target as HTMLElement).getBoundingClientRect();
    this.menuPosition = {
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX - 100
    };

    this.openMenuId = id ?? null;
  }

  getGoalById(id: string | null): GoalDataForViewDto {
    if (!id) return this.envToEdit;

    const goal = [...this.nonRecurringGoals, ...this.recurringGoals].find(g => g.id === id);
    return goal || this.envToEdit;
  }

  getPeriodTypeName(type: GoalPeriodTypeEnum | null | undefined): string {
    switch (type) {
      case GoalPeriodTypeEnum.Daily: return 'Diária';
      case GoalPeriodTypeEnum.Weekly: return 'Semanal';
      case GoalPeriodTypeEnum.Monthly: return 'Mensal';
      case GoalPeriodTypeEnum.Semestral: return 'Semestral';
      case GoalPeriodTypeEnum.Annual: return 'Anual';
      case GoalPeriodTypeEnum.None: return 'Pontual';
      default: return 'Não Definido';
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  }

  getDaysUntilDate(dateStr: string | null): string {
    if (!dateStr) return '';

    const targetDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);

    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Amanhã';
    if (diffDays < 0) return `${Math.abs(diffDays)} dias atrás`;
    return `${diffDays} dias`;
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout(): void {
    sessionStorage.removeItem('env');
    this.router.navigate(['/environments']);
  }

  private showError(err: any, defaultMessage: string): void {
    const errorMessage = err?.error?.message || defaultMessage;
    this.backendError = errorMessage;
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

  getStatusText(status: boolean | null | undefined): string {
    if (status === true) {
      return 'Concluída';
    } else if (status === false) {
      return 'Pendente ou Não Alcançada';
    } else {
      return 'Pendente';
    }
  }
}