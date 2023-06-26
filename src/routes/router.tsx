import { RouteObject, createBrowserRouter } from 'react-router-dom';
import PublicRouter from './PublicRouter';
import { Home } from '../pages';

const routes: RouteObject[] = [
    {
        path: '/', element: <PublicRouter />,
        children: [
            { index: true, element: <Home /> },
        ]
    },

];

export const router = createBrowserRouter(routes);