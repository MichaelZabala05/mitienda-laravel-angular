<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'category_id', 'name', 'slug', 'description',
        'price', 'compare_at_price', 'stock', 'image_url',
        'is_active', 'is_featured',
    ];

    // decimal:2 llega al JSON como texto ("45000.00"); Angular lo convierte con Number()
    protected $casts = [
        'price'            => 'decimal:2',
        'compare_at_price' => 'decimal:2',
        'stock'            => 'integer',
        'is_active'        => 'boolean',
        'is_featured'      => 'boolean',
    ];

    // Campo calculado que se incluye automáticamente en el JSON
    protected $appends = ['discount_percent'];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    // % de descuento: 0 si no hay precio "antes" o si no es mayor al actual
    protected function discountPercent(): Attribute
    {
        return Attribute::get(function () {
            $antes  = (float) $this->compare_at_price;
            $precio = (float) $this->price;

            return ($antes > $precio && $antes > 0)
                ? (int) round((1 - $precio / $antes) * 100)
                : 0;
        });
    }

    // Uso: Product::active()->get()
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}
