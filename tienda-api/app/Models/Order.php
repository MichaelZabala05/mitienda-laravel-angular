<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Order extends Model
{
    protected $fillable = [
        'code', 'customer_name', 'customer_email', 'customer_phone',
        'address', 'city', 'notes', 'payment_method',
        'subtotal', 'shipping', 'total', 'status',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'shipping' => 'decimal:2',
        'total'    => 'decimal:2',
    ];

    // Datos personales que nunca salen en la respuesta pública
    protected $hidden = ['customer_email', 'customer_phone', 'address', 'notes'];

    protected static function booted(): void
    {
        // Asigna un código único al crear el pedido
        static::creating(function (Order $order) {
            $order->code ??= self::generateCode();
        });
    }

    public static function generateCode(): string
    {
        do {
            $code = 'MT-' . Str::upper(Str::random(8));
        } while (self::where('code', $code)->exists());

        return $code;
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
