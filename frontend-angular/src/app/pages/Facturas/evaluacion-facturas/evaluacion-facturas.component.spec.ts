import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluacionFacturasComponent } from './evaluacion-facturas.component';

describe('EvaluacionFacturasComponent', () => {
  let component: EvaluacionFacturasComponent;
  let fixture: ComponentFixture<EvaluacionFacturasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluacionFacturasComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EvaluacionFacturasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
