import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GoalDataForViewDto, GoalDataDto } from 'src/app/models/goal.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GoalsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAllGoals(): Observable<GoalDataForViewDto[]> {
    return this.http.get<GoalDataForViewDto[]>(`${this.apiUrl}goalsManipulation/get/all/goals`);
  }

  createGoal(goal: GoalDataDto): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}goalsManipulation/create/goal`, goal);
  }

  updateGoal(goal: GoalDataDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}goalsManipulation/update/goal`, goal);
  }

  deleteGoal(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}goalsManipulation/delete/goal?id=${id}`);
  }

  // updateAchievedGoals(id: string): Observable<void> {
  //   return this.http.get<void>(`${this.apiUrl}goalsManipulation/update/achieved/goals`);
  // }
}