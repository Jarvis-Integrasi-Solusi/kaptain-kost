<?php

namespace App\Http\Controllers\Manager\User;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    public function deactivate($id){
        Auth::user();

        if(Auth::user()->role !== 'manager'){
            return back()->with('error', [
                'title' => 'Unauthorized!',
                'message' => 'You do not have permission to perform this action.'
            ]);
        }

        // Find the tenant user
        $user = User::where('company_id', Auth::user()->company_id)
            ->findOrFail($id);

        try {
            // Deactivate the tenant user
            $user->update(['status' => 'inactive']);

            return redirect()->back()
                ->with('success', [
                    'title' => 'User Deactivated!',
                    'message' => "User account for '{$user->name}' has been deactivated successfully."
                ]);
        } catch (\Exception $e) {
            return back()
                ->with('error', [
                    'title' => 'Error!',
                    'message' => 'An error occurred while deactivating the user account. Please try again.'
                ]);
        }
    }
}
