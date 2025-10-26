import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UserInfoForViewDto, UserDataForUpdateDto } from 'src/app/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getUser(): Observable<UserInfoForViewDto> {
    return this.http.get<UserInfoForViewDto>(`${this.apiUrl}userManipulation/get/user`);
  }

  updateUser(userData: UserDataForUpdateDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}userManipulation/update/user`, userData);
  }
}
