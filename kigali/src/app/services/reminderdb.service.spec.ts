import { TestBed } from '@angular/core/testing';

import { DbService } from './reminderdb.service';

describe('ReminderdbService', () => {
  let service: DbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
