import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserDataDto } from 'src/app/models/user-data';
import { UserDataForUpdateDto } from 'src/app/models/user-info-for-update';
import { UserInfoForViewDto } from 'src/app/models/user-info-for-view';
import { UserService } from 'src/app/services/user/user.service'; // Assumindo o caminho

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  // Estado da Sidebar
  sidebarOpen = false;

  // Dados do Usuário para exibição e edição
  currentUser: UserInfoForViewDto = { id: '', name: '', email: '' };

  // Modelo de dados para a edição
  userEdit: UserDataForUpdateDto & { newPassword: string, oldPassword: string } = {
    id: '',
    email: '',
    name: '',
    // Adicionamos as propriedades obrigatórias do formulário aqui
    newPassword: '',
    oldPassword: ''
  };

  // Variáveis de controle de Erro
  backendError = '';
  successMessage = '';
  // nameError = false;
  // emailError = false;
  // passwordError = false;
  // oldPasswordError = false;
  // newPasswordError = false;

  constructor(
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadUser();
  }

  // Lógica de Carregamento de Usuário
  loadUser(): void {
    this.userService.getUser().subscribe({
      next: (data) => {
        this.currentUser = data;

        // Inicializa o formulário de edição com os dados e o ID
        this.userEdit.id = data.id;
        this.userEdit.name = data.name;
        this.userEdit.email = data.email;

        // As senhas devem sempre ser limpas ao carregar
        this.userEdit.newPassword = '';
        this.userEdit.oldPassword = '';
      },
      error: (err) => {
        console.error('Erro ao buscar usuário', err);
        this.showError(err, 'Erro ao carregar dados do usuário');
      }
    });
  }

  // Lógica de Atualização de Usuário
  saveChanges(): void {
    if (!this.validateForm()) return;

    // Constrói o DTO de atualização
    const userDataToUpdate: UserDataForUpdateDto = {
      id: this.userEdit.id,
      name: this.userEdit.name,
      email: this.userEdit.email
    };

    // Só adiciona os campos de senha se eles foram preenchidos
    const newPass = this.userEdit.newPassword.trim();
    const oldPass = this.userEdit.oldPassword.trim();

    if (newPass !== '' && oldPass !== '') {
      userDataToUpdate.newPassword = newPass;
      userDataToUpdate.oldPassword = oldPass;
    }

    this.userService.updateUser(userDataToUpdate).subscribe({
      next: () => {
        // Atualiza a view com os novos dados (Nome/Email)
        this.currentUser.name = this.userEdit.name;
        this.currentUser.email = this.userEdit.email;

        // Limpa os campos de senha após o sucesso
        this.userEdit.newPassword = '';
        this.userEdit.oldPassword = '';

        this.showSuccess('Atualizado com sucesso!');
      },
      error: (err) => {
        console.error('Erro ao atualizar usuário', err);
        this.showError(err, 'Erro ao salvar as alterações do usuário. Verifique sua senha atual');
      }
    });
  }

  // Validação do Formulário
  validateForm(): boolean {
    // Limpa o erro anterior antes de validar
    this.backendError = '';

    const newPass = this.userEdit.newPassword.trim();
    const oldPass = this.userEdit.oldPassword.trim();

    // --- Validações de campos obrigatórios ---
    if (!this.userEdit.name || this.userEdit.name.trim() === '') {
      this.showError(null, 'O Nome é obrigatório');
      return false;
    }
    if (!this.userEdit.email || this.userEdit.email.trim() === '') {
      this.showError(null, 'O E-mail é obrigatório');
      return false;
    }

    // --- Validações de Senha ---
    // Regra: Se a nova senha for preenchida, a senha antiga é OBRIGATÓRIA.
    if (newPass !== '' && oldPass === '') {
      this.showError(null, 'A Senha Atual é obrigatória para definir uma Nova Senha');
      return false;
    }

    // Regra: Se a senha antiga for preenchida, a nova senha é OBRIGATÓRIA (a menos que o objetivo seja apenas alterar nome/email, mas o campo de Senha Atual foi preenchido por engano).
    // Implementamos a lógica para forçar preenchimento de ambas se uma for preenchida, para evitar confusão.
    if (oldPass !== '' && newPass === '') {
      this.showError(null, 'A Nova Senha é obrigatória se você preencheu a Senha Atual');
      return false;
    }

    return true; // Formulário válido
  }

  // --- Métodos de Utilidade (Copiados de EnvironmentsComponent) ---

  private showError(err: any, defaultMessage: string): void {
    this.backendError = err?.error || defaultMessage;
    setTimeout(() => {
      this.backendError = '';
    }, 5000);
  }

  private showSuccess(message: string): void {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = '';
    }, 5000);
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout(): void {
    sessionStorage.clear();
    this.router.navigate(['']);
  }

  closeError(): void {
    this.backendError = '';
    this.successMessage = '';
  }
}