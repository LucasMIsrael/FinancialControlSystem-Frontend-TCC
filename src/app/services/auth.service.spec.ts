import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verifica se não houve requisições pendentes
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  it('deve chamar registerUser e retornar dados', () => {
    const mockRequest = { name: 'User', email: 'user@email.com', password: '123' };
    const mockResponse = { message: 'Registered successfully' };

    service.registerUser(mockRequest).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}loginAndRegister/register/user`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('deve chamar loginUser e retornar dados', () => {
    const mockRequest = { email: 'user@email.com', password: '123' };
    const mockResponse = { token: 'abc123' };

    service.loginUser(mockRequest).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}loginAndRegister/login/user`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });
});
