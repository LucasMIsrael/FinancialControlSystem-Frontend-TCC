import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TransactionsService } from './transactions.service';
import { TransactionDataDto, TransactionDataForViewDto, TransactionTypeEnum, TransactionRecurrenceTypeEnum } from '../../models/transaction.model';
import { environment } from 'src/environments/environment';

describe('TransactionsService', () => {
    let service: TransactionsService;
    let httpMock: HttpTestingController;
    const apiUrl = environment.apiUrl + 'transaction';

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [TransactionsService]
        });

        service = TestBed.inject(TransactionsService);
        httpMock = TestBed.inject(HttpTestingController);
        localStorage.setItem('authToken', 'fake-token');
    });

    afterEach(() => {
        httpMock.verify();
        localStorage.clear();
    });

    const mockTransaction: TransactionDataDto = {
        id: '1',
        type: TransactionTypeEnum.Income,
        recurrenceType: TransactionRecurrenceTypeEnum.None,
        description: 'Salário',
        amount: 5000,
        transactionDate: '2025-10-13'
    };

    const mockTransactionsForView: TransactionDataForViewDto[] = [
        { ...mockTransaction, id: '1', transactionNumber: 1 },
        { ...mockTransaction, id: '2', transactionNumber: 2 }
    ];

    it('deve ser criado', () => {
        expect(service).toBeTruthy();
    });

    it('deve incluir o token de autenticação nos headers', () => {
        const headers = service['getHeaders']();
        expect(headers.headers['Authorization']).toBe('Bearer fake-token');
    });

    it('deve criar uma transação planejada (createPlannedTransaction)', () => {
        service.createPlannedTransaction(mockTransaction).subscribe(response => {
            expect(response).toBeTruthy();
        });

        const req = httpMock.expectOne(`${apiUrl}/create/planned`);
        expect(req.request.method).toBe('POST');
        expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');
        req.flush({ success: true });
    });

    it('deve criar uma transação não planejada (createUnplannedTransaction)', () => {
        service.createUnplannedTransaction(mockTransaction).subscribe(response => {
            expect(response).toBeTruthy();
        });

        const req = httpMock.expectOne(`${apiUrl}/create/unplanned`);
        expect(req.request.method).toBe('POST');
        req.flush({ success: true });
    });

    it('deve atualizar uma transação planejada (updatePlannedTransaction)', () => {
        service.updatePlannedTransaction(mockTransaction).subscribe(response => {
            expect(response).toBeTruthy();
        });

        const req = httpMock.expectOne(`${apiUrl}/update/planned`);
        expect(req.request.method).toBe('PUT');
        req.flush({ success: true });
    });

    it('deve atualizar uma transação não planejada (updateUnplannedTransaction)', () => {
        service.updateUnplannedTransaction(mockTransaction).subscribe(response => {
            expect(response).toBeTruthy();
        });

        const req = httpMock.expectOne(`${apiUrl}/update/unplanned`);
        expect(req.request.method).toBe('PUT');
        req.flush({ success: true });
    });

    it('deve excluir uma transação (deleteTransaction)', () => {
        service.deleteTransaction('1').subscribe(response => {
            expect(response).toBeTruthy();
        });

        const req = httpMock.expectOne(`${apiUrl}/delete/transaction?input=1`);
        expect(req.request.method).toBe('DELETE');
        req.flush({ success: true });
    });

    it('deve obter todas as transações planejadas (getAllPlannedTransactions)', () => {
        service.getAllPlannedTransactions().subscribe(transactions => {
            expect(transactions.length).toBe(2);
            expect(transactions[0].description).toBe('Salário');
        });

        const req = httpMock.expectOne(`${apiUrl}/get/all/planned`);
        expect(req.request.method).toBe('GET');
        req.flush(mockTransactionsForView);
    });

    it('deve obter todas as transações não planejadas (getAllUnplannedTransactions)', () => {
        service.getAllUnplannedTransactions().subscribe(transactions => {
            expect(transactions.length).toBe(2);
            expect(transactions[1].id).toBe('2');
        });

        const req = httpMock.expectOne(`${apiUrl}/get/all/unplanned`);
        expect(req.request.method).toBe('GET');
        req.flush(mockTransactionsForView);
    });
});
