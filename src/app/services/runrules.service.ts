import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RunrulesService {

  private apiUrl = 'http://localhost:3000/testRun'; // Update this with your backend URL
  public userInfo: any;
  private BASE_URL:any;
  private BASE_URL2:any;
  private MS_URL: any;

  constructor(private http: HttpClient,private httpClient: HttpClient) {
    this.BASE_URL = this.determineServerURL();
    this.BASE_URL2 = this.determineServerURL2();
  }
  executeRules(payload: any): Observable<any> {
    const isLocalhost = window.location.hostname === 'localhost' && window.location.port === '4200';
    if (isLocalhost) {
      return this.http.post(this.BASE_URL + '/testRun', payload);
    } else {
      return this.http.post(this.BASE_URL + '/mdm-rule/testRun', payload);
    }
  }
  private determineServerURL(): string {
    const isLocalhost = window.location.hostname === 'localhost' && window.location.port === '4200';
    if (isLocalhost) {
      return 'http://localhost:3000';
    } else {
      return window.location.origin;
    }
  }

  private determineServerURL2(): string {
    const isLocalhost = window.location.hostname === 'localhost' && window.location.port === '4200';
    if (isLocalhost) {
      return 'https://ms.yoorsdigital.com';
    } else {
      return window.location.origin;
    }
  }
  loginWithOAuth(username: string, password: string): Observable<any> {
    const url = `${this.BASE_URL2}/security-services/oauth/token`;

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Authorization': 'Basic ' + btoa('trusted-client:secret')
    });

    const body = new HttpParams()
      .set('grant_type', 'password')
      .set('username', username)
      .set('password', password);

    return this.httpClient.post(url, body.toString(), { headers });
  }

  getUserInfo(): any {
    if (this.userInfo === undefined) {
      const storedUserInfo = sessionStorage.getItem('userInfo');
      if (storedUserInfo !== null) {
        this.userInfo = JSON.parse(storedUserInfo);
      } else {
        console.log('userInfo undefined');
        sessionStorage.removeItem('userInfo');
        sessionStorage.removeItem('brokerHierarchy');
        sessionStorage.removeItem('logout_route');
        sessionStorage.removeItem('userName');
        this.userInfo = undefined;
      }
    }
    return this.userInfo;
  }
  storeUserInfo(data:any): any {
      console.log("Here 1",data)
      sessionStorage.setItem('userInfo',JSON.stringify(data));
      this.userInfo= data
    return this.userInfo;
  }

  getBrokerList2(): Observable<any> {
    const url = `${this.BASE_URL2}/broker-services/internal/broker-config/getIntermediaryList`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.httpClient.get(url, { headers });
  }
  getBrokerList = (): Observable<any> => {
    const apiUrl =
      this.BASE_URL2 +
      `/broker-services/internal/broker-config/getIntermediaryList`;
    return this.httpClient.get(apiUrl);
  };
  is2FAEnabled(userInfo: any): Observable<any> {
    const url = `${this.BASE_URL2}/security-services/security/secure/auth2FAEnabled`;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + userInfo.access_token
    });

    return this.httpClient.get(url, { headers });
  }
  getBrokerHierarchy(token: string, intermediaryId: string): Observable<any> {
    const url = `${this.BASE_URL2}/broker-services/secure/external/loadHierarchyV2`;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const params = new HttpParams().set('intermediaryId', intermediaryId);

    return this.httpClient.get(url, { headers, params });
  }
  do2FAuthentication(code: string, token: string): Observable<any> {
    const url = `${this.BASE_URL2}/security-services/security/secure/verify2FA`;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.httpClient.post(url, code, { headers });
  }
}
