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
    // Regla de oro: el cliente NO envía precios ni costo de envío; todo se calcula aquí.
    public function store(Request $request)
    {
        $data = $request->validate([
            'customer_name'      => 'required|string|min:3|max:120',
            'customer_email'     => 'required|email|max:150',
            'customer_phone'     => ['required', 'string', 'regex:/^[0-9+\s-]{7,20}$/'],
            'city'               => 'required|string|max:80',
            'address'            => 'required|string|min:5|max:255',
            'notes'              => 'nullable|string|max:500',
            'payment_method'     => 'required|in:contraentrega,transferencia',
            'items'              => 'required|array|min:1|max:30',
            'items.*.product_id' => 'required|integer|distinct|exists:products,id',
            'items.*.quantity'   => 'required|integer|min:1|max:50',
        ], [
            // Mensajes en español para los casos que el usuario puede ver
            'required'          => 'El campo :attribute es obligatorio.',
            'email'             => 'Escribe un correo válido.',
            'customer_phone.regex' => 'Escribe un número de teléfono válido.',
            'items.required'    => 'Tu carrito está vacío.',
        ]);

        $order = DB::transaction(function () use ($data) {
            $order = Order::create(Arr::except($data, 'items'));
            $subtotal = 0;

            foreach ($data['items'] as $item) {
                // lockForUpdate: evita vender la misma última unidad dos veces
                $product = Product::where('id', $item['product_id'])
                    ->lockForUpdate()
                    ->firstOrFail();

                if (! $product->is_active || $product->stock < $item['quantity']) {
                    // Lanzar la excepción revierte TODO (pedido e ítems)
                    $disponibles = $product->is_active ? $product->stock : 0;
                    throw ValidationException::withMessages([
                        'items' => "Solo quedan {$disponibles} unidades de {$product->name}. Ajusta tu carrito.",
                    ]);
                }

                $lineTotal = $product->price * $item['quantity'];

                $order->items()->create([
                    'product_id' => $product->id,
                    'quantity'   => $item['quantity'],
                    'unit_price' => $product->price,
                    'subtotal'   => $lineTotal,
                ]);

                $product->decrement('stock', $item['quantity']);
                $subtotal += $lineTotal;
            }

            $shipping = $subtotal >= config('tienda.free_shipping_from')
                ? 0
                : config('tienda.shipping_cost');

            $order->update([
                'subtotal' => $subtotal,
                'shipping' => $shipping,
                'total'    => $subtotal + $shipping,
            ]);

            return $order;
        });

        return response()->json($this->present($order), 201);
    }

    // GET /api/orders/{code} → página de confirmación
    public function show(string $code)
    {
        $order = Order::where('code', $code)->firstOrFail();

        return $this->present($order);
    }

    private function present(Order $order): Order
    {
        // Solo los campos del producto que necesita la vista
        return $order->load('items.product:id,name,slug,image_url');
    }
}
