import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserDataDto } from 'src/app/models/user-data-dto';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  submitted = false;
  passwordMismatch = false;
  showMessage = false;
  isSuccess = false;
  messageText = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(11),
        Validators.pattern('^(?=.*[a-zA-Z])(?=.*\\d).{11,}$')
      ]],
      confirmPassword: ['', Validators.required]
    });
  }

  register(): void {
    this.submitted = true;
    this.passwordMismatch = false;

    const { password, confirmPassword } = this.registerForm.value;

    if (this.registerForm.invalid) return;

    if (password !== confirmPassword) {
      this.passwordMismatch = true;
      return;
    }

    const userData: UserDataDto = {
      name: this.registerForm.value.name,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password
    };

    this.authService.registerUser(userData).subscribe({
      next: () => {
        this.showMessage = true;
        this.isSuccess = true;
        this.messageText = 'Registro realizado com sucesso!';

        setTimeout(() => {
          this.closeMessage();
          this.router.navigate(['']);
        }, 1000);
      },
      error: (err) => {
        this.showMessage = true;
        this.isSuccess = false;
        this.messageText = typeof err.error === 'string'
          ? err.error
          : 'Erro ao registrar usuário';

        setTimeout(() => {
          this.closeMessage();
        }, 5000);
      }
    });
  }

  closeMessage() {
    this.showMessage = false;
  }
}
