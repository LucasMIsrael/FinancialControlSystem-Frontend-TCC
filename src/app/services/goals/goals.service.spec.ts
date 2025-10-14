import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GoalsService } from './goals.service';
import { GoalDataDto } from 'src/app/models/goal.model';
import { environment } from 'src/environments/environment';

describe('GoalsService', () => {
    let service: GoalsService;
    let httpMock: HttpTestingController;
    const apiUrl = environment.apiUrl;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [GoalsService]
        });
        service = TestBed.inject(GoalsService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('deve criar uma meta (createGoal)', () => {
        const mockGoal: GoalDataDto = { description: 'Nova Meta', value: 150 };

        service.createGoal(mockGoal).subscribe((response) => {
            expect(response == null).toBeTrue(); // ✅ aceita null ou undefined
        });

        const req = httpMock.expectOne(`${apiUrl}goalsManipulation/create/goal`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(mockGoal);
        req.flush(null);
    });

    it('deve atualizar uma meta (updateGoal)', () => {
        const updatedGoal: GoalDataDto = { id: '1', description: 'Meta Atualizada', value: 300 };

        service.updateGoal(updatedGoal).subscribe((response) => {
            expect(response == null).toBeTrue(); // ✅ aceita null ou undefined
        });

        const req = httpMock.expectOne(`${apiUrl}goalsManipulation/update/goal`);
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual(updatedGoal);
        req.flush(null);
    });

    it('deve excluir uma meta (deleteGoal)', () => {
        const goalId = '1';

        service.deleteGoal(goalId).subscribe((response) => {
            expect(response == null).toBeTrue(); // ✅ aceita null ou undefined
        });

        const req = httpMock.expectOne(`${apiUrl}goalsManipulation/delete/goal?id=${goalId}`);
        expect(req.request.method).toBe('DELETE');
        req.flush(null);
    });

});
