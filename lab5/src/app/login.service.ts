import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { map, catchError } from "rxjs/operators";

import { User } from "./user";

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private URL = "api/login";
  errorData: {};

  user: User;

  constructor(private http: HttpClient) { }

  login(email: string, password: string){
    let request = new XMLHttpRequest;
    request.open("POST", "/api/login", true);
    
  }


  // login(email: string, password: string){
  //   let postData = {email: email, password: password};
  //   return this.http.post<User>(this.URL, postData).pipe(map(user => {
  //     if (user) {
  //       localStorage.setItem("currentUser", JSON.stringify(user));
  //       return user;
  //     }
  //   }), catchError(this.handleError));
  // }

  // private handleError(error: HttpErrorResponse){
  //   console.error(error.error.message);
  //   this.errorData = "an error occured!";
  //   return throwError(this.errorData);
  // };

  // resolvedItems(): Observable<any>{
  //   console.log("Request sent!");
  //   const headers =  {
  //     headers: new  HttpHeaders({ 
  //       'Content-Type': 'application/x-www-form-urlencoded'})
  //   };
  //   return this.http.post(this.URL,
  //     {
  //       "email": ,
  //       "password": 
  //     },
  //     headers)
  // }
}
