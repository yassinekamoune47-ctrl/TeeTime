<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_orders', function (Blueprint $table) {
            $table->string('delivery_full_name')->nullable();
            $table->string('delivery_phone', 30)->nullable();
            $table->string('delivery_city')->nullable();
            $table->string('delivery_address')->nullable();
            $table->text('delivery_details')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('product_orders', function (Blueprint $table) {
            $table->dropColumn([
                'delivery_full_name',
                'delivery_phone',
                'delivery_city',
                'delivery_address',
                'delivery_details',
            ]);
        });
    }
};
