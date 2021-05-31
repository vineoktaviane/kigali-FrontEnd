import { TestBed } from '@angular/core/testing';

import { BarcodedbService } from './barcodedb.service';

describe('BarcodedbService', () => {
  let service: BarcodedbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BarcodedbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
