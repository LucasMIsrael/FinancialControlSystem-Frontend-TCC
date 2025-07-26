// src/app/pages/register/register.component.ts
import { Component } from '@angular/core';
import { UserDataDto } from 'src/app/models/user-data-dto';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  userData: UserDataDto = {
    name: '',
    email: '',
    password: ''
  };

  constructor(private authService: AuthService) { }

  register(): void {
    this.authService.registerUser(this.userData).subscribe({
      next: () => {
        console.log('Registro realizado com sucesso');
      },
      error: err => {
        console.error('Erro ao registrar usuário:', err);
      }
    });
  }
}
