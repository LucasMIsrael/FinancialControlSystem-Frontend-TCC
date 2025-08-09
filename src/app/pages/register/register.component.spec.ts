import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RegisterComponent } from './register.component';
import { AuthService } from 'src/app/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['registerUser']);
    const snackSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, BrowserAnimationsModule],
      declarations: [RegisterComponent],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: MatSnackBar, useValue: snackSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    fixture.detectChanges();
  });

  function fillValidForm(overrides: Partial<any> = {}) {
    component.registerForm.setValue({
      name: overrides['name'] || 'João',
      email: overrides['email'] || 'joao@email.com',
      password: overrides['password'] || 'abc12345678', // 11+ chars, letras e números
      confirmPassword: overrides['confirmPassword'] || 'abc12345678'
    });
  }

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve chamar registerUser ao submeter o formulário', () => {
    fillValidForm();
    authServiceSpy.registerUser.and.returnValue(of({}));

    component.register();

    expect(authServiceSpy.registerUser).toHaveBeenCalledWith({
      name: 'João',
      email: 'joao@email.com',
      password: 'abc12345678'
    });
  });

  it('deve exibir mensagem de erro se o registro falhar', () => {
    fillValidForm();
    const errorMessage = 'Erro ao registrar usuário';
    authServiceSpy.registerUser.and.returnValue(
      throwError(() => ({ error: errorMessage }))
    );

    component.register();

    expect(component.showMessage).toBeTrue();
    expect(component.isSuccess).toBeFalse();
    expect(component.messageText).toBe(errorMessage);
  });

  it('não deve chamar registerUser se o formulário for inválido', () => {
    component.registerForm.setValue({
      name: '',
      email: 'invalido',
      password: '123',
      confirmPassword: '123'
    });

    component.register();

    expect(authServiceSpy.registerUser).not.toHaveBeenCalled();
  });

  it('deve definir passwordMismatch como true se as senhas não coincidirem', () => {
    fillValidForm({ confirmPassword: 'senhaErrada123' });

    component.register();

    expect(component.passwordMismatch).toBeTrue();
    expect(authServiceSpy.registerUser).not.toHaveBeenCalled();
  });
});
