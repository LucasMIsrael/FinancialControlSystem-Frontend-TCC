import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginData = {
    email: '',
    password: ''
  };

  constructor(private authService: AuthService) { }

  login(): void {
    this.authService.loginUser(this.loginData).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        console.log('Login bem-sucedido!');
        // redirecionar se quiser
      },
      error: err => {
        console.error('Erro no login:', err);
      }
    });
  }
}
