import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'start',
        loadChildren: () => import('../start/start.module').then(m => m.StartPageModule)
      },
      {
        path: 'film',
        loadChildren: () => import('../film/filmoverview.module').then(m => m.FilmoverviewModule)
      },
      {
        path: 'news',
        loadChildren: () => import('../news/newspage.module').then(m => m.NewsPageModule)
      },
      {
        path: 'profile',
        loadChildren: () => import('../news/newspage.module').then(m => m.NewsPageModule)
      },
      {
        path: '',
        redirectTo: '/tabs/start',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/start',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
