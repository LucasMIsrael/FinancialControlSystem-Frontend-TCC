import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserInfoForViewDto, UserDataForUpdateDto } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  sidebarOpen = false;

  currentUser: UserInfoForViewDto = { id: '', name: '', email: '' };

  userEdit: UserDataForUpdateDto & { newPassword: string, oldPassword: string } = {
    id: '',
    email: '',
    name: '',
    newPassword: '',
    oldPassword: ''
  };

  backendError = '';
  successMessage = '';

  constructor(
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser(): void {
    this.userService.getUser().subscribe({
      next: (data) => {
        this.currentUser = data;

        this.userEdit.id = data.id;
        this.userEdit.name = data.name;
        this.userEdit.email = data.email;

        this.userEdit.newPassword = '';
        this.userEdit.oldPassword = '';
      },
      error: (err) => {
        console.error('Erro ao buscar usuário', err);
        this.showError(err, 'Erro ao carregar dados do usuário');
      }
    });
  }

  saveChanges(): void {
    if (!this.validateForm()) return;

    const userDataToUpdate: UserDataForUpdateDto = {
      id: this.userEdit.id,
      name: this.userEdit.name,
      email: this.userEdit.email
    };

    const newPass = this.userEdit.newPassword.trim();
    const oldPass = this.userEdit.oldPassword.trim();

    if (newPass !== '' && oldPass !== '') {
      userDataToUpdate.newPassword = newPass;
      userDataToUpdate.oldPassword = oldPass;
    }

    this.userService.updateUser(userDataToUpdate).subscribe({
      next: () => {
        this.currentUser.name = this.userEdit.name;
        this.currentUser.email = this.userEdit.email;

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

  validateForm(): boolean {
    this.backendError = '';

    const newPass = this.userEdit.newPassword.trim();
    const oldPass = this.userEdit.oldPassword.trim();

    if (!this.userEdit.name || this.userEdit.name.trim() === '') {
      this.showError(null, 'O Nome é obrigatório');
      return false;
    }
    if (!this.userEdit.email || this.userEdit.email.trim() === '') {
      this.showError(null, 'O E-mail é obrigatório');
      return false;
    }

    if (newPass !== '' && oldPass === '') {
      this.showError(null, 'A Senha Atual é obrigatória para definir uma Nova Senha');
      return false;
    }

    if (oldPass !== '' && newPass === '') {
      this.showError(null, 'A Nova Senha é obrigatória se você preencheu a Senha Atual');
      return false;
    }

    return true;
  }

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