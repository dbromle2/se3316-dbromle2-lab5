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
    this.loginService.login(this.email.value, this.password.value).subscribe((data) =>{

    })
  }

}
