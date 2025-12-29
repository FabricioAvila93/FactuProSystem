import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReseteoContrasenaComponent } from './reseteo-contrasena.component';

describe('ReseteoContrasenaComponent', () => {
  let component: ReseteoContrasenaComponent;
  let fixture: ComponentFixture<ReseteoContrasenaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReseteoContrasenaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReseteoContrasenaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
