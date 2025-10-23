import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DashboardService } from './dashboard.service';
import {
    FinancialSummaryDto,
    TopRecurringGoalsAchievedDto,
    UnexpectedExpensesAnalysisDto,
    GoalsSummaryDto,
    BalanceOverTimeDto,
    AchievementsDistributionDto,
    FiltersForBalanceProjectionDto,
    ProjectedBalanceDto,
    FilterForBalanceOverTimeDto
} from 'src/app/models/dashboard.model';
import { environment } from 'src/environments/environment';

describe('DashboardService', () => {
    let service: DashboardService;
    let httpMock: HttpTestingController;
    const apiUrl = environment.apiUrl;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [DashboardService]
        });

        service = TestBed.inject(DashboardService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('deve ser criado', () => {
        expect(service).toBeTruthy();
    });

    it('deve buscar resumo financeiro', () => {
        const mockResponse: FinancialSummaryDto = {
            currentBalance: 1000,
            totalProfit: 2000,
            totalExpense: 1000,
            profitMargin: '50%',
            level: 3
        };

        service.getFinancialSummary().subscribe(res => {
            expect(res).toEqual(mockResponse);
        });

        const req = httpMock.expectOne(`${apiUrl}dashboard/get/financial-summary`);
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
    });

    it('deve buscar metas recorrentes concluídas', () => {
        const mockResponse: TopRecurringGoalsAchievedDto[] = [{ achievementsCount: 5, goalNumber: 1, description: 'Meta A', value: 100 }];

        service.getTopGoalsAchieved().subscribe(res => {
            expect(res.length).toBe(1);
            expect(res[0].description).toBe('Meta A');
        });

        const req = httpMock.expectOne(`${apiUrl}dashboard/get/top-goals-achieved`);
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
    });

    it('deve buscar análise de despesas não planejadas', () => {
        const mockResponse: UnexpectedExpensesAnalysisDto = {
            totalUnexpectedExpenses: 500,
            totalProfits: 1500,
            percentage: '33%',
            alertLevel: 'moderado'
        };

        service.getUnplannedExpensesAnalysis().subscribe(res => {
            expect(res.alertLevel).toBe('moderado');
        });

        const req = httpMock.expectOne(`${apiUrl}dashboard/get/unplanned-expenses-analysis`);
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
    });

    it('deve buscar metas não recorrentes', () => {
        const mockResponse: GoalsSummaryDto = { completed: 3, pending: 2 };

        service.getNonRecurringGoals().subscribe(res => {
            expect(res.completed).toBe(3);
        });

        const req = httpMock.expectOne(`${apiUrl}dashboard/get/non-recurring-goals`);
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
    });

    it('deve buscar saldo ao longo do tempo com filtros', () => {
        const filter: FilterForBalanceOverTimeDto = { startDate: '2024-01-01', endDate: '2024-12-31' };
        const mockResponse: BalanceOverTimeDto[] = [{ date: '2024-05', balance: 500 }];

        service.getBalanceOverTime(filter).subscribe(res => {
            expect(res[0].balance).toBe(500);
        });

        const req = httpMock.expectOne(r =>
            r.url === `${apiUrl}dashboard/get/balance-over-time` &&
            r.params.get('startDate') === '2024-01-01' &&
            r.params.get('endDate') === '2024-12-31'
        );

        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
    });

    it('deve buscar distribuição de metas', () => {
        const mockResponse: AchievementsDistributionDto[] = [{ periodType: 'Mensal', totalAchievements: 10 }];

        service.getGoalsDistribution().subscribe(res => {
            expect(res[0].periodType).toBe('Mensal');
        });

        const req = httpMock.expectOne(`${apiUrl}dashboard/get/goals-distribuition`);
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
    });

    it('deve buscar projeção de saldo com filtros', () => {
        const filter: FiltersForBalanceProjectionDto = { periodValue: 6, isYear: false };
        const mockResponse: ProjectedBalanceDto[] = [{ periodLabel: 'Junho', projectedBalance: 2000 }];

        service.getBalanceProjection(filter).subscribe(res => {
            expect(res[0].projectedBalance).toBe(2000);
        });

        const req = httpMock.expectOne(r =>
            r.url === `${apiUrl}dashboard/get/balance-projection` &&
            r.params.get('periodValue') === '6' &&
            r.params.get('isYear') === 'false'
        );

        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
    });

    it('deve atualizar saldo do ambiente', () => {
        service.updateEnvironmentBalance().subscribe(res => {
            expect(res).toBeNull(); // <-- alterado
        });

        const req = httpMock.expectOne(`${apiUrl}transaction/update/totalBalance`);
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toBeNull();
        req.flush(null);
    });

    it('deve editar saldo total com valor enviado', () => {
        const value = 2500;

        service.editTotalBalance(value).subscribe(res => {
            expect(res).toBeNull(); // <-- alterado
        });

        const req = httpMock.expectOne(`${apiUrl}dashboard/edit/envBalance`);
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual({ value });
        req.flush(null);
    });
});
