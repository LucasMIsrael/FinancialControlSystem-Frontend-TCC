import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './login.component';
import { AuthService } from 'src/app/services/auth.service';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('AuthService', ['loginUser']);

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [FormsModule],
      providers: [{ provide: AuthService, useValue: spy }]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve chamar loginUser ao submeter o formulário', () => {
    const tokenMock = 'mocked-token';
    authServiceSpy.loginUser.and.returnValue(of({ token: tokenMock }));

    component.loginData = { email: 'teste@email.com', password: '123456' };

    component.login();

    expect(authServiceSpy.loginUser).toHaveBeenCalledWith(component.loginData);
    expect(localStorage.getItem('token')).toBe(tokenMock);
  });

  it('deve exibir erro ao falhar o login', () => {
    const errorResponse = { message: 'Erro de login' };
    spyOn(console, 'error');

    authServiceSpy.loginUser.and.returnValue(throwError(() => errorResponse));

    component.loginData = { email: 'errado@email.com', password: 'senhaerrada' };
    component.login();

    expect(authServiceSpy.loginUser).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith('Erro no login:', errorResponse);
  });
});
