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
        loadChildren: () =>
          import('../Pages/start/start.module').then((m) => m.StartPageModule),
      },
      {
        path: 'film',
        loadChildren: () =>
          import('../Pages/film/filmoverview.module').then(
            (m) => m.FilmoverviewModule
          ),
      },
      {
        path: 'news',
        loadChildren: () =>
          import('../Pages/news/newspage.module').then((m) => m.NewsPageModule),
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('../Pages/profile/profile.module').then(
            (m) => m.ProfilePageModule
          ),
      },
      {
        path: '',
        redirectTo: '/tabs/start',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/start',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
