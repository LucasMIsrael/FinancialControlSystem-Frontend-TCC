import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { GoalsComponent } from './goals.component';
import { EnvironmentService } from 'src/app/services/environment/environment.service';
import { GoalsService } from 'src/app/services/goals/goals.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { GoalDataForViewDto, GoalPeriodTypeEnum } from 'src/app/models/goal.model';
import { FormsModule } from '@angular/forms';

// Mock do Goal Model para uso nos testes
const mockGoalModel = {
    GoalPeriodTypeEnum
};

// Dados mockados de Metas
// DEFINIÇÃO ORIGINAL (NÃO DEVE SER MODIFICADA PELOS TESTES)
const mockGoals: GoalDataForViewDto[] = [
    // Meta Pontual (Não Recorrente) - Vencimento Amanhã
    { id: '1', goalNumber: 1, description: 'Viagem', value: 5000, status: false, periodType: GoalPeriodTypeEnum.None, startDate: null, singleDate: '2025-10-13' },
    // Meta Pontual (Não Recorrente) - Vencimento Hoje
    { id: '3', goalNumber: 3, description: 'Compra de algo', value: 100, status: null, periodType: GoalPeriodTypeEnum.None, startDate: null, singleDate: '2025-10-12' },
    // Meta Recorrente - Mensal
    { id: '2', goalNumber: 2, description: 'Mensalidade', value: 500, status: false, periodType: GoalPeriodTypeEnum.Monthly, startDate: '2025-01-01', singleDate: null },
    // Meta Recorrente - Anual
    { id: '4', goalNumber: 4, description: 'Aniversário', value: 1000, status: true, periodType: GoalPeriodTypeEnum.Annual, startDate: '2025-01-01', singleDate: null },
];

