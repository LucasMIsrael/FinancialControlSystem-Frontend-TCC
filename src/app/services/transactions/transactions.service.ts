import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TransactionDataDto, TransactionDataForViewDto } from '../../models/transaction.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {
  private apiUrl = environment.apiUrl + 'transaction';

  constructor(
    private http: HttpClient
  ) { }

  private getHeaders() {
    const token = localStorage.getItem('authToken');

    return {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    };
  }

  createPlannedTransaction(transaction: TransactionDataDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/create/planned`, transaction, this.getHeaders());
  }

  createUnplannedTransaction(transaction: TransactionDataDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/create/unplanned`, transaction, this.getHeaders());
  }

  updatePlannedTransaction(transaction: TransactionDataDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/planned`, transaction, this.getHeaders());
  }

  updateUnplannedTransaction(transaction: TransactionDataDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/unplanned`, transaction, this.getHeaders());
  }

  deleteTransaction(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/transaction?input=${id}`, this.getHeaders());
  }

  getAllPlannedTransactions(): Observable<TransactionDataForViewDto[]> {
    return this.http.get<TransactionDataForViewDto[]>(`${this.apiUrl}/get/all/planned`, this.getHeaders());
  }

  getAllUnplannedTransactions(): Observable<TransactionDataForViewDto[]> {
    return this.http.get<TransactionDataForViewDto[]>(`${this.apiUrl}/get/all/unplanned`, this.getHeaders());
  }
}