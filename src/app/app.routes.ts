import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { FeedLog } from './pages/feed-log/feed-log';
import { StandardLog } from './pages/standard-log/standard-log';
import { DailyLog } from './pages/daily-log/daily-log';
import { Login } from './components/login/login';
import { authGuard } from './services/auth-guard';

export const routes: Routes = [
    {
        path: "",
        redirectTo: "home",
        pathMatch: 'full'
    },
    {
        path: "home",
        component: Home,
        canActivate: [authGuard]
    },
    {
        path: "daily-log",
        component: DailyLog,
        canActivate: [authGuard]
    },
    {
        path: "feed-log",
        component: FeedLog,
        canActivate: [authGuard]
    },
    {
        path: "standard-log",
        component: StandardLog,
        canActivate: [authGuard]
    },
    {
        path: "login",
        component: Login
    },
    {
        path: "**",
        redirectTo: "login",
        pathMatch: 'full'
    },
];
