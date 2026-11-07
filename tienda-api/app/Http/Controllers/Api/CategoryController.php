<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;

class CategoryController extends Controller
{
    // GET /api/categories  → incluye cuántos productos activos tiene cada una
    public function index()
    {
        return Category::withCount([
                'products' => fn ($q) => $q->where('is_active', true),
            ])
            ->orderBy('name')
            ->get();
    }
}
