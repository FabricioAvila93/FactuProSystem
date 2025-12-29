import { TestBed } from '@angular/core/testing';

import { EstadosFacturaService } from './estados-factura.service';

describe('EstadosFacturaService', () => {
  let service: EstadosFacturaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EstadosFacturaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
