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
            $table->string('role')->default('PLAYER')->after('email');
            $table->string('first_name')->nullable()->after('name');
            $table->string('last_name')->nullable()->after('first_name');
            $table->string('phone_number')->nullable()->after('last_name');
            $table->string('status')->default('ACTIVE')->after('phone_number');
            $table->string('gender')->nullable()->after('status');
            $table->string('avatar_url')->nullable()->after('gender');
            $table->text('bio')->nullable()->after('avatar_url');
            $table->date('birth_date')->nullable()->after('bio');
            $table->boolean('is_totp_enabled')->default(false)->after('birth_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'role',
                'first_name',
                'last_name',
                'phone_number',
                'status',
                'gender',
                'avatar_url',
                'bio',
                'birth_date',
                'is_totp_enabled',
            ]);
        });
    }
};
