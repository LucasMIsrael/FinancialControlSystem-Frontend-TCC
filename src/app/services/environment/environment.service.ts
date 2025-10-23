import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnvironmentData } from 'src/app/models/environment-data';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAll(): Observable<EnvironmentData[]> {
    return this.http.get<EnvironmentData[]>(`${this.apiUrl}envManipulation/get/all/environment`);
  }

  createEnvironment(env: EnvironmentData): Observable<any> {
    return this.http.post(`${this.apiUrl}envManipulation/create/environment`, env);
  }

  deleteEnvironment(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}envManipulation/delete/environment?input=${id}`);
  }

  updateEnvironment(env: EnvironmentData): Observable<any> {
    return this.http.put(`${this.apiUrl}envManipulation/update/environment`, env);
  }

  setEnvironment(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}envManipulation/set/environment?environmentId=${id}`, {});
  }
}