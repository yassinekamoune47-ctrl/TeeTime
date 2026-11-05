<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('country_calling_code')->nullable()->after('phone_number');
            $table->string('frmgl_license_number')->nullable()->after('country_calling_code');
            $table->decimal('current_handicap', 4, 1)->nullable()->after('frmgl_license_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'country_calling_code',
                'frmgl_license_number',
                'current_handicap',
            ]);
        });
    }
};
