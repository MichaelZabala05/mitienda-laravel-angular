<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    // GET /api/products?category=ropa&q=jean&sort=price_asc&min=50000&max=200000&on_sale=1&page=2
    public function index(Request $request)
    {
        $filters = $request->validate([
            'category' => 'nullable|string|max:80',
            'q'        => 'nullable|string|max:80',
            'sort'     => 'nullable|in:relevance,price_asc,price_desc,newest,name',
            'min'      => 'nullable|numeric|min:0',
            'max'      => 'nullable|numeric|min:0',
            'on_sale'  => 'nullable|boolean',
            'per_page' => 'nullable|integer|min:1|max:48',
        ]);

        $query = Product::with('category')->active();

        if (! empty($filters['category'])) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $filters['category']));
        }

        if (! empty($filters['q'])) {
            $term = '%' . $filters['q'] . '%';
            // Agrupado en un where(...) para no romper los demás filtros con el OR
            $query->where(fn ($q) => $q->where('name', 'like', $term)
                                       ->orWhere('description', 'like', $term));
        }

        if (isset($filters['min'])) {
            $query->where('price', '>=', $filters['min']);
        }

        if (isset($filters['max'])) {
            $query->where('price', '<=', $filters['max']);
        }

        if ($request->boolean('on_sale')) {
            $query->whereNotNull('compare_at_price')
                  ->whereColumn('compare_at_price', '>', 'price');
        }

        match ($filters['sort'] ?? 'relevance') {
            'price_asc'  => $query->orderBy('price'),
            'price_desc' => $query->orderByDesc('price'),
            'newest'     => $query->latest(),
            'name'       => $query->orderBy('name'),
            // Recomendados: destacados primero, agotados al final
            default      => $query->orderByDesc('is_featured')->orderByDesc('stock')->orderBy('name'),
        };

        return $query->paginate($filters['per_page'] ?? 12)->withQueryString();
    }

    // GET /api/products/featured → para la página de inicio
    public function featured()
    {
        return Product::with('category')
            ->active()
            ->where('is_featured', true)
            ->orderByDesc('stock')
            ->take(8)
            ->get();
    }

    // GET /api/products/{slug} → producto + relacionados de la misma categoría
    public function show(string $slug)
    {
        $product = Product::with('category')->active()->where('slug', $slug)->firstOrFail();

        $related = Product::with('category')
            ->active()
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->where('stock', '>', 0)
            ->inRandomOrder()
            ->take(4)
            ->get();

        return response()->json([
            'product' => $product,
            'related' => $related,
        ]);
    }
}
