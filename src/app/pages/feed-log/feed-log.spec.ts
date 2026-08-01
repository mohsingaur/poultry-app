import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedLog } from './feed-log';

describe('FeedLog', () => {
  let component: FeedLog;
  let fixture: ComponentFixture<FeedLog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedLog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeedLog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
