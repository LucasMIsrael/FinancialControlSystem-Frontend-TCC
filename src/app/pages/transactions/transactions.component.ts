import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import {
  TransactionDataDto,
  TransactionDataForViewDto,
  TransactionTypeEnum,
  TransactionRecurrenceTypeEnum
} from 'src/app/models/transaction.model';
import { EnvironmentService } from 'src/app/services/environment/environment.service';
import { TransactionsService } from 'src/app/services/transactions/transactions.service';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit {
  sidebarOpen = false;

  plannedTransactions: TransactionDataForViewDto[] = [];
  unplannedTransactions: TransactionDataForViewDto[] = [];

  newTransactionForm: TransactionDataDto = {
    description: '',
    amount: 0,
    type: TransactionTypeEnum.Expense,
    recurrenceType: TransactionRecurrenceTypeEnum.Monthly,
    transactionDate: new Date().toISOString().split('T')[0]
  };

  transactionToDelete: TransactionDataForViewDto | null = null;
  transactionToEdit: TransactionDataForViewDto = {
    id: '',
    transactionNumber: 0,
    description: '',
    amount: 0,
    type: TransactionTypeEnum.Expense,
    recurrenceType: TransactionRecurrenceTypeEnum.None,
    transactionDate: new Date().toISOString().split('T')[0]
  };

  showCreateModal = false;
  showDeleteModal = false;
  showEditModal = false;
  isPlannedTransaction = false;
  openMenuId: string | null = null;
  menuPosition = { top: 0, left: 0 };

  backendError = '';
  successMessage = '';

  transactionTypes = TransactionTypeEnum;
  recurrenceTypes = TransactionRecurrenceTypeEnum;

  constructor(
    private environmentService: EnvironmentService,
    private router: Router,
    private transactionsService: TransactionsService
  ) { }

  ngOnInit(): void {
    this.loadTransactions();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.options-btn') && !target.closest('.options-menu')) {
      this.openMenuId = null;
    }
  }

  loadTransactions(): void {
    const env = sessionStorage.getItem('env');

    if (env) {
      this.environmentService.setEnvironment(env);
    }

    this.loadPlannedTransactions();
    this.loadUnplannedTransactions();
  }

  loadPlannedTransactions(): void {
    this.transactionsService.getAllPlannedTransactions().subscribe({
      next: (data) => {
        this.plannedTransactions = (data || []).map((transaction, index) => ({
          ...transaction,
          id: transaction.id || '',
          transactionNumber: index + 1
        }));
        this.sortPlannedTransactions();
      },
      error: (err) => {
        console.error('Erro ao buscar transações planejadas', err);
        this.showError(err, 'Erro ao carregar transações planejadas.');
      }
    });
  }

  loadUnplannedTransactions(): void {
    this.transactionsService.getAllUnplannedTransactions().subscribe({
      next: (data) => {
        this.unplannedTransactions = (data || []).map((transaction, index) => ({
          ...transaction,
          id: transaction.id || '',
          transactionNumber: index + 1
        }));
        this.sortUnplannedTransactions();
      },
      error: (err) => {
        console.error('Erro ao buscar transações pontuais', err);
        this.showError(err, 'Erro ao carregar transações pontuais.');
      }
    });
  }

  private sortPlannedTransactions(): void {
    this.plannedTransactions.sort((a, b) => {
      const dateA = new Date(a.transactionDate);
      const dateB = new Date(b.transactionDate);
      return dateA.getTime() - dateB.getTime();
    });
  }

  private sortUnplannedTransactions(): void {
    this.unplannedTransactions.sort((a, b) => {
      const dateA = new Date(a.transactionDate);
      const dateB = new Date(b.transactionDate);
      return dateB.getTime() - dateA.getTime(); // Mais recente primeiro
    });
  }

  newTransaction(type: 'planned' | 'unplanned'): void {
    this.resetForm();
    this.isPlannedTransaction = type === 'planned';

    if (!this.isPlannedTransaction) {
      this.newTransactionForm.recurrenceType = TransactionRecurrenceTypeEnum.None;
    }

    this.showCreateModal = true;
    this.openMenuId = null;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.resetForm();
  }

  resetForm(): void {
    this.newTransactionForm = {
      description: '',
      amount: 0,
      type: TransactionTypeEnum.Expense,
      recurrenceType: TransactionRecurrenceTypeEnum.Monthly,
      transactionDate: new Date().toISOString().split('T')[0]
    };
  }

  saveTransaction(): void {
    if (!this.validateForm()) return;

    const transactionPayload: TransactionDataDto = {
      description: this.newTransactionForm.description,
      amount: this.newTransactionForm.amount,
      type: this.newTransactionForm.type,
      recurrenceType: this.isPlannedTransaction ? this.newTransactionForm.recurrenceType : TransactionRecurrenceTypeEnum.None,
      transactionDate: this.newTransactionForm.transactionDate
    };

    const saveMethod = this.isPlannedTransaction
      ? this.transactionsService.createPlannedTransaction(transactionPayload)
      : this.transactionsService.createUnplannedTransaction(transactionPayload);

    saveMethod.subscribe({
      next: () => {
        this.showSuccess('Transação cadastrada com sucesso!');
        this.closeCreateModal();
        this.loadTransactions();
      },
      error: (err) => {
        console.error('Erro ao cadastrar transação', err);
        this.showError(err, 'Erro ao cadastrar a transação.');
      }
    });
  }

  validateForm(): boolean {
    this.backendError = '';

    if (!this.newTransactionForm.description || this.newTransactionForm.description.trim() === '') {
      this.showError(null, 'A Descrição da Transação é obrigatória.');
      return false;
    }
    if (!this.newTransactionForm.amount || this.newTransactionForm.amount <= 0) {
      this.showError(null, 'O Valor deve ser maior que zero.');
      return false;
    }
    if (this.newTransactionForm.type === null || this.newTransactionForm.type === undefined) {
      this.showError(null, 'O Tipo de Transação é obrigatório.');
      return false;
    }
    if (!this.newTransactionForm.transactionDate) {
      this.showError(null, 'A Data da Transação é obrigatória.');
      return false;
    }

    return true;
  }

  onEdit(transaction: TransactionDataForViewDto): void {
    this.openMenuId = null;
    this.transactionToEdit = { ...transaction };

    if (this.transactionToEdit.transactionDate) {
      this.transactionToEdit.transactionDate = this.transactionToEdit.transactionDate.split('T')[0];
    }

    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
  }

  saveEdit(): void {
    if (!this.validateEditForm()) return;

    const editPayload: TransactionDataDto = {
      id: this.transactionToEdit.id,
      description: this.transactionToEdit.description || '',
      amount: this.transactionToEdit.amount || 0,
      type: this.transactionToEdit.type,
      recurrenceType: this.transactionToEdit.recurrenceType,
      transactionDate: this.transactionToEdit.transactionDate
    };

    const updateMethod = this.transactionToEdit.recurrenceType === TransactionRecurrenceTypeEnum.None
      ? this.transactionsService.updateUnplannedTransaction(editPayload)
      : this.transactionsService.updatePlannedTransaction(editPayload);

    updateMethod.subscribe({
      next: () => {
        this.showSuccess('Transação atualizada com sucesso!');
        this.closeEditModal();
        this.loadTransactions();
      },
      error: (err) => {
        console.error('Erro ao atualizar transação', err);
        this.showError(err, 'Erro ao atualizar a transação');
      }
    });
  }

  validateEditForm(): boolean {
    this.backendError = '';

    if (!this.transactionToEdit.description || this.transactionToEdit.description.trim() === '') {
      this.showError(null, 'A Descrição da Transação é obrigatória.');
      return false;
    }
    if (!this.transactionToEdit.amount || this.transactionToEdit.amount <= 0) {
      this.showError(null, 'O Valor deve ser maior que zero.');
      return false;
    }
    if (!this.transactionToEdit.transactionDate) {
      this.showError(null, 'A Data da Transação é obrigatória.');
      return false;
    }

    return true;
  }

  onDelete(transaction: TransactionDataForViewDto): void {
    this.openMenuId = null;
    this.transactionToDelete = transaction;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.transactionToDelete = null;
    this.showDeleteModal = false;
  }

  confirmDelete(): void {
    if (!this.transactionToDelete?.id) return;

    this.transactionsService.deleteTransaction(this.transactionToDelete.id).subscribe({
      next: () => {
        this.showSuccess(`Transação "${this.transactionToDelete?.transactionNumber}" excluída com sucesso!`);
        this.cancelDelete();
        this.loadTransactions();
      },
      error: (err) => {
        console.error('Erro ao excluir transação', err);
        this.showError(err, 'Erro ao excluir a transação.');
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

  getTransactionById(id: string | null): TransactionDataForViewDto {
    if (!id) return this.transactionToEdit;

    const transaction = [...this.plannedTransactions, ...this.unplannedTransactions]
      .find(t => t.id === id);
    return transaction || this.transactionToEdit;
  }

  getTransactionTypeName(type: TransactionTypeEnum): string {
    switch (type) {
      case TransactionTypeEnum.Income: return 'Receita';
      case TransactionTypeEnum.Expense: return 'Despesa';
      default: return 'Não Definido';
    }
  }

  getRecurrenceTypeName(type: TransactionRecurrenceTypeEnum): string {
    switch (type) {
      case TransactionRecurrenceTypeEnum.None: return 'Pontual';
      case TransactionRecurrenceTypeEnum.Daily: return 'Diária';
      case TransactionRecurrenceTypeEnum.Weekly: return 'Semanal';
      case TransactionRecurrenceTypeEnum.Monthly: return 'Mensal';
      case TransactionRecurrenceTypeEnum.Semestral: return 'Semestral';
      case TransactionRecurrenceTypeEnum.Annual: return 'Anual';
      default: return 'Não Definido';
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  navigateToGoals(): void {
    this.router.navigate(['/goals']);
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
}