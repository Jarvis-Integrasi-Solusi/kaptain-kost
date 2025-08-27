<?php

namespace App\Http\Controllers\Manager\Room;

use App\Http\Controllers\Controller;
use App\Models\ConditionStatus;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;
use Inertia\Inertia;

class ConditionStatusController extends Controller
{
    public function index(Request $request)
    {
         $user = Auth::user();

         $allConditionStatuses = ConditionStatus::where('company_id', $user->company_id)
             ->orderBy('created_at', 'desc')
             ->get();

        return Inertia::render('manager/room/condition-status/index', [
            'condition_statuses' => $allConditionStatuses,
            'filters' => [
                'search' => $request->get('search', ''),
            ],
        ]);
    }
}
