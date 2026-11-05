<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Drop the loyalty points feature columns only. Existing users and orders
     * are preserved; the added columns are removed in place.
     */
    public function up(): void
    {
        Schema::table('product_orders', function (Blueprint $table) {
            $table->dropColumn(['points_redeemed', 'discount_amount', 'points_earned']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['loyalty_points', 'loyalty_points_lifetime']);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedInteger('loyalty_points')->default(0)->after('is_totp_enabled');
            $table->unsignedInteger('loyalty_points_lifetime')->default(0)->after('loyalty_points');
        });

        Schema::table('product_orders', function (Blueprint $table) {
            $table->unsignedInteger('points_redeemed')->default(0)->after('total_price');
            $table->decimal('discount_amount', 8, 2)->default(0)->after('points_redeemed');
            $table->unsignedInteger('points_earned')->default(0)->after('discount_amount');
        });
    }
};
