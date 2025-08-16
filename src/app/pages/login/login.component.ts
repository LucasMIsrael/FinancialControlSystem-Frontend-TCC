import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  backendError = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  login(): void {
    if (this.loginForm.invalid) {
      //marca os campos como tocados para exibir as mensagens no html
      this.loginForm.markAllAsTouched();
      return;
    }

    this.authService.loginUser(this.loginForm.value).subscribe({
      next: (res) => {
        sessionStorage.setItem('token', res.token);
        // Redirecionar para outra página
      },
      error: (err) => {
        this.backendError = err?.error || 'Erro ao fazer login.';

        setTimeout(() => {
          this.backendError = '';
        }, 5000);
      }
    });
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  closeError(): void {
    this.backendError = '';
  }
}
