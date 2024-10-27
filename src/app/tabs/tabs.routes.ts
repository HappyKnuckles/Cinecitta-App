import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'start',
        loadComponent: () => import('../Pages/start/start.page').then((m) => m.StartPage),
      },
      {
        path: 'film',
        loadComponent: () => import('../Pages/film/filmoverview.page').then((m) => m.FilmOverviewPage),
      },
      {
        path: 'news',
        loadComponent: () => import('../Pages/news/newspage.page').then((m) => m.NewsPage),
      },
      {
        path: 'profile',
        loadComponent: () => import('../Pages/profile/profile.page').then((m) => m.ProfilePage),
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