describe('GoalsComponent', () => {
    let component: GoalsComponent;
    let fixture: ComponentFixture<GoalsComponent>;
    let mockGoalsService: any;
    let mockEnvironmentService: any;
    let mockRouter: any;
    let mockHttpClient: any;

    beforeAll(() => {
        // CORREÇÃO 1: Simula a data atual para garantir que o toISOString retorne a data correta (2025-10-12)
        // Usamos uma data que é interpretada corretamente pelo toISOString no ambiente de teste.
        jasmine.clock().install();

        // Novo mock de data: Define a data no meio do dia em UTC para evitar rolagem de data
        const today = new Date('2025-10-12T10:00:00Z');
        jasmine.clock().mockDate(today);
    });

    afterAll(() => {
        jasmine.clock().uninstall();
    });

    beforeEach(async () => {
        mockGoalsService = jasmine.createSpyObj('GoalsService', ['getAllGoals', 'createGoal', 'updateGoal', 'deleteGoal']);
        mockEnvironmentService = jasmine.createSpyObj('EnvironmentService', ['setEnvironment']);
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);
        mockHttpClient = jasmine.createSpyObj('HttpClient', ['get']); // Mock simples, já que GoalsService é instanciado no componente

        await TestBed.configureTestingModule({
            declarations: [GoalsComponent],
            imports: [FormsModule],
            providers: [
                { provide: EnvironmentService, useValue: mockEnvironmentService },
                { provide: GoalsService, useValue: mockGoalsService }, // Apesar de GoalsService ser instanciado no constructor, mockaremos o que é usado
                { provide: Router, useValue: mockRouter },
                { provide: HttpClient, useValue: mockHttpClient }, // Necessário para a injeção HttpClient
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GoalsComponent);
        component = fixture.componentInstance;

        // Garante que o GoalsService mockado seja usado, mesmo com a inicialização no constructor
        (component as any).goalsService = mockGoalsService;

        // CORREÇÃO 3: Adiciona um valor de retorno padrão para evitar 'subscribe of undefined' quando loadGoals é chamado.
        mockGoalsService.getAllGoals.and.returnValue(of([]));

        // Inicializa a data atual no formulário de criação
        component.resetForm();
    });

    it('deve criar o componente', () => {
        expect(component).toBeTruthy();
    });

    // --- Testes de Carregamento e Ordenação (loadGoals) ---
    it('deve chamar setEnvironment se houver ambiente na sessão', () => {
        spyOn(sessionStorage, 'getItem').and.returnValue('some-env-id');

        component.loadGoals();

        expect(mockEnvironmentService.setEnvironment).toHaveBeenCalledWith('some-env-id');
    });

    // CORREÇÃO: Usando fakeAsync e tick(5000)
    it('deve mostrar erro ao falhar o carregamento de metas', fakeAsync(() => {
        const errorResponse = { error: { message: 'Erro de API' } };
        mockGoalsService.getAllGoals.and.returnValue(throwError(() => errorResponse));

        component.loadGoals();

        // Verifica que o erro é exibido imediatamente
        expect(component.backendError).toBe('Erro de API');

        // Completa o timer de 5000ms do showError para evitar "timers in queue"
        tick(5000);

        // Verifica que o erro foi limpo após o timeout
        expect(component.backendError).toBe('');
    }));

    // --- Testes de UI e Modais ---

    it('deve abrir o modal de criação de meta', () => {
        component.newGoal();
        expect(component.showCreateModal).toBeTrue();
        expect(component.openMenuId).toBeNull();
    });

    it('deve fechar o modal de criação e resetar o formulário', () => {
        component.newGoalForm.description = 'Teste';
        component.showCreateModal = true;

        component.closeCreateModal();

        expect(component.showCreateModal).toBeFalse();
        expect(component.newGoalForm.description).toBe('');
    });

    // --- Testes de Criação (saveGoal) ---

    it('não deve criar meta se a descrição estiver vazia', () => {
        component.newGoalForm.description = ' ';
        component.newGoalForm.value = 100;
        component.newGoalForm.periodType = mockGoalModel.GoalPeriodTypeEnum.None;

        component.saveGoal();

        expect(component.backendError).toBe('A Descrição da Meta é obrigatória.');
        expect(mockGoalsService.createGoal).not.toHaveBeenCalled();
    });

    it('não deve criar meta se o valor for zero ou negativo', () => {
        component.newGoalForm.description = 'Valida Valor';
        component.newGoalForm.value = 0;
        component.newGoalForm.periodType = mockGoalModel.GoalPeriodTypeEnum.Monthly;

        component.saveGoal();

        expect(component.backendError).toBe('O Valor da Meta deve ser maior que zero.');
        expect(mockGoalsService.createGoal).not.toHaveBeenCalled();
    });

    it('não deve criar meta se o tipo de período for null', () => {
        component.newGoalForm.description = 'Valida Tipo';
        component.newGoalForm.value = 100;
        component.newGoalForm.periodType = null;

        component.saveGoal();

        expect(component.backendError).toBe('O Tipo de Período é obrigatório.');
        expect(mockGoalsService.createGoal).not.toHaveBeenCalled();
    });

    it('não deve criar meta pontual se a data de vencimento for omitida', () => {
        component.newGoalForm.description = 'Valida Data';
        component.newGoalForm.value = 100;
        component.newGoalForm.periodType = mockGoalModel.GoalPeriodTypeEnum.None;
        component.newGoalForm.singleDate = null; // Data omitida

        component.saveGoal();

        expect(component.backendError).toBe('A Data de Vencimento é obrigatória para metas pontuais.');
        expect(mockGoalsService.createGoal).not.toHaveBeenCalled();
    });

    it('não deve criar meta pontual se a data de vencimento estiver no passado', () => {
        component.newGoalForm.description = 'Valida Data';
        component.newGoalForm.value = 100;
        component.newGoalForm.periodType = mockGoalModel.GoalPeriodTypeEnum.None;
        component.newGoalForm.singleDate = '2025-10-11'; // Ontem

        component.saveGoal();

        expect(component.backendError).toBe('A Data de Vencimento deve ser hoje ou no futuro.');
        expect(mockGoalsService.createGoal).not.toHaveBeenCalled();
    });

    it('deve criar meta pontual com sucesso (com singleDate)', () => {
        component.newGoalForm.description = 'Pontual';
        component.newGoalForm.value = 200;
        component.newGoalForm.periodType = mockGoalModel.GoalPeriodTypeEnum.None;
        component.newGoalForm.singleDate = '2025-11-01';

        mockGoalsService.createGoal.and.returnValue(of({}));
        component.saveGoal();

        expect(mockGoalsService.createGoal).toHaveBeenCalled();
        const sentPayload = mockGoalsService.createGoal.calls.mostRecent().args[0];
        expect(sentPayload.startDate).toBeNull(); // Não deve enviar startDate
        expect(sentPayload.singleDate).toBe('2025-11-01');
    });


    // --- Testes de Edição (onEdit/saveEdit) ---

    it('deve carregar dados da meta e formatar datas no onEdit', () => {
        const goalToEdit: GoalDataForViewDto = {
            id: '1', goalNumber: 1, description: 'Teste data', value: 100, status: null, periodType: GoalPeriodTypeEnum.None, startDate: '2025-01-01T00:00:00', singleDate: '2025-12-31T00:00:00'
        };
        component.onEdit(goalToEdit);

        expect(component.showEditModal).toBeTrue();
        expect(component.envToEdit.description).toBe('Teste data');
        // Verifica se as datas foram formatadas corretamente
        expect(component.envToEdit.startDate).toBe('2025-01-01');
        expect(component.envToEdit.singleDate).toBe('2025-12-31');
    });

    it('não deve salvar edição se a descrição estiver vazia', () => {
        component.envToEdit.description = '';
        component.envToEdit.value = 100;
        component.envToEdit.periodType = mockGoalModel.GoalPeriodTypeEnum.Monthly;

        component.saveEdit();

        expect(component.backendError).toBe('A Descrição da Meta é obrigatória.');
        expect(mockGoalsService.updateGoal).not.toHaveBeenCalled();
    });

    it('deve salvar edição com sucesso e recarregar metas', () => {
        component.envToEdit = mockGoals[0] as GoalDataForViewDto;
        component.envToEdit.description = 'Desc Editada';
        component.envToEdit.value = 6000;

        mockGoalsService.updateGoal.and.returnValue(of({}));
        spyOn(component, 'closeEditModal');
        spyOn(component, 'loadGoals');

        component.saveEdit();

        expect(mockGoalsService.updateGoal).toHaveBeenCalled();
        expect(component.closeEditModal).toHaveBeenCalled();
        expect(component.loadGoals).toHaveBeenCalled();
    });

    // --- Testes de Exclusão (onDelete) ---

    it('deve abrir o modal de exclusão', () => {
        component.onDelete(mockGoals[0]);
        expect(component.showDeleteModal).toBeTrue();
        expect(component.goalToDelete).toEqual(mockGoals[0]);
    });

    it('deve cancelar a exclusão', () => {
        component.goalToDelete = mockGoals[0];
        component.showDeleteModal = true;

        component.cancelDelete();

        expect(component.showDeleteModal).toBeFalse();
        expect(component.goalToDelete).toBeNull();
    });

    it('deve confirmar a exclusão e recarregar as metas', () => {
        component.goalToDelete = mockGoals[0];
        mockGoalsService.deleteGoal.and.returnValue(of({}));
        spyOn(component, 'cancelDelete');
        spyOn(component, 'loadGoals');

        component.confirmDelete();

        expect(mockGoalsService.deleteGoal).toHaveBeenCalledWith(mockGoals[0].id);
        expect(component.cancelDelete).toHaveBeenCalled();
        expect(component.loadGoals).toHaveBeenCalled();
    });

    // --- Testes de Utilidade ---

    // CORREÇÃO: Usando toMatch para lidar com diferenças de espaços entre navegadores/locales.
    it('deve formatar valores para moeda BRL', () => {
        expect(component.formatCurrency(1234.56)).toMatch(/R\$\s1\.234,56/);
        expect(component.formatCurrency(0)).toMatch(/R\$\s0,00/);
    });

    // CORREÇÃO 2: Usa o formato YYYY/MM/DD para forçar interpretação local e corrigir a lógica de dias.
    it('deve calcular dias corretamente para a exibição', () => {
        // '2025/10/12' é Hoje (Mocked date)
        expect(component.getDaysUntilDate('2025/10/12')).toBe('Hoje');
        // '2025/10/13' é Amanhã (1 dia)
        expect(component.getDaysUntilDate('2025/10/13')).toBe('Amanhã');
        // '2025/10/22' é 10 dias (10 dias no futuro)
        expect(component.getDaysUntilDate('2025/10/22')).toBe('10 dias');
        // '2025/10/11' é 1 dia atrás
        expect(component.getDaysUntilDate('2025/10/11')).toBe('1 dias atrás');
    });

    it('deve retornar o nome correto do tipo de período', () => {
        expect(component.getPeriodTypeName(GoalPeriodTypeEnum.Annual)).toBe('Anual');
        expect(component.getPeriodTypeName(GoalPeriodTypeEnum.None)).toBe('Pontual');
        expect(component.getPeriodTypeName(null)).toBe('Não Definido');
        expect(component.getPeriodTypeName(undefined)).toBe('Não Definido');
    });

    it('deve retornar o texto correto para o status', () => {
        expect(component.getStatusText(true)).toBe('Concluída');
        expect(component.getStatusText(false)).toBe('Pendente ou Não Alcançada');
        expect(component.getStatusText(null)).toBe('Pendente');
        expect(component.getStatusText(undefined)).toBe('Pendente');
    });

    // --- Testes de Navegação/Sidebar ---

    it('deve alternar a sidebar', () => {
        expect(component.sidebarOpen).toBeFalse();
        component.toggleSidebar();
        expect(component.sidebarOpen).toBeTrue();
    });

    it('deve fazer logout e navegar para ambientes', () => {
        spyOn(sessionStorage, 'removeItem');
        component.logout();

        expect(sessionStorage.removeItem).toHaveBeenCalledWith('env');
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/environments']);
    });
});
