import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarCaiRangoComponent } from './registrar-cai-rango.component';

describe('RegistrarCaiRangoComponent', () => {
  let component: RegistrarCaiRangoComponent;
  let fixture: ComponentFixture<RegistrarCaiRangoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrarCaiRangoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RegistrarCaiRangoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
