import { TestBed } from '@angular/core/testing';

import { ProveedorCaiRangoService } from './proveedor-cai-rango.service';

describe('ProveedorCaiRangoService', () => {
  let service: ProveedorCaiRangoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProveedorCaiRangoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
