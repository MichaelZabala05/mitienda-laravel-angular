<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    // GET /api/products?category=ropa&q=camiseta&page=1
    public function index(Request $request)
    {
        $query = Product::with('category')->where('is_active', true);

        if ($request->filled('category')) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $request->category));
        }

        if ($request->filled('q')) {
            $query->where('name', 'like', '%' . $request->q . '%');
        }

        // Paginado: la respuesta trae { data: [...], current_page, last_page, total }
        return $query->orderBy('name')->paginate(12);
    }

    // GET /api/products/{slug}
    public function show(string $slug)
    {
        return Product::with('category')
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();
    }
}
