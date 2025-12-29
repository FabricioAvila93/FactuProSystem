import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarProveedorComponent } from './listar-proveedor.component';

describe('ListarProveedorComponent', () => {
  let component: ListarProveedorComponent;
  let fixture: ComponentFixture<ListarProveedorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarProveedorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ListarProveedorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
