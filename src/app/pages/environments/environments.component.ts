import { Component, OnInit } from '@angular/core';
import { EnvironmentData, EnvironmentTypeEnum } from '../../models/environment-data';
import { EnvironmentService } from 'src/app/services/environment/environment.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-environments',
  templateUrl: './environments.component.html',
  styleUrls: ['./environments.component.css']
})
export class EnvironmentsComponent implements OnInit {
  environments: EnvironmentData[] = [];
  sidebarOpen = false;
  nameError = false;
  descriptionError = false;
  isLoading = false;
  showModal = false;
  showDeleteModal = false;
  envToDelete: EnvironmentData | null = null;

  openMenuId: string | null = null;

  newEnv: EnvironmentData = {
    name: '',
    description: '',
    type: EnvironmentTypeEnum.Personal
  };

  showEditModal = false;
  envToEdit: EnvironmentData = {
    id: '',
    name: '',
    description: '',
    type: EnvironmentTypeEnum.Personal
  };
  nameEditError = false;
  descriptionEditError = false;

  environmentTypes = EnvironmentTypeEnum;

  backendError = '';

  constructor(
    private environmentService: EnvironmentService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadEnvironments();
  }

  private showError(err: any, defaultMessage: string): void {
    this.backendError = err?.error || defaultMessage;
    setTimeout(() => {
      this.backendError = '';
    }, 5000);
  }

  loadEnvironments(): void {
    this.environmentService.getAll().subscribe({
      next: (data) => {
        this.environments = (data || []).map(env => ({
          ...env,
          id: env.id ?? ''
        }));
      },
      error: (err) => {
        console.error('Erro ao buscar ambientes', err);
        this.showError(err, 'Erro ao buscar ambientes.');
      }
    });
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  newEnvironment(): void {
    this.resetForm();
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  resetForm(): void {
    this.newEnv = {
      name: '',
      description: '',
      type: EnvironmentTypeEnum.Personal
    };
  }

  createEnvironment(): void {
    this.nameError = false;
    this.descriptionError = false;

    if (!this.newEnv.name || this.newEnv.name.trim() === '') {
      this.nameError = true;
    }
    if (!this.newEnv.description || this.newEnv.description.trim() === '') {
      this.descriptionError = true;
    }

    if (this.nameError || this.descriptionError) {
      const messages: string[] = [];

      if (this.nameError) {
        messages.push('O nome do ambiente é obrigatório');
        this.showError(null, 'O nome do ambiente é obrigatório');
        return;
      }

      if (this.descriptionError) {
        messages.push('A descrição é obrigatória');
        this.showError(null, 'A descrição é obrigatória');
        return;
      }
    }

    this.environmentService.createEnvironment(this.newEnv).subscribe({
      next: () => {
        this.closeModal();
        this.ngOnInit();
      },
      error: (err) => {
        console.error('Erro ao criar ambiente', err);
        this.showError(err, 'Erro ao criar ambiente');
      }
    });
  }

  logout(): void {
    sessionStorage.clear();
    this.router.navigate(['']);
  }

  onAccess(env: EnvironmentData): void {
    this.openMenuId = null;

    if (!env.id) {
      this.showError(null, 'ID do ambiente não encontrado para acesso.');
      return;
    }

    this.isLoading = true;

    this.environmentService.setEnvironment(env.id).subscribe({
      next: () => {
        if (env?.id) {
          sessionStorage.setItem('env', env.id);
        } else {
          this.showError(null, 'ID de ambiente vazio');
          return;
        }

        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Erro ao acessar/definir ambiente', err);
        this.showError(err, 'Erro ao definir ambiente ativo. Tente novamente.');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  onEdit(env: EnvironmentData): void {
    this.envToEdit = { ...env };
    this.nameEditError = false;
    this.descriptionEditError = false;
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
  }

  saveEdit(): void {
    this.nameEditError = false;
    this.descriptionEditError = false;

    if (!this.envToEdit.name || this.envToEdit.name.trim() === '') {
      this.nameEditError = true;
    }
    if (!this.envToEdit.description || this.envToEdit.description.trim() === '') {
      this.descriptionEditError = true;
    }

    if (this.nameEditError || this.descriptionEditError) {
      const messages: string[] = [];

      if (this.nameEditError) {
        messages.push('O nome do ambiente é obrigatório');
        this.showError(null, 'O nome do ambiente é obrigatório');
        return;
      }

      if (this.descriptionEditError) {
        messages.push('A descrição é obrigatória');
        this.showError(null, 'A descrição é obrigatória');
        return;
      }
    }

    this.environmentService.updateEnvironment(this.envToEdit).subscribe({
      next: () => {
        const index = this.environments.findIndex(e => e.id === this.envToEdit.id);
        if (index !== -1) this.environments[index] = { ...this.envToEdit };
        this.closeEditModal();
      },
      error: (err) => {
        console.error('Erro ao atualizar ambiente', err);
        this.showError(err, 'Erro ao atualizar ambiente');
      }
    });
  }

  onDelete(env: EnvironmentData): void {
    this.envToDelete = env;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.envToDelete = null;
    this.showDeleteModal = false;
  }

  confirmDelete(): void {
    if (!this.envToDelete?.id) return;

    this.environmentService.deleteEnvironment(this.envToDelete.id).subscribe({
      next: () => {
        this.environments = this.environments.filter(e => e.id !== this.envToDelete!.id);
        this.cancelDelete();
      },
      error: (err) => {
        console.error('Erro ao excluir ambiente', err);
        this.showError(err, 'Erro ao excluir ambiente.');
      }
    });
  }

  toggleOptions(id: string | undefined): void {
    this.openMenuId = this.openMenuId === id ? null : id ?? null;
  }

  closeError(): void {
    this.backendError = '';
  }
}