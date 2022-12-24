import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FilmOverviewPage } from './filmoverview.page';

const routes: Routes = [
  {
    path: '',
    component: FilmOverviewPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FilmOverviewRoutingmodule {}
