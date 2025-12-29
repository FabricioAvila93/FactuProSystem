import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarCaiRangoComponent } from './listar-cai-rango.component';

describe('ListarCaiRangoComponent', () => {
  let component: ListarCaiRangoComponent;
  let fixture: ComponentFixture<ListarCaiRangoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarCaiRangoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ListarCaiRangoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
