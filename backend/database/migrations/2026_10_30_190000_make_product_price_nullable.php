<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * A product price is only ever a verified selling price for the exact product,
     * so an unset price now means "Prix sur demande" instead of the old 0 default.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('price', 8, 2)->nullable()->default(null)->change();
        });

        DB::table('products')->where('price', 0)->update(['price' => null]);
    }

    public function down(): void
    {
        DB::table('products')->whereNull('price')->update(['price' => 0]);

        Schema::table('products', function (Blueprint $table) {
            $table->decimal('price', 8, 2)->default(0)->change();
        });
    }
};
