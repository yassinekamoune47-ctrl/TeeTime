<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        $locale = str_starts_with(strtolower((string) $request->header('Accept-Language', '')), 'en')
            ? 'en'
            : 'fr';

        app()->setLocale($locale);

        return $next($request);
    }
}
