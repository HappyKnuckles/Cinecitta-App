import { Routes } from '@angular/router';
import { TabsPage } from './tabs/tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'start',
        loadComponent: () => import('./pages/start/start.page').then((m) => m.StartPage),
      },
      {
        path: 'film',
        loadComponent: () => import('./pages/film/filmoverview.page').then((m) => m.FilmOverviewPage),
      },
      {
        path: 'news',
        loadComponent: () => import('./pages/news/newspage.page').then((m) => m.NewsPage),
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.page').then((m) => m.ProfilePage),
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