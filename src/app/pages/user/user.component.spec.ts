import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserComponent } from './user.component';
import { UserService } from 'src/app/services/user/user.service';
import { UserInfoForViewDto } from 'src/app/models/user-info-for-view';
import { UserDataForUpdateDto } from 'src/app/models/user-info-for-update';

describe('UserComponent', () => {
  let component: UserComponent;
  let fixture: ComponentFixture<UserComponent>;
  // Mock do UserService e Router
  let userServiceMock: any;
  let routerMock: any;

  const mockUser: UserInfoForViewDto = {
    id: '1',
    name: 'Mestre',
    email: 'mestre@qametrik.com'
  };

  beforeEach(async () => {
    // Configura o Mock do UserService
    userServiceMock = {
      getUser: jasmine.createSpy('getUser').and.returnValue(of(mockUser)),
      updateUser: jasmine.createSpy('updateUser').and.returnValue(of({}))
    };

    // Configura o Mock do Router
    routerMock = {
      navigate: jasmine.createSpy('navigate')
    };

    await TestBed.configureTestingModule({
      // ADICIONADO: Importação do FormsModule para resolver o erro 'ngModel'
      imports: [FormsModule],
      declarations: [UserComponent],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
    // Dispara o ngOnInit, que chama loadUser()
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  // --- Testes de Inicialização e Carregamento ---

  it('deve carregar os dados do usuário no ngOnInit e preencher userEdit', () => {
    // CORREÇÃO: Chamamos loadUser() novamente para garantir o estado inicial 
    // e evitar vazamento de estado de outros blocos (describe/beforeEach)
    component.loadUser();
    fixture.detectChanges();

    expect(userServiceMock.getUser).toHaveBeenCalled();
    expect(component.currentUser.name).toBe('Mestre');
    expect(component.userEdit.id).toBe('1');
    expect(component.userEdit.email).toBe('mestre@qametrik.com');
  });

  it('deve exibir erro se falhar ao carregar usuário e limpar após 5s', fakeAsync(() => {
    userServiceMock.getUser.and.returnValue(throwError(() => ({ error: 'Erro ao buscar' })));
    component.loadUser();
    expect(component.backendError).toBe('Erro ao buscar');
    tick(5000);
    expect(component.backendError).toBe('');
  }));

  // --- Testes de Validação de Formulário ---

  describe('validações de formulário', () => {
    beforeEach(() => {
      component.userEdit.name = 'Mestre';
      component.userEdit.email = 'teste@teste.com';
      component.userEdit.newPassword = '';
      component.userEdit.oldPassword = '';
      component.backendError = '';
    });

    it('deve falhar se o nome estiver vazio', () => {
      component.userEdit.name = '';
      const valid = component.validateForm();
      expect(valid).toBeFalse();
      expect(component.backendError).toBe('O Nome é obrigatório');
    });

    it('deve falhar se o email estiver vazio', () => {
      component.userEdit.email = '';
      const valid = component.validateForm();
      expect(valid).toBeFalse();
      expect(component.backendError).toBe('O E-mail é obrigatório');
    });

    it('deve falhar se nova senha for preenchida sem senha atual', () => {
      component.userEdit.newPassword = 'nova';
      component.userEdit.oldPassword = '';
      const valid = component.validateForm();
      expect(valid).toBeFalse();
      expect(component.backendError).toBe('A Senha Atual é obrigatória para definir uma Nova Senha');
    });

    it('deve falhar se senha atual for preenchida sem nova senha', () => {
      component.userEdit.newPassword = '';
      component.userEdit.oldPassword = 'antiga';
      const valid = component.validateForm();
      expect(valid).toBeFalse();
      expect(component.backendError).toBe('A Nova Senha é obrigatória se você preencheu a Senha Atual');
    });

    it('deve passar se apenas nome e email forem alterados (senhas vazias)', () => {
      component.userEdit.name = 'Novo Nome';
      component.userEdit.email = 'novo@teste.com';
      const valid = component.validateForm();
      expect(valid).toBeTrue();
      expect(component.backendError).toBe('');
    });

    it('deve passar se a nova senha e a senha atual forem preenchidas', () => {
      component.userEdit.newPassword = 'nova';
      component.userEdit.oldPassword = 'antiga';
      const valid = component.validateForm();
      expect(valid).toBeTrue();
      expect(component.backendError).toBe('');
    });
  });

  // --- Testes de Salvar Alterações ---

  describe('salvar alterações', () => {
    beforeEach(() => {
      component.userEdit = {
        id: '1',
        name: 'Novo Nome',
        email: 'novo@teste.com',
        newPassword: '',
        oldPassword: ''
      };
      // Força a validação a passar para testar o serviço
      spyOn(component, 'validateForm').and.returnValue(true);
      // Reinicia o mock do updateUser
      userServiceMock.updateUser.and.returnValue(of({}));
    });

    it('deve chamar o serviço de atualização sem senhas se não forem fornecidas', () => {
      component.saveChanges();

      const expectedDto: UserDataForUpdateDto = {
        id: '1',
        name: 'Novo Nome',
        email: 'novo@teste.com',
      };

      expect(userServiceMock.updateUser).toHaveBeenCalledWith(expectedDto);
      // Verifica se a currentUser foi atualizada
      expect(component.currentUser.name).toBe('Novo Nome');
      expect(component.currentUser.email).toBe('novo@teste.com');
    });

    it('deve chamar o serviço de atualização incluindo senhas se fornecidas', () => {
      component.userEdit.newPassword = 'nova';
      component.userEdit.oldPassword = 'antiga';
      component.saveChanges();

      const expectedDto: UserDataForUpdateDto = {
        id: '1',
        name: 'Novo Nome',
        email: 'novo@teste.com',
        newPassword: 'nova',
        oldPassword: 'antiga'
      };

      expect(userServiceMock.updateUser).toHaveBeenCalledWith(expectedDto);
      // Verifica se os campos de senha foram limpos
      expect(component.userEdit.newPassword).toBe('');
      expect(component.userEdit.oldPassword).toBe('');
    });

    it('não deve chamar updateUser se o formulário for inválido', () => {
      (component.validateForm as jasmine.Spy).and.returnValue(false);
      component.saveChanges();
      expect(userServiceMock.updateUser).not.toHaveBeenCalled();
    });

    it('deve mostrar mensagem de sucesso e limpar após 5s', fakeAsync(() => {
      component.saveChanges();

      // Assert imediatamente
      expect(component.successMessage).toBe('Atualizado com sucesso!');
      expect(component.backendError).toBe('');

      // Avança o tempo
      tick(5000);
      expect(component.successMessage).toBe('');
    }));

    it('deve mostrar erro do backend e limpar após 5s se updateUser falhar', fakeAsync(() => {
      userServiceMock.updateUser.and.returnValue(
        throwError(() => ({ error: 'Falha de Autenticação' }))
      );

      component.saveChanges();

      // Assert imediatamente
      expect(component.backendError).toBe('Falha de Autenticação');
      expect(component.successMessage).toBe('');

      // Avança o tempo
      tick(5000);
      expect(component.backendError).toBe('');
    }));
  });

  // --- Testes de Funções Auxiliares ---

  describe('funções auxiliares', () => {
    it('deve alternar a sidebar', () => {
      component.sidebarOpen = false;
      component.toggleSidebar();
      expect(component.sidebarOpen).toBeTrue();
      component.toggleSidebar();
      expect(component.sidebarOpen).toBeFalse();
    });

    it('deve limpar sessionStorage e redirecionar ao deslogar', () => {
      spyOn(sessionStorage, 'clear');
      component.logout();
      expect(sessionStorage.clear).toHaveBeenCalled();
      expect(routerMock.navigate).toHaveBeenCalledWith(['']);
    });

    it('deve limpar mensagens de erro e sucesso ao fechar', () => {
      component.backendError = 'Erro';
      component.successMessage = 'Sucesso';
      component.closeError();
      expect(component.backendError).toBe('');
      expect(component.successMessage).toBe('');
    });
  });
});
