import { Component, OnInit } from '@angular/core';
import { EnvironmentData, EnvironmentTypeEnum } from '../../models/environment-data.model';
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

  showModal = false;

  showDeleteModal = false;
  envToDelete: EnvironmentData | null = null;

  openMenuId: string | null = null;

  // Objeto para binding com o formulário do modal
  newEnv: EnvironmentData = {
    name: '',
    description: '',
    type: EnvironmentTypeEnum.Personal
  };

  // Controle do modal de edição
  showEditModal = false;
  // Ambiente que será editado
  envToEdit: EnvironmentData = {
    id: '',
    name: '',
    description: '',
    type: EnvironmentTypeEnum.Personal
  };
  nameEditError = false;
  descriptionEditError = false;

  // Enum disponível no template (para options do select)
  environmentTypes = EnvironmentTypeEnum;

  constructor(
    private environmentService: EnvironmentService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadEnvironments();
  }

  loadEnvironments(): void {
    this.environmentService.getAll().subscribe({
      next: (data) => {
        // garante que cada ambiente tenha um id válido
        this.environments = (data || []).map(env => ({
          ...env,
          id: env.id ?? '' // caso venha undefined, define como string vazia (não permitirá delete)
        }));
      },
      error: (err) => {
        console.error('Erro ao buscar ambientes', err);
      }
    });
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  // Abrir modal
  newEnvironment(): void {
    this.resetForm();
    this.showModal = true;
  }

  // Fechar modal
  closeModal(): void {
    this.showModal = false;
  }

  // Resetar campos do formulário
  resetForm(): void {
    this.newEnv = {
      name: '',
      description: '',
      type: EnvironmentTypeEnum.Personal
    };
  }

  // Criar ambiente
  createEnvironment(): void {
    this.nameError = !this.newEnv.name || this.newEnv.name.trim() === '';
    this.descriptionError = !this.newEnv.description || this.newEnv.description.trim() === '';

    if (this.nameError || this.descriptionError) {
      return;
    }

    this.environmentService.createEnvironment(this.newEnv).subscribe({
      next: () => {
        this.closeModal();
        this.ngOnInit();
      },
      error: (err) => {
        console.error('Erro ao criar ambiente', err);
      }
    });
  }

  logout(): void {
    sessionStorage.clear();
    this.router.navigate(['']);
  }

  onAccess(env: EnvironmentData): void {
    this.router.navigate(['/ambiente', env.id]);
  }

  onEdit(env: EnvironmentData): void {
    // Preenche o objeto com os dados existentes
    this.envToEdit = {
      id: env.id,
      name: env.name,
      description: env.description,
      type: env.type
    };
    this.nameEditError = false;
    this.descriptionEditError = false;
    this.showEditModal = true;
  }

  // Fechar modal
  closeEditModal(): void {
    this.showEditModal = false;
  }

  // Salvar alterações
  saveEdit(): void {
    this.nameEditError = !this.envToEdit.name || this.envToEdit.name.trim() === '';
    this.descriptionEditError = !this.envToEdit.description || this.envToEdit.description.trim() === '';

    if (this.nameEditError || this.descriptionEditError) return;

    this.environmentService.updateEnvironment(this.envToEdit).subscribe({
      next: () => {
        // Atualiza a lista local sem recarregar
        const index = this.environments.findIndex(e => e.id === this.envToEdit.id);
        if (index !== -1) {
          this.environments[index] = { ...this.envToEdit };
        }
        this.closeEditModal();
      },
      error: (err) => {
        console.error('Erro ao atualizar ambiente', err);
        alert('Não foi possível atualizar o ambiente.');
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
        alert('Não foi possível excluir o ambiente.');
      }
    });
  }

  toggleOptions(id: string | undefined) {
    this.openMenuId = this.openMenuId === id ? null : id ?? null;
  }
}
