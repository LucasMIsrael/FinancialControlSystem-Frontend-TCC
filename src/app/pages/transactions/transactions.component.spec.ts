import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TransactionsComponent } from './transactions.component';
import { TransactionsService } from 'src/app/services/transactions/transactions.service';
import { EnvironmentService } from 'src/app/services/environment/environment.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import {
  TransactionDataDto,
  TransactionDataForViewDto,
  TransactionTypeEnum,
  TransactionRecurrenceTypeEnum
} from 'src/app/models/transaction.model';

describe('TransactionsComponent', () => {
  let component: TransactionsComponent;
  let fixture: ComponentFixture<TransactionsComponent>;
  let transactionsService: jasmine.SpyObj<TransactionsService>;
  let environmentService: jasmine.SpyObj<EnvironmentService>;
  let router: jasmine.SpyObj<Router>;

  const mockPlannedTransactions: TransactionDataForViewDto[] = [
    { id: '1', description: 'Salário', amount: 3000, type: TransactionTypeEnum.Income, recurrenceType: TransactionRecurrenceTypeEnum.Monthly, transactionDate: '2025-10-10', transactionNumber: 1 },
    { id: '2', description: 'Internet', amount: 200, type: TransactionTypeEnum.Expense, recurrenceType: TransactionRecurrenceTypeEnum.Monthly, transactionDate: '2025-10-12', transactionNumber: 2 }
  ];

  const mockUnplannedTransactions: TransactionDataForViewDto[] = [
    { id: '3', description: 'Café', amount: 15, type: TransactionTypeEnum.Expense, recurrenceType: TransactionRecurrenceTypeEnum.None, transactionDate: '2025-10-13', transactionNumber: 1 }
  ];

  beforeEach(async () => {
    const transactionsSpy = jasmine.createSpyObj('TransactionsService', [
      'getAllPlannedTransactions',
      'getAllUnplannedTransactions',
      'createPlannedTransaction',
      'createUnplannedTransaction',
      'updatePlannedTransaction',
      'updateUnplannedTransaction',
      'deleteTransaction'
    ]);
    const envSpy = jasmine.createSpyObj('EnvironmentService', ['setEnvironment']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [TransactionsComponent],
      providers: [
        { provide: TransactionsService, useValue: transactionsSpy },
        { provide: EnvironmentService, useValue: envSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionsComponent);
    component = fixture.componentInstance;
    transactionsService = TestBed.inject(TransactionsService) as jasmine.SpyObj<TransactionsService>;
    environmentService = TestBed.inject(EnvironmentService) as jasmine.SpyObj<EnvironmentService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    transactionsService.getAllPlannedTransactions.and.returnValue(of(mockPlannedTransactions));
    transactionsService.getAllUnplannedTransactions.and.returnValue(of(mockUnplannedTransactions));
  });

  it('deve ser criado', () => {
    expect(component).toBeTruthy();
  });

  it('deve carregar transações planejadas e não planejadas no ngOnInit', () => {
    component.ngOnInit();
    expect(transactionsService.getAllPlannedTransactions).toHaveBeenCalled();
    expect(transactionsService.getAllUnplannedTransactions).toHaveBeenCalled();
    expect(component.plannedTransactions.length).toBe(2);
    expect(component.unplannedTransactions.length).toBe(1);
  });

  it('deve abrir modal de criação de transação planejada', () => {
    component.newTransaction('planned');
    expect(component.showCreateModal).toBeTrue();
    expect(component.isPlannedTransaction).toBeTrue();
  });

  it('deve abrir modal de criação de transação não planejada e ajustar recurrenceType', () => {
    component.newTransaction('unplanned');
    expect(component.showCreateModal).toBeTrue();
    expect(component.newTransactionForm.recurrenceType).toBe(TransactionRecurrenceTypeEnum.None);
  });

  it('deve validar formulário incorreto e impedir salvar', () => {
    component.newTransactionForm.description = '';
    const valid = component.validateForm();
    expect(valid).toBeFalse();
    expect(component.backendError).toContain('Descrição');
  });

  it('deve salvar uma transação planejada com sucesso', () => {
    const mockPayload: TransactionDataDto = {
      description: 'Teste',
      amount: 100,
      type: TransactionTypeEnum.Expense,
      recurrenceType: TransactionRecurrenceTypeEnum.Monthly,
      transactionDate: '2025-10-13'
    };
    component.newTransactionForm = mockPayload;
    component.isPlannedTransaction = true;
    transactionsService.createPlannedTransaction.and.returnValue(of({}));

    component.saveTransaction();

    expect(transactionsService.createPlannedTransaction).toHaveBeenCalledWith(mockPayload);
  });

  it('deve salvar uma transação não planejada com sucesso', () => {
    component.isPlannedTransaction = false;
    component.newTransactionForm = {
      description: 'Lanche',
      amount: 25,
      type: TransactionTypeEnum.Expense,
      recurrenceType: TransactionRecurrenceTypeEnum.None,
      transactionDate: '2025-10-13'
    };
    transactionsService.createUnplannedTransaction.and.returnValue(of({}));

    component.saveTransaction();

    expect(transactionsService.createUnplannedTransaction).toHaveBeenCalled();
  });

  it('deve excluir uma transação e recarregar lista', () => {
    const transaction = mockUnplannedTransactions[0];
    transactionsService.deleteTransaction.and.returnValue(of({}));

    component.transactionToDelete = transaction;
    component.confirmDelete();

    expect(transactionsService.deleteTransaction).toHaveBeenCalledWith(transaction.id);
  });

  it('deve abrir modal de edição e preencher dados', () => {
    const transaction = mockPlannedTransactions[0];
    component.onEdit(transaction);
    expect(component.showEditModal).toBeTrue();
    expect(component.transactionToEdit.description).toBe(transaction.description);
  });

  it('deve validar formulário de edição incorreto e impedir salvar', () => {
    component.transactionToEdit.description = '';
    const valid = component.validateEditForm();
    expect(valid).toBeFalse();
    expect(component.backendError).toContain('Descrição');
  });

  it('deve salvar uma edição de transação planejada', () => {
    component.transactionToEdit = mockPlannedTransactions[0];
    transactionsService.updatePlannedTransaction.and.returnValue(of({}));

    component.saveEdit();

    expect(transactionsService.updatePlannedTransaction).toHaveBeenCalled();
  });

  it('deve salvar uma edição de transação não planejada', () => {
    const transaction = { ...mockUnplannedTransactions[0], recurrenceType: TransactionRecurrenceTypeEnum.None };
    component.transactionToEdit = transaction;
    transactionsService.updateUnplannedTransaction.and.returnValue(of({}));

    component.saveEdit();

    expect(transactionsService.updateUnplannedTransaction).toHaveBeenCalled();
  });

  it('deve alternar visibilidade da sidebar', () => {
    component.sidebarOpen = false;
    component.toggleSidebar();
    expect(component.sidebarOpen).toBeTrue();
  });

  it('deve navegar para metas', () => {
    component.navigateToGoals();
    expect(router.navigate).toHaveBeenCalledWith(['/goals']);
  });

  it('deve efetuar logout e navegar para environments', () => {
    sessionStorage.setItem('env', '123');
    component.logout();
    expect(sessionStorage.getItem('env')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/environments']);
  });

  it('deve limpar mensagens de erro e sucesso com closeError', () => {
    component.backendError = 'Erro';
    component.successMessage = 'Ok';
    component.closeError();
    expect(component.backendError).toBe('');
    expect(component.successMessage).toBe('');
  });

  it('deve formatar moeda corretamente', () => {
    const formatted = component.formatCurrency(1234.56);
    expect(formatted).toContain('R$');
  });

  it('deve retornar nome do tipo de transação corretamente', () => {
    expect(component.getTransactionTypeName(TransactionTypeEnum.Income)).toBe('Receita');
  });

  it('deve retornar nome do tipo de recorrência corretamente', () => {
    expect(component.getRecurrenceTypeName(TransactionRecurrenceTypeEnum.Weekly)).toBe('Semanal');
  });

  it('deve carregar transações e definir o ambiente no loadTransactions', () => {
    sessionStorage.setItem('env', 'env123');
    spyOn(component, 'loadPlannedTransactions');
    spyOn(component, 'loadUnplannedTransactions');

    component.loadTransactions();

    expect(environmentService.setEnvironment).toHaveBeenCalledWith('env123');
    expect(component.loadPlannedTransactions).toHaveBeenCalled();
    expect(component.loadUnplannedTransactions).toHaveBeenCalled();
  });
});
