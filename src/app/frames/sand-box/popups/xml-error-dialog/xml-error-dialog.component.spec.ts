import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XmlErrorDialogComponent } from './xml-error-dialog.component';

describe('XmlErrorDialogComponent', () => {
  let component: XmlErrorDialogComponent;
  let fixture: ComponentFixture<XmlErrorDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [XmlErrorDialogComponent]
    });
    fixture = TestBed.createComponent(XmlErrorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
