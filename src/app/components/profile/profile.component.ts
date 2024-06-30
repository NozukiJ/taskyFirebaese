import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule]
})
export class ProfileComponent implements OnInit {
  user: any = {}; // 実際のユーザーデータをここに格納
  profile: any = { displayName: '', bio: '', email: '', company: '', position: '', team: '' }; // フォームバインディング用
  userId: string = ''; // ユーザーIDを格納するプロパティ
  message: string = ''; // メッセージを格納するプロパティ

  constructor(private authService: AuthService, private firestore: AngularFirestore) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.userId = user.uid; // ユーザーIDを格納
        this.firestore.collection('users').doc(user.uid).valueChanges().subscribe(userData => {
          if (userData && typeof userData === 'object') {
            this.user = user;
            this.profile = { ...userData, displayName: user.displayName, email: user.email };
          } else {
            this.user = user;
            this.profile = { displayName: user.displayName, email: user.email, bio: '', company: '', position: '', team: '' };
          }
        });
      }
    });
  }

  updateProfile() {
    this.authService.updateProfile(this.profile.displayName, this.profile.bio, this.profile.company, this.profile.position, this.profile.team)
      .then(() => {
        this.message = 'プロフィールの更新が成功しました';
      })
      .catch(error => {
        console.error('プロフィールの更新に失敗しました', error);
        this.message = 'プロフィールの更新に失敗しました';
      });
  }
}
