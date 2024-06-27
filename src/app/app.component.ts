import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common'; // CommonModuleをインポート

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule], // CommonModuleをインポートリストに追加
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'todo-app';

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        console.log('ナビゲーションが終了しました:', event.urlAfterRedirects);
      }
    });
  }

  logClick(linkName: string, event: Event): void {
    event.preventDefault(); // デフォルトのリンク挙動を防ぐ
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
      default:
        return '/';
    }
  }
}
