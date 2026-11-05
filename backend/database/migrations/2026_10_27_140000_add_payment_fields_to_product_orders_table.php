<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_orders', function (Blueprint $table) {
            $table->string('payment_status')->default('UNPAID')->index();
            $table->string('payment_method')->nullable();
            $table->string('card_last4', 4)->nullable();
            $table->timestamp('paid_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('product_orders', function (Blueprint $table) {
            $table->dropColumn(['payment_status', 'payment_method', 'card_last4', 'paid_at']);
        });
    }
};
