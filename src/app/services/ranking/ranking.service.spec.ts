import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RankingService } from './ranking.service';
import { environment } from 'src/environments/environment';
import { RankingDto } from 'src/app/models/ranking.model';

describe('RankingService', () => {
    let service: RankingService;
    let httpMock: HttpTestingController;

    const mockRanking: RankingDto[] = [
        { userName: 'João', totalGoalsAchieved: 10, environmentLevel: 'Mestre', creationTime: '2025-10-25' },
        { userName: 'Maria', totalGoalsAchieved: 8, environmentLevel: 'Avançado', creationTime: '2025-10-24' }
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [RankingService]
        });

        service = TestBed.inject(RankingService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify(); // Garante que não existam requisições pendentes
    });

    it('deve ser criado corretamente', () => {
        expect(service).toBeTruthy();
    });

    it('deve fazer uma requisição GET para buscar o ranking', () => {
        service.getRanking().subscribe((data) => {
            expect(data.length).toBe(2);
            expect(data[0].userName).toBe('João');
        });

        const req = httpMock.expectOne(`${environment.apiUrl}ranking/get`);
        expect(req.request.method).toBe('GET');
        req.flush(mockRanking);
    });

    it('deve retornar erro quando a requisição falhar', () => {
        const errorMessage = 'Erro ao carregar ranking';

        service.getRanking().subscribe({
            next: () => fail('A requisição deveria ter falhado'),
            error: (error) => {
                expect(error.status).toBe(500);
                expect(error.statusText).toBe('Server Error');
            }
        });

        const req = httpMock.expectOne(`${environment.apiUrl}ranking/get`);
        req.flush(errorMessage, { status: 500, statusText: 'Server Error' });
    });
});
