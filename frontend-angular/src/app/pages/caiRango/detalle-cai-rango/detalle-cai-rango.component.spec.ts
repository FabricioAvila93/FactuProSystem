import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleCaiRangoComponent } from './detalle-cai-rango.component';

describe('DetalleCaiRangoComponent', () => {
  let component: DetalleCaiRangoComponent;
  let fixture: ComponentFixture<DetalleCaiRangoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleCaiRangoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleCaiRangoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
