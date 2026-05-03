import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		pathMatch: 'full',
		loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage),
	},
	{
		path: 'patients',
		loadComponent: () => import('./pages/patients/patients.page').then((m) => m.PatientsPage),
	},
	{
		path: 'visits',
		loadComponent: () => import('./pages/visits/visits.page').then((m) => m.VisitsPage),
	},
	{
		path: 'screenings',
		loadComponent: () => import('./pages/screenings/screenings.page').then((m) => m.ScreeningsPage),
	},
	{
		path: '**',
		redirectTo: '',
	},
];
