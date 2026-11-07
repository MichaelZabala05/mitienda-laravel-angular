<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

class SettingsController extends Controller
{
    // GET /api/settings → el frontend lee aquí las reglas de envío,
    // así el valor vive en un solo lugar (config/tienda.php).
    public function __invoke()
    {
        return response()->json(config('tienda'));
    }
}
