import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { Signup } from "./signup";

xdescribe("SignupComponent", () => {
  let component: Signup;
  let fixture: ComponentFixture<Signup>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [Signup]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Signup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
