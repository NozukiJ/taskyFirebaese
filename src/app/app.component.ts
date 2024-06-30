import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { RouterModule } from '@angular/router'; // RouterModule をインポート

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterModule], // RouterModule を追加
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'todo-app';

  constructor(private router: Router, private authService: AuthService) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        console.log('ナビゲーションが終了しました:', event.urlAfterRedirects);
      }
    });
  }

  logClick(linkName: string, event: Event): void {
    event.preventDefault();
    const path = this.getPathFromLinkName(linkName);
    console.log(`${linkName}リンクがクリックされました`);
    this.router.navigate([path]).then(() => {
      console.log(`${linkName}リンクのナビゲーションが完了しました`);
    });
  }

  getPathFromLinkName(linkName: string): string {
    switch (linkName) {
      case 'カレンダー':
        return '/calendar';
      case 'プロジェクト':
        return '/projects';
      case 'タスク一覧':
        return '/tasks';
      case 'プロフィール':
        return '/profile';
      case 'ユーザー検索': // 新しいパスを追加
        return '/user-search';
      default:
        return '/';
    }
  }

  logOut(): void {
    this.authService.logout()
      .then(() => {
        this.router.navigate(['/login']);
      })
      .catch(error => {
        console.error('ログアウトに失敗しました', error);
      });
  }
}
