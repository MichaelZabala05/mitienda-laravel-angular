<?php

use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\SettingsController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// --- Configuración pública ---
Route::get('/settings', SettingsController::class);

// --- Catálogo ---
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/products/featured', [ProductController::class, 'featured']); // antes de {slug}
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{slug}', [ProductController::class, 'show']);

// --- Pedidos ---
// throttle:10,1 → máximo 10 pedidos por minuto por IP (protege contra abuso)
Route::post('/orders', [OrderController::class, 'store'])->middleware('throttle:10,1');
Route::get('/orders/{code}', [OrderController::class, 'show']);

// --- Reservado para el panel admin (Sanctum) ---
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
