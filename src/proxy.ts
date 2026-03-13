import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
    matcher: [
        '/',
        '/(si|ta|en)/:path*',
        '/((?!_next|_vercel|.*\\.(?:html?|css|js(?!on)?|jpe?g|webp|png|gif|svg|ttf|woff2?|otf|ico|bmp)).*)'
    ]
};
