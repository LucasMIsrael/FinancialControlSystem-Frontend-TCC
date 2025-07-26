import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  registerUser(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}loginAndRegister/register/user`, data);
  }

  loginUser(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}loginAndRegister/login/user`, data);
  }
}
