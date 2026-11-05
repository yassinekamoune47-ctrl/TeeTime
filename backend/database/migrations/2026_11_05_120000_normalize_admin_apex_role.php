<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * users.role has no enum, so the APEX administrator has been written by hand in
     * several spellings ('Admin APEX', 'APEX Admin', 'ROLE_ADMIN_APEX'). The whole
     * stack compares the canonical ADMIN_APEX, so the stored values are rewritten.
     */
    public function up(): void
    {
        User::query()
            ->where('role', 'like', '%APEX%')
            ->where(fn ($query) => $query->where('role', '!=', User::ROLE_ADMIN_APEX))
            ->get()
            ->each(function (User $user) {
                if ($user->normalizedRole() === User::ROLE_ADMIN_APEX) {
                    $user->forceFill(['role' => User::ROLE_ADMIN_APEX])->save();
                }
            });
    }

    public function down(): void
    {
        // Canonical values are kept: rolling back would only restore misspellings.
    }
};
