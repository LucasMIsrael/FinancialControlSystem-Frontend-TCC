import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RegisterComponent } from './register.component';
import { AuthService } from 'src/app/services/auth.service';
import { of, throwError } from 'rxjs';
import { UserDataDto } from 'src/app/models/user-data-dto';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('AuthService', ['registerUser']);

    await TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      imports: [FormsModule],
      providers: [{ provide: AuthService, useValue: spy }]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve chamar registerUser ao submeter o formulário', () => {
    const userMock: UserDataDto = {
      name: 'João',
      email: 'joao@email.com',
      password: '123456'
    };
    spyOn(console, 'log');
    authServiceSpy.registerUser.and.returnValue(of({}));

    component.userData = userMock;
    component.register();

    expect(authServiceSpy.registerUser).toHaveBeenCalledWith(userMock);
    expect(console.log).toHaveBeenCalledWith('Registro realizado com sucesso');
  });

  it('deve exibir erro se o registro falhar', () => {
    const errorResponse = { message: 'Erro de registro' };
    spyOn(console, 'error');
    authServiceSpy.registerUser.and.returnValue(throwError(() => errorResponse));

    component.userData = {
      name: 'Erro',
      email: 'erro@email.com',
      password: '123'
    };

    component.register();

    expect(authServiceSpy.registerUser).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith('Erro ao registrar usuário:', errorResponse);
  });
});
