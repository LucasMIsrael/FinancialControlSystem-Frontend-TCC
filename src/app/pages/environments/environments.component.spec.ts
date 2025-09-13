import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EnvironmentsComponent } from './environments.component';
import { EnvironmentService } from 'src/app/services/environment/environment.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { EnvironmentData, EnvironmentTypeEnum } from '../../models/environment-data.model';
import { FormsModule } from '@angular/forms';

describe('EnvironmentsComponent', () => {
  let component: EnvironmentsComponent;
  let fixture: ComponentFixture<EnvironmentsComponent>;
  let mockService: any;
  let mockRouter: any;

  const mockEnvironments: EnvironmentData[] = [
    { id: '1', name: 'Env1', description: 'Desc1', type: EnvironmentTypeEnum.Personal },
    { id: '2', name: 'Env2', description: 'Desc2', type: EnvironmentTypeEnum.Business }
  ];

  beforeEach(async () => {
    mockService = jasmine.createSpyObj(['getAll', 'createEnvironment', 'updateEnvironment', 'deleteEnvironment']);
    mockRouter = jasmine.createSpyObj(['navigate']);

    await TestBed.configureTestingModule({
      declarations: [EnvironmentsComponent],
      imports: [FormsModule],
      providers: [
        { provide: EnvironmentService, useValue: mockService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnvironmentsComponent);
    component = fixture.componentInstance;
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve carregar ambientes no ngOnInit', () => {
    mockService.getAll.and.returnValue(of(mockEnvironments));
    component.ngOnInit();
    expect(component.environments.length).toBe(2);
    expect(component.environments[0].name).toBe('Env1');
  });

  it('deve abrir e fechar a sidebar', () => {
    expect(component.sidebarOpen).toBeFalse();
    component.toggleSidebar();
    expect(component.sidebarOpen).toBeTrue();
    component.toggleSidebar();
    expect(component.sidebarOpen).toBeFalse();
  });

  it('deve abrir o modal de criação', () => {
    component.newEnvironment();
    expect(component.showModal).toBeTrue();
    expect(component.newEnv.name).toBe('');
  });

  it('deve fechar o modal de criação', () => {
    component.showModal = true;
    component.closeModal();
    expect(component.showModal).toBeFalse();
  });

  it('não deve criar ambiente se houver erro nos campos', () => {
    component.newEnv.name = '';
    component.newEnv.description = '';
    component.createEnvironment();
    expect(component.nameError).toBeTrue();
    expect(component.descriptionError).toBeTrue();
    expect(mockService.createEnvironment).not.toHaveBeenCalled();
  });

  it('deve criar ambiente quando os campos estiverem válidos', () => {
    component.newEnv = { name: 'Novo', description: 'Desc', type: EnvironmentTypeEnum.Personal };
    mockService.createEnvironment.and.returnValue(of({}));
    spyOn(component, 'closeModal');
    spyOn(component, 'ngOnInit');

    component.createEnvironment();

    expect(component.closeModal).toHaveBeenCalled();
    expect(component.ngOnInit).toHaveBeenCalled();
  });

  it('deve abrir modal de edição com os dados do ambiente', () => {
    component.onEdit(mockEnvironments[0]);
    expect(component.showEditModal).toBeTrue();
    expect(component.envToEdit.name).toBe('Env1');
  });

  it('não deve salvar edição se houver erro nos campos', () => {
    component.envToEdit = { id: '1', name: '', description: '', type: EnvironmentTypeEnum.Personal };
    component.saveEdit();
    expect(component.nameEditError).toBeTrue();
    expect(component.descriptionEditError).toBeTrue();
    expect(mockService.updateEnvironment).not.toHaveBeenCalled();
  });

  it('deve salvar edição corretamente', () => {
    component.environments = [...mockEnvironments];
    component.envToEdit = { id: '1', name: 'Editado', description: 'Desc Edit', type: EnvironmentTypeEnum.Personal };
    mockService.updateEnvironment.and.returnValue(of({}));
    spyOn(component, 'closeEditModal');

    component.saveEdit();

    expect(component.environments[0].name).toBe('Editado');
    expect(component.closeEditModal).toHaveBeenCalled();
  });

  it('deve abrir modal de exclusão', () => {
    component.onDelete(mockEnvironments[0]);
    expect(component.showDeleteModal).toBeTrue();
    expect(component.envToDelete?.id).toBe('1');
  });

  it('deve cancelar exclusão', () => {
    component.showDeleteModal = true;
    component.envToDelete = mockEnvironments[0];
    component.cancelDelete();
    expect(component.showDeleteModal).toBeFalse();
    expect(component.envToDelete).toBeNull();
  });

  it('deve confirmar exclusão corretamente', () => {
    component.environments = [...mockEnvironments];
    component.envToDelete = mockEnvironments[0];
    mockService.deleteEnvironment.and.returnValue(of({}));
    spyOn(component, 'cancelDelete');

    component.confirmDelete();

    expect(component.environments.length).toBe(1);
    expect(component.environments.find(e => e.id === '1')).toBeUndefined();
    expect(component.cancelDelete).toHaveBeenCalled();
  });

  it('deve navegar ao acessar ambiente', () => {
    component.onAccess(mockEnvironments[0]);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/ambiente', '1']);
  });
});
