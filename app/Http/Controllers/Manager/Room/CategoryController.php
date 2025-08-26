<?php

namespace App\Http\Controllers\Manager\Room;

use App\Http\Controllers\Controller;
use App\Models\RoomCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Validation\ValidationException;


class CategoryController extends Controller
{

    public function index(Request $request)
    {
        $user = Auth::user();
        
        $allCategories = RoomCategory::where('company_id', $user->company_id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('manager/room-category/index', [
            'categories' => $allCategories, 
            'filters' => [
                'search' => $request->get('search', ''),
            ],
        ]);
    }


    public function create() {
        return Inertia::render('manager/room-category/create');
    }

    public function store(Request $request)
    {
        $user = Auth::user();

        try {
            // Validate the request
            $validated = $request->validate([
                'name' => [
                    'required',
                    'string',
                    'max:255',
                    // Check unique name within the same company
                    'unique:room_categories,name,NULL,id,company_id,' . $user->company_id
                ],
                'monthly_rental_fee' => [
                    'required',
                    'numeric',
                    'min:0',
                    'max:99999999.99'
                ],
                'deposit_fee' => [
                    'required',
                    'numeric',
                    'min:0',
                    'max:99999999.99'
                ],
                'management_fee' => [
                    'required',
                    'numeric',
                    'min:0',
                    'max:99999999.99'
                ],
                'water_bill_fee' => [
                    'required',
                    'numeric',
                    'min:0',
                    'max:99999999.99'
                ],
                'electricity_bill_fee' => [
                    'required',
                    'numeric',
                    'min:0',
                    'max:99999999.99'
                ],
            ], [
                // Custom error messages
                'name.required' => 'Category name is required.',
                'name.unique' => 'This category name already exists in your company.',
                'name.max' => 'Category name cannot exceed 255 characters.',
                
                'monthly_rental_fee.required' => 'Monthly rental fee is required.',
                'monthly_rental_fee.numeric' => 'Monthly rental fee must be a valid number.',
                'monthly_rental_fee.min' => 'Monthly rental fee cannot be negative.',
                'monthly_rental_fee.max' => 'Monthly rental fee is too large.',
                
                'deposit_fee.required' => 'Deposit fee is required.',
                'deposit_fee.numeric' => 'Deposit fee must be a valid number.',
                'deposit_fee.min' => 'Deposit fee cannot be negative.',
                'deposit_fee.max' => 'Deposit fee is too large.',
                
                'management_fee.required' => 'Management fee is required.',
                'management_fee.numeric' => 'Management fee must be a valid number.',
                'management_fee.min' => 'Management fee cannot be negative.',
                'management_fee.max' => 'Management fee is too large.',
                
                'water_bill_fee.required' => 'Water bill fee is required.',
                'water_bill_fee.numeric' => 'Water bill fee must be a valid number.',
                'water_bill_fee.min' => 'Water bill fee cannot be negative.',
                'water_bill_fee.max' => 'Water bill fee is too large.',
                
                'electricity_bill_fee.required' => 'Electricity bill fee is required.',
                'electricity_bill_fee.numeric' => 'Electricity bill fee must be a valid number.',
                'electricity_bill_fee.min' => 'Electricity bill fee cannot be negative.',
                'electricity_bill_fee.max' => 'Electricity bill fee is too large.',
            ]);

            // Create the room category
            $roomCategory = RoomCategory::create([
                'company_id' => $user->company_id,
                'name' => $validated['name'],
                'monthly_rental_fee' => $validated['monthly_rental_fee'],
                'deposit_fee' => $validated['deposit_fee'],
                'management_fee' => $validated['management_fee'],
                'water_bill_fee' => $validated['water_bill_fee'],
                'electricity_bill_fee' => $validated['electricity_bill_fee'],
            ]);

            // Redirect with success message
            return redirect('/manager/room-category')
                ->with('success', [
                    'title' => 'Category Created!',
                    'message' => "Room category '{$roomCategory->name}' has been created successfully."
                ]);

        } catch (ValidationException $e) {
            // Return validation errors
            return back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            // Handle any other errors
            return back()
                ->with('error', [
                    'title' => 'Error!',
                    'message' => 'An error occurred while creating the room category. Please try again.'
                ])
                ->withInput();
        }
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
