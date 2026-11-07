<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Migración nueva (no se editan las anteriores): así funciona también
// en una base que ya tiene datos, sin borrar pedidos existentes.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Precio "antes": si es mayor que price, el producto está en oferta
            $table->decimal('compare_at_price', 12, 2)->nullable()->after('price');
            // Productos que aparecen en la página de inicio
            $table->boolean('is_featured')->default(false)->after('is_active');
            $table->index(['is_active', 'is_featured']);
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['is_active', 'is_featured']);
            $table->dropColumn(['compare_at_price', 'is_featured']);
        });
    }
};
