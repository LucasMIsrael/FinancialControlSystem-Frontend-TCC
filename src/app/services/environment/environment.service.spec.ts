import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EnvironmentService } from './environment.service';
import { EnvironmentData, EnvironmentTypeEnum } from 'src/app/models/environment-data';
import { environment } from 'src/environments/environment';

describe('EnvironmentService', () => {
  let service: EnvironmentService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EnvironmentService]
    });

    service = TestBed.inject(EnvironmentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // garante que não restaram requisições pendentes
  });

  it('Deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  it('Deve chamar getAll e retornar lista de ambientes', () => {
    const mockEnvironments: EnvironmentData[] = [
      { id: '1', name: 'Ambiente 1', description: 'Descrição 1', type: EnvironmentTypeEnum.Personal },
      { id: '2', name: 'Ambiente 2', description: 'Descrição 2', type: EnvironmentTypeEnum.Business }
    ];

    service.getAll().subscribe(envs => {
      expect(envs.length).toBe(2);
      expect(envs).toEqual(mockEnvironments);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}envManipulation/get/all/environment`);
    expect(req.request.method).toBe('GET');
    req.flush(mockEnvironments);
  });

  it('Deve criar um novo ambiente com createEnvironment', () => {
    const newEnv: EnvironmentData = {
      id: '3',
      name: 'Novo Ambiente',
      description: 'Descrição Novo',
      type: EnvironmentTypeEnum.Family
    };

    service.createEnvironment(newEnv).subscribe(res => {
      expect(res).toEqual({ success: true });
    });

    const req = httpMock.expectOne(`${environment.apiUrl}envManipulation/create/environment`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newEnv);
    req.flush({ success: true });
  });

  it('Deve deletar um ambiente com deleteEnvironment', () => {
    const idToDelete = '3';

    service.deleteEnvironment(idToDelete).subscribe(res => {
      expect(res).toEqual({ success: true });
    });

    const req = httpMock.expectOne(`${environment.apiUrl}envManipulation/delete/environment?input=${idToDelete}`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true });
  });

  it('Deve atualizar um ambiente com updateEnvironment', () => {
    const updatedEnv: EnvironmentData = {
      id: '2',
      name: 'Ambiente Atualizado',
      description: 'Descrição Atualizada',
      type: EnvironmentTypeEnum.Business
    };

    service.updateEnvironment(updatedEnv).subscribe(res => {
      expect(res).toEqual({ success: true });
    });

    const req = httpMock.expectOne(`${environment.apiUrl}envManipulation/update/environment`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedEnv);
    req.flush({ success: true });
  });
});
