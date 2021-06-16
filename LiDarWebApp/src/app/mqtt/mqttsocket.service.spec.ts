import { TestBed } from '@angular/core/testing';

import { MqttsocketService } from './mqttsocket.service';

describe('MqttsocketService', () => {
  let service: MqttsocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MqttsocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
