import { TestBed } from '@angular/core/testing';

import { RunrulesService } from './runrules.service';

describe('RunrulesService', () => {
  let service: RunrulesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RunrulesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
