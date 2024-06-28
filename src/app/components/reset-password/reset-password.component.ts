import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';  // Routerをインポート

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule]
})
export class ResetPasswordComponent {
  email: string = '';
  message: string = '';

  constructor(private authService: AuthService, private router: Router) {}  // RouterをDI

  resetPassword() {
    this.authService.resetPassword(this.email)
      .then(() => {
        this.message = 'パスワードリセットのメールを送信しました';
      })
      .catch(error => {
        this.message = 'パスワードリセットに失敗しました';
      });
  }
}
