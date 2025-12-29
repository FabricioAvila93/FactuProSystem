import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarResumenFacturasComponent } from './listar-resumen-facturas.component';

describe('ListarResumenFacturasComponent', () => {
  let component: ListarResumenFacturasComponent;
  let fixture: ComponentFixture<ListarResumenFacturasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarResumenFacturasComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ListarResumenFacturasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
