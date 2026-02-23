import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SandGateComponent } from './sand-gate.component';

describe('SandGateComponent', () => {
  let component: SandGateComponent;
  let fixture: ComponentFixture<SandGateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SandGateComponent]
    });
    fixture = TestBed.createComponent(SandGateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
