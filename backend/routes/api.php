<?php

use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// --- Tienda pública ---
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{slug}', [ProductController::class, 'show']);
Route::post('/orders', [OrderController::class, 'store']);

// --- Reservado para el panel admin (Sanctum) ---
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
