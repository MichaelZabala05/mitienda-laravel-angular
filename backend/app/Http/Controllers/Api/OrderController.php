<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    // POST /api/orders
    // Regla de oro: el cliente NO envía precios; se recalculan aquí.
    public function store(Request $request)
    {
        $data = $request->validate([
            'customer_name'      => 'required|string|max:120',
            'customer_email'     => 'required|email',
            'customer_phone'     => 'required|string|max:20',
            'address'            => 'required|string|max:255',
            'items'              => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|distinct|exists:products,id',
            'items.*.quantity'   => 'required|integer|min:1|max:50',
        ]);

        $order = DB::transaction(function () use ($data) {
            $order = Order::create(Arr::except($data, 'items'));
            $total = 0;

            foreach ($data['items'] as $item) {
                // lockForUpdate: bloquea la fila hasta el fin de la transacción
                // (evita vender la misma última unidad dos veces)
                $product = Product::where('id', $item['product_id'])
                    ->lockForUpdate()
                    ->firstOrFail();

                if (! $product->is_active || $product->stock < $item['quantity']) {
                    // Lanzar la excepción revierte TODO (pedido e ítems)
                    throw ValidationException::withMessages([
                        'items' => "Stock insuficiente para {$product->name}",
                    ]);
                }

                $subtotal = $product->price * $item['quantity'];

                $order->items()->create([
                    'product_id' => $product->id,
                    'quantity'   => $item['quantity'],
                    'unit_price' => $product->price,
                    'subtotal'   => $subtotal,
                ]);

                $product->decrement('stock', $item['quantity']);
                $total += $subtotal;
            }

            $order->update(['total' => $total]);

            return $order;
        });

        return response()->json($order->load('items.product'), 201);
    }
}
