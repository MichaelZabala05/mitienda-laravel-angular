<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // [nombre, precio en COP, stock]
        $catalogo = [
            'Ropa' => [
                ['Camiseta básica', 45000, 30],
                ['Jean clásico', 120000, 15],
                ['Chaqueta impermeable', 210000, 8],
                ['Buzo con capota', 95000, 20],
            ],
            'Calzado' => [
                ['Tenis urbanos', 189000, 10],
                ['Sandalias', 65000, 20],
                ['Botas de cuero', 260000, 5],
            ],
            'Accesorios' => [
                ['Gorra', 35000, 25],
                ['Morral', 99000, 12],
                ['Reloj deportivo', 150000, 0],   // agotado, para probar el botón deshabilitado
            ],
        ];

        foreach ($catalogo as $nombreCategoria => $productos) {
            $category = Category::create([
                'name' => $nombreCategoria,
                'slug' => Str::slug($nombreCategoria),
            ]);

            foreach ($productos as [$nombre, $precio, $stock]) {
                $category->products()->create([
                    'name'        => $nombre,
                    'slug'        => Str::slug($nombre),
                    'description' => "Descripción de {$nombre}",
                    'price'       => $precio,
                    'stock'       => $stock,
                    'image_url'   => 'https://picsum.photos/seed/' . Str::slug($nombre) . '/400/300',
                ]);
            }
        }
    }
}
