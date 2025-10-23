import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FinancialSummaryDto } from 'src/app/models/dashboard.model';

describe('DashboardComponent', () => {
    let component: DashboardComponent;
    let fixture: ComponentFixture<DashboardComponent>;
    let dashboardServiceSpy: jasmine.SpyObj<DashboardService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        const serviceSpy = jasmine.createSpyObj('DashboardService', [
            'updateEnvironmentBalance',
            'getFinancialSummary',
            'getBalanceOverTime',
            'getNonRecurringGoals',
            'getUnplannedExpensesAnalysis',
            'getTopGoalsAchieved',
            'getGoalsDistribution',
            'getBalanceProjection',
            'editTotalBalance'
        ]);

        const rSpy = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            declarations: [DashboardComponent],
            providers: [
                { provide: DashboardService, useValue: serviceSpy },
                { provide: Router, useValue: rSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(DashboardComponent);
        component = fixture.componentInstance;
        dashboardServiceSpy = TestBed.inject(DashboardService) as jasmine.SpyObj<DashboardService>;
        routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    });

    it('deve criar o componente', () => {
        expect(component).toBeTruthy();
    });

    it('deve inicializar filtros corretamente', () => {
        const start = component.balanceFilter.startDate;
        const end = component.balanceFilter.endDate;
        expect(start).toBeTruthy();
        expect(end).toBeTruthy();
    });

    it('deve formatar moeda corretamente', () => {
        const formatted = component.formatCurrency(5000);
        expect(formatted).toContain('R$');
    });

    it('deve alternar o sidebar', () => {
        const initial = component.sidebarOpen;
        component.toggleSidebar();
        expect(component.sidebarOpen).toBe(!initial);
    });

    it('deve chamar editTotalBalance ao salvar saldo', () => {
        const mockSummary: FinancialSummaryDto = {
            totalProfit: 3444,
            totalExpense: 453,
            profitMargin: '40%',
            currentBalance: 1000,
            level: 1,
        };

        component.financialSummary = mockSummary;
        component.editedBalance = 2000;
        dashboardServiceSpy.editTotalBalance.and.returnValue(of(void 0));

        component.saveEditedBalance();

        expect(dashboardServiceSpy.editTotalBalance).toHaveBeenCalledWith(2000);
        expect(component.financialSummary.currentBalance).toBe(2000);
    });

    it('deve exibir erro ao falhar ao editar saldo', () => {
        const mockSummary: FinancialSummaryDto = {
            totalProfit: 3444,
            totalExpense: 453,
            profitMargin: '40%',
            currentBalance: 1000,
            level: 1,
        };

        component.financialSummary = mockSummary;
        component.editedBalance = 2000;
        dashboardServiceSpy.editTotalBalance.and.returnValue(throwError(() => new Error('Erro')));

        component.saveEditedBalance();

        expect(component.backendError).toContain('Erro');
    });

    it('deve carregar resumo financeiro com sucesso', () => {
        const mockData = { currentBalance: 1000 } as FinancialSummaryDto;
        dashboardServiceSpy.getFinancialSummary.and.returnValue(of(mockData));

        component.loadFinancialSummary();

        expect(dashboardServiceSpy.getFinancialSummary).toHaveBeenCalled();
        expect(component.financialSummary).toEqual(mockData);
    });

    it('deve navegar para rota informada', () => {
        component.navigateTo('/goals');
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/goals']);
    });

    it('deve realizar logout e redirecionar', () => {
        spyOn(sessionStorage, 'removeItem');
        component.logout();
        expect(sessionStorage.removeItem).toHaveBeenCalledWith('env');
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/environments']);
    });
});
