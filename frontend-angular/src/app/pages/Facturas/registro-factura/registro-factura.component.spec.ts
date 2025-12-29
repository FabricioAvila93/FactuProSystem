import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroFacturaComponent } from './registro-factura.component';

describe('RegistroFacturaComponent', () => {
  let component: RegistroFacturaComponent;
  let fixture: ComponentFixture<RegistroFacturaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroFacturaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistroFacturaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
