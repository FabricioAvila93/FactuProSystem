import { TestBed } from '@angular/core/testing';

import { TipoDocumentoFacturaService } from './tipo-documento-factura.service';

describe('TipoDocumentoFacturaService', () => {
  let service: TipoDocumentoFacturaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TipoDocumentoFacturaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
