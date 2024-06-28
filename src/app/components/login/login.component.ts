import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';  // Routerをインポート

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule]
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  message: string = '';

  constructor(private authService: AuthService, private router: Router) {}  // RouterをDI

  login() {
    this.authService.login(this.email, this.password)
      .then(() => {
        this.message = 'ログインに成功しました';
        this.router.navigate(['/']);  // ログイン成功後にルート画面にリダイレクト
      })
      .catch(error => {
        this.message = 'ログインに失敗しました';
      });
  }

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
