<?php

// Configuración comercial de la tienda (valores en pesos colombianos).
// Se pueden cambiar desde .env sin tocar código:
//   TIENDA_ENVIO_GRATIS_DESDE=200000
//   TIENDA_COSTO_ENVIO=12000
return [
    'free_shipping_from' => (int) env('TIENDA_ENVIO_GRATIS_DESDE', 200000),
    'shipping_cost'      => (int) env('TIENDA_COSTO_ENVIO', 12000),
];
