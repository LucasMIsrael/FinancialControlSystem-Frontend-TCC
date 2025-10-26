import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { environment } from 'src/environments/environment';
import { UserInfoForViewDto, UserDataForUpdateDto } from 'src/app/models/user.model';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl;

  // Mock de dados para os testes
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
      // Importa o módulo de testes do HttpClient para interceptar requisições
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });

    // Injeta o serviço e o HttpTestingController
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  // Garante que não haja requisições pendentes após cada teste
  afterEach(() => {
    httpMock.verify();
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  // --- Testes para getUser() ---
  describe('getUser', () => {
    it('deve realizar um GET e retornar os dados do usuário', () => {
      let result: UserInfoForViewDto | undefined;

      // 1. Executa o método do serviço
      service.getUser().subscribe(user => {
        result = user;
      });

      // 2. Espera que uma requisição GET tenha sido feita para a URL correta
      const req = httpMock.expectOne(`${apiUrl}userManipulation/get/user`);
      expect(req.request.method).toBe('GET');

      // 3. Fornece o mock de resposta para a requisição
      req.flush(mockUser);

      // 4. Verifica se o resultado da subscrição corresponde ao mock
      expect(result).toEqual(mockUser);
    });
  });

  // --- Testes para updateUser() ---
  describe('updateUser', () => {
    it('deve realizar um PUT para a URL correta com o payload de dados', () => {
      let completed = false;

      // 1. Executa o método do serviço
      service.updateUser(mockUpdateData).subscribe(() => {
        completed = true;
      });

      // 2. Espera que uma requisição PUT tenha sido feita para a URL correta
      const req = httpMock.expectOne(`${apiUrl}userManipulation/update/user`);
      expect(req.request.method).toBe('PUT');

      // 3. Verifica se o corpo (payload) da requisição corresponde aos dados enviados
      expect(req.request.body).toEqual(mockUpdateData);

      // 4. Fornece uma resposta vazia (o método retorna Observable<void>)
      req.flush({});

      // 5. Verifica se a subscrição foi concluída
      expect(completed).toBeTrue();
    });

    it('deve enviar apenas nome e email se senhas não forem fornecidas', () => {
      const partialUpdate: UserDataForUpdateDto = {
        id: '1',
        name: 'Apenas Nome',
        email: 'apenas@email.com'
        // Senhas omitidas (undefined)
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
