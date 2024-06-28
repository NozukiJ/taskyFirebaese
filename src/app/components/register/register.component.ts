import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule]
})
export class RegisterComponent {
  email: string = '';
  password: string = '';
  message: string = '';

  constructor(private authService: AuthService) {}

  register() {
    this.authService.register(this.email, this.password)
      .then(() => {
        this.message = 'アカウントの登録が成功しました';
      })
      .catch(error => {
        if (error.code === 'auth/email-already-in-use') {
          this.message = 'すでにメールアドレスが使われています';
        } else {
          this.message = 'アカウントの登録に失敗しました';
        }
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
