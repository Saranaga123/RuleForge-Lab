import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Auth2faComponent } from './auth2fa.component';

describe('Auth2faComponent', () => {
  let component: Auth2faComponent;
  let fixture: ComponentFixture<Auth2faComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Auth2faComponent]
    });
    fixture = TestBed.createComponent(Auth2faComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
