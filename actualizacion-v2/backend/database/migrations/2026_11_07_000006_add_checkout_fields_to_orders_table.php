<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Código público del pedido (ej. MT-8K2QZ7PA). Se usa en la URL de
            // confirmación en lugar del id numérico, que sería fácil de adivinar.
            // nullable: los pedidos creados antes de esta migración no tienen código.
            $table->string('code', 20)->nullable()->unique()->after('id');
            $table->string('city', 80)->nullable()->after('address');
            $table->text('notes')->nullable()->after('city');
            $table->string('payment_method', 30)->default('contraentrega')->after('notes');
            $table->decimal('subtotal', 12, 2)->default(0)->after('payment_method');
            $table->decimal('shipping', 12, 2)->default(0)->after('subtotal');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropUnique(['code']);
            $table->dropColumn(['code', 'city', 'notes', 'payment_method', 'subtotal', 'shipping']);
        });
    }
};
