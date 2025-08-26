<?php

namespace App\Http\Controllers\Manager\Room;

use App\Http\Controllers\Controller;
use App\Models\RoomCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

use function Laravel\Prompts\alert;

class CategoryController extends Controller
{

    public function index(Request $request)
    {
        $user = Auth::user();
        
        // Get all categories for search functionality
        $allCategories = RoomCategory::where('company_id', $user->company_id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('manager/room-category/index', [
            'categories' => $allCategories, // Send all data for client-side filtering
            'filters' => [
                'search' => $request->get('search', ''),
            ],
        ]);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
