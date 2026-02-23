import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrConnectComponent } from './err-connect.component';

describe('ErrConnectComponent', () => {
  let component: ErrConnectComponent;
  let fixture: ComponentFixture<ErrConnectComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ErrConnectComponent]
    });
    fixture = TestBed.createComponent(ErrConnectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
