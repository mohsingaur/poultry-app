import { Component, inject, signal } from '@angular/core';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { ApiService } from '../../services/api-service';
import { Router } from '@angular/router';
import { Utility } from '../../utility/data-store';

@Component({
  selector: 'app-login',
  imports: [FormRoot, FormField],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {

  isLoading = signal(false);
  showSuccessAlert = signal(false);
  showErrorAlert = signal(false);
  errorMsg = signal('');
  route = inject(Router);


  private apiService = inject(ApiService);

  loginModel = signal({
    username: '',
    password: '',
    userType: 'AppUser'
  });
  loginForm = form(this.loginModel, (path) => {
    required(path.username, { message: "Username is required" });
    required(path.password, { message: "Password is required" });
  }, {
    submission: {
      action: async (field) => {
        let payload = field().value();
        this.login(payload);
      }
    }
  });


  login(payload: any) {
    {
      this.isLoading.set(true);
      this.apiService.post('/user/login', payload, (res: any) => {
        if (res.success) {
          this.showSuccessAlert.set(true);
          this.isLoading.set(false);

          Utility.setToken(res.data.token);
          Utility.setProfile(res.data.profile);
          Utility.setFarmer(res.data.farmerDetails);
          Utility.setFarms(res.data.farmsDetail);
          Utility.setBatches(res.data.batchesDetail);
          Utility.setStandardData(res.data.standardFarmData);

          this.route.navigate(['/home']);
        }
      }, (error: any) => {
        console.error('login :', error);
        this.errorMsg.set(error.message);
        this.showErrorAlert.set(true);
        this.isLoading.set(false);
      });
    }
  }

}
