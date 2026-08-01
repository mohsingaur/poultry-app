import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StandardLog } from './standard-log';

describe('StandardLog', () => {
  let component: StandardLog;
  let fixture: ComponentFixture<StandardLog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StandardLog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StandardLog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
