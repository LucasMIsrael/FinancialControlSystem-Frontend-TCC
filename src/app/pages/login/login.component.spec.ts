import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { LoginComponent } from './login.component';
import { Router } from '@angular/router';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['loginUser']);
    const rSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [ReactiveFormsModule, FormsModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: rSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve chamar loginUser ao submeter o formulário', () => {
    const mockResponse = { token: 'fakeToken123' };
    authServiceSpy.loginUser.and.returnValue(of(mockResponse));

    component.loginForm.setValue({
      email: 'usuario@teste.com',
      password: '123456'
    });

    component.login();

    expect(authServiceSpy.loginUser).toHaveBeenCalledWith({
      email: 'usuario@teste.com',
      password: '123456'
    });
  });

  it('deve redirecionar para /environments após login bem-sucedido', () => {
    const mockResponse = { token: 'fakeToken123' };
    authServiceSpy.loginUser.and.returnValue(of(mockResponse));

    component.loginForm.setValue({
      email: 'usuario@teste.com',
      password: '123456'
    });

    component.login();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/environments']);
  });

  it('deve exibir erro ao falhar o login', fakeAsync(() => {
    const mockError = { error: 'Credenciais inválidas' };
    authServiceSpy.loginUser.and.returnValue(throwError(() => mockError));

    component.loginForm.setValue({
      email: 'usuario@teste.com',
      password: 'senhaErrada'
    });

    component.login();
    tick(); // processa a chamada do subscribe

    expect(component.backendError).toBe('Credenciais inválidas');

    tick(5000); // processa o setTimeout de limpeza
    expect(component.backendError).toBe('');
  }));

  it('deve limpar a mensagem de erro após 5 segundos (teste isolado)', fakeAsync(() => {
    const mockError = { error: 'Erro de teste' };
    authServiceSpy.loginUser.and.returnValue(throwError(() => mockError));

    component.loginForm.setValue({
      email: 'usuario@teste.com',
      password: '123456'
    });

    component.login();
    tick(); // dispara subscribe
    expect(component.backendError).toBe('Erro de teste');

    tick(5000); // simula passagem de 5s
    expect(component.backendError).toBe('');
  }));

  it('deve marcar todos os campos como tocados se o formulário for inválido', () => {
    spyOn(component.loginForm, 'markAllAsTouched');
    component.loginForm.setValue({ email: '', password: '' });
    component.login();
    expect(component.loginForm.markAllAsTouched).toHaveBeenCalled();
  });

  it('deve limpar backendError ao chamar closeError', () => {
    component.backendError = 'Mensagem de erro';
    component.closeError();
    expect(component.backendError).toBe('');
  });
});
