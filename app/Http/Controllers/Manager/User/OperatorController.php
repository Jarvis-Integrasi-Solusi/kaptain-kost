<?php

namespace App\Http\Controllers\Manager\User;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class OperatorController extends Controller
{
    public function index(Request $request)
    {
        $operators = User::where('role', 'operator')
                        ->where('company_id', Auth::user()->company_id)
                        ->orderBy('created_at', 'desc')
                        ->get();

        return Inertia::render('manager/user/operator/index', [
            'operators' => $operators,
            'filters' => [
                'search' => $request->get('search', ''),
            ],
        ]);
    }
}
