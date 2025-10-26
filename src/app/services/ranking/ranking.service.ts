import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RankingDto } from 'src/app/models/ranking.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RankingService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getRanking(): Observable<RankingDto[]> {
    return this.http.get<RankingDto[]>(`${this.apiUrl}ranking/get`);
  }
}