import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { environment } from 'src/environments/environment';
import { UserInfoForViewDto, UserDataForUpdateDto } from 'src/app/models/user.model';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl;

  const mockUser: UserInfoForViewDto = {
    id: '1',
    name: 'Teste',
    email: 'teste@finvision.com'
  };

  const mockUpdateData: UserDataForUpdateDto = {
    id: '1',
    name: 'Novo Nome',
    email: 'novo@email.com',
    newPassword: 'newPassword123',
    oldPassword: 'oldPassword123'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  describe('getUser', () => {
    it('deve realizar um GET e retornar os dados do usuário', () => {
      let result: UserInfoForViewDto | undefined;

      service.getUser().subscribe(user => {
        result = user;
      });

      const req = httpMock.expectOne(`${apiUrl}userManipulation/get/user`);
      expect(req.request.method).toBe('GET');

      req.flush(mockUser);

      expect(result).toEqual(mockUser);
    });
  });

  describe('updateUser', () => {
    it('deve realizar um PUT para a URL correta com o payload de dados', () => {
      let completed = false;

      service.updateUser(mockUpdateData).subscribe(() => {
        completed = true;
      });

      const req = httpMock.expectOne(`${apiUrl}userManipulation/update/user`);
      expect(req.request.method).toBe('PUT');

      expect(req.request.body).toEqual(mockUpdateData);

      req.flush({});

      expect(completed).toBeTrue();
    });

    it('deve enviar apenas nome e email se senhas não forem fornecidas', () => {
      const partialUpdate: UserDataForUpdateDto = {
        id: '1',
        name: 'Apenas Nome',
        email: 'apenas@email.com'
      };
      let completed = false;

      service.updateUser(partialUpdate).subscribe(() => {
        completed = true;
      });

      const req = httpMock.expectOne(`${apiUrl}userManipulation/update/user`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(partialUpdate);
      req.flush({});
      expect(completed).toBeTrue();
    });
  });
});
