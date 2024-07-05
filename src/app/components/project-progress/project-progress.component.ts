import { Component, OnInit, ElementRef, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { ProjectService } from 'src/app/core/services/project.service';
import { TaskService } from 'src/app/core/services/task.service';
import { Project } from 'src/app/core/models/project.model';
import { Task } from 'src/app/core/models/task.model';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-project-progress',
  templateUrl: './project-progress.component.html',
  styleUrls: ['./project-progress.component.css']
})
export class ProjectProgressComponent implements OnInit, AfterViewInit {
  projects: Project[] = [];
  tasks$: Observable<Task[]> = of([]);
  statusCounts: { [projectId: string]: { [key: string]: number } } = {};
  hasChartData: boolean = false;

  @ViewChildren('chartContainer') chartContainers!: QueryList<ElementRef>;

  constructor(
    private projectService: ProjectService,
    private taskService: TaskService
  ) {
    console.log('ProjectProgressComponent constructor');
  }

  ngOnInit(): void {
    console.log('ProjectProgressComponent ngOnInit');
    this.projectService.getProjectsByOwnerOrMember().subscribe(projects => {
      this.projects = projects;
      console.log('プロジェクトデータ:', projects);
      if (projects && projects.length > 0) {
        const projectIds = projects.map(project => project.id);
        console.log('Fetching tasks for projects:', projectIds);
        this.tasks$ = this.taskService.getTasksByProjectIds(projectIds);

        this.tasks$.pipe(
          map(tasks => {
            tasks.forEach(task => {
              const projectId = task.projectId || '';
              if (!this.statusCounts[projectId]) {
                this.statusCounts[projectId] = { '未着手': 0, '進行中': 0, '完了': 0 };
              }
              if (this.statusCounts[projectId].hasOwnProperty(task.status)) {
                this.statusCounts[projectId][task.status]++;
              }
            });
            return tasks;
          })
        ).subscribe(tasks => {
          console.log('タスクデータ:', tasks);
          this.hasChartData = Object.values(this.statusCounts).some(counts =>
            Object.values(counts).some(count => count > 0)
          );
          if (this.hasChartData) {
            this.chartContainers.changes.subscribe(() => {
              this.initializeCharts(); // チャートコンテナの変更が完了した後にチャートを初期化
            });
          }
        }, error => {
          console.error('タスクの読み込み中にエラーが発生しました:', error);
        });
      } else {
        console.log('プロジェクトが見つかりません');
      }
    }, error => {
      console.error('プロジェクトの読み込み中にエラーが発生しました:', error);
    });
  }

  ngAfterViewInit(): void {
    console.log('ngAfterViewInit called');
    // Viewのレンダリングが完了した後にチャートの初期化を試みる
    this.initializeCharts();
  }

  private initializeCharts(): void {
    this.chartContainers.forEach((container, index) => {
      const project = this.projects[index];
      const projectId = project.id;
      const canvas = container.nativeElement as HTMLCanvasElement;
      if (this.statusCounts[projectId]) {
        const data = {
          labels: ['未着手', '進行中', '完了'],
          datasets: [{
            data: [
              this.statusCounts[projectId]['未着手'],
              this.statusCounts[projectId]['進行中'],
              this.statusCounts[projectId]['完了']
            ],
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
          }]
        };

        new Chart(canvas, {
          type: 'pie',
          data: data,
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              tooltip: {
                callbacks: {
                  label: (tooltipItem) => {
                    const total = data.datasets[0].data.reduce((acc, value) => acc + value, 0);
                    const value = data.datasets[0].data[tooltipItem.dataIndex];
                    const percentage = ((value / total) * 100).toFixed(2) + '%';
                    return `${data.labels[tooltipItem.dataIndex]}: ${percentage}`;
                  }
                }
              }
            }
          }
        });
      } else {
        console.error('statusCounts is undefined for projectId:', projectId);
      }
    });
  }
}
