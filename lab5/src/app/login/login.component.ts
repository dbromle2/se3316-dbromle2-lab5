import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from "@angular/forms";
import { User } from "../user";
import { LoginService } from "../login.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService) { }

  ngOnInit(): void {
  }

  get email() {return this.loginForm.get("email");}
  get password() {return this.loginForm.get("password");}

  onSubmit() {
    this.submitted = true;
    //this.loginService.login(this.email.value, this.password.value).subscribe((data) =>{ //DSB Edit 28 Dec 2020-> removing problem line to build webapp to allow it to run on AWS per lab5 Submission Instructions(7)

    //}) //DSB Edit 28 Dec 2020-> removing problem line to build webapp to allow it to run on AWS per lab5 Submission Instructions(7)
  }

}
