import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FinancialSummaryDto, TopRecurringGoalsAchievedDto, UnexpectedExpensesAnalysisDto, GoalsSummaryDto, FilterForBalanceOverTimeDto, BalanceOverTimeDto, AchievementsDistributionDto, FiltersForBalanceProjectionDto, ProjectedBalanceDto } from 'src/app/models/dashboard.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient
  ) { }

  getFinancialSummary(): Observable<FinancialSummaryDto> {
    return this.http.get<FinancialSummaryDto>(`${this.apiUrl}dashboard/get/financial-summary`);
  }

  getTopGoalsAchieved(): Observable<TopRecurringGoalsAchievedDto[]> {
    return this.http.get<TopRecurringGoalsAchievedDto[]>(`${this.apiUrl}dashboard/get/top-goals-achieved`);
  }

  getUnplannedExpensesAnalysis(): Observable<UnexpectedExpensesAnalysisDto> {
    return this.http.get<UnexpectedExpensesAnalysisDto>(`${this.apiUrl}dashboard/get/unplanned-expenses-analysis`);
  }

  getNonRecurringGoals(): Observable<GoalsSummaryDto> {
    return this.http.get<GoalsSummaryDto>(`${this.apiUrl}dashboard/get/non-recurring-goals`);
  }

  getBalanceOverTime(filter: FilterForBalanceOverTimeDto): Observable<BalanceOverTimeDto[]> {
    const params = new HttpParams()
      .set('startDate', filter.startDate)
      .set('endDate', filter.endDate);

    return this.http.get<BalanceOverTimeDto[]>(`${this.apiUrl}dashboard/get/balance-over-time`, { params });
  }

  getGoalsDistribution(): Observable<AchievementsDistributionDto[]> {
    return this.http.get<AchievementsDistributionDto[]>(`${this.apiUrl}dashboard/get/goals-distribuition`);
  }

  getBalanceProjection(filter: FiltersForBalanceProjectionDto): Observable<ProjectedBalanceDto[]> {
    const params = new HttpParams()
      .set('periodValue', filter.periodValue.toString())
      .set('isYear', filter.isYear.toString());

    return this.http.get<ProjectedBalanceDto[]>(`${this.apiUrl}dashboard/get/balance-projection`, { params });
  }

  updateEnvironmentBalance(): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}transaction/update/totalBalance`, null);
  }

  editTotalBalance(value: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}dashboard/edit/envBalance`, { value });
  }
}