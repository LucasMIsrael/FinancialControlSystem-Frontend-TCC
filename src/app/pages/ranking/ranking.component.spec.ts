import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { RankingComponent } from './ranking.component';
import { RankingService } from 'src/app/services/ranking/ranking.service';
import { RankingDto } from 'src/app/models/ranking.model';

const mockRankingList: RankingDto[] = [
    { userName: 'User B', totalGoalsAchieved: 15, environmentLevel: 'Mestre', creationTime: '2024-02-01' },
    { userName: 'User A', totalGoalsAchieved: 5, environmentLevel: 'Iniciante', creationTime: '2024-03-01' },
    { userName: 'User C', totalGoalsAchieved: 10, environmentLevel: 'Especialista', creationTime: '2024-01-01' },
];

const mockRouter = {
    navigate: jasmine.createSpy('navigate'),
};

describe('RankingComponent', () => {
    let component: RankingComponent;
    let fixture: ComponentFixture<RankingComponent>;
    let rankingService: RankingService;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [RankingComponent],
            providers: [
                RankingService,
                { provide: Router, useValue: mockRouter },
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RankingComponent);
        component = fixture.componentInstance;
        rankingService = (component as any).rankingService;

        mockRouter.navigate.calls.reset();
    });

    // --- Teste 1: Criação e Inicialização ---
    it('deve criar e chamar loadRanking na inicialização', () => {
        spyOn(component, 'loadRanking');

        fixture.detectChanges();

        expect(component).toBeTruthy();
        expect(component.loadRanking).toHaveBeenCalled();
    });

    // --- Teste 2: Carregamento de Ranking com Sucesso e Ordenação ---
    it('deve carregar a lista de classificação, classificá-la por TotalGoalsAchieved em ordem decrescente', waitForAsync(() => {
        spyOn(rankingService, 'getRanking').and.returnValue(of(mockRankingList));

        component.loadRanking();

        expect(component.rankingList.length).toBe(3);
        expect(component.rankingList[0].userName).toBe('User B'); // 15 metas
        expect(component.rankingList[1].userName).toBe('User C'); // 10 metas
        expect(component.rankingList[2].userName).toBe('User A'); // 5 metas
        expect(component.rankingList[0].totalGoalsAchieved).toBe(15);
    }));

    // --- Teste 3: Carregamento de Ranking com Erro ---
    it('deve definir backendError em caso de falha de loadRanking', () => {
        const errorResponse = { error: 'Failed to fetch data' };
        spyOn(rankingService, 'getRanking').and.returnValue(throwError(() => errorResponse));
        spyOn((component as any), 'showError');

        component.loadRanking();

        expect(component.rankingList.length).toBe(0);
        expect((component as any).showError).toHaveBeenCalledWith(errorResponse, 'Erro ao carregar o ranking');
    });

    // --- Teste 4: Função de Logout ---
    it('deve limpar a sessão e navegar no logout', () => {
        spyOn(sessionStorage, 'removeItem');

        component.logout();

        expect(sessionStorage.removeItem).toHaveBeenCalledWith('env');
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/environments']);
    });

    // --- Teste 5: Função de getLevelColor (Utilidade) ---
    it('deve retornar a cor correta para níveis ambientais específicos', () => {
        expect(component.getLevelColor('Iniciante')).toBe('#E74C3C');
        expect(component.getLevelColor('Avançado')).toBe('#2ECC71');
        expect(component.getLevelColor('Mestre')).toBe('#9B59B6');
        expect(component.getLevelColor('Não Existe')).toBe('');
    });
});