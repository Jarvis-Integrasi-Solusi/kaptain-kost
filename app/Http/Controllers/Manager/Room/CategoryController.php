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

        return Inertia::render('manager/room/category/index', [
            'categories' => $allCategories, 
            'filters' => [
                'search' => $request->get('search', ''),
            ],
        ]);
    }


    public function create() 
    {
        return Inertia::render('manager/room/category/create');
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
            ], [
                'name.max' => 'Category name cannot exceed 255 characters.',
            ]);

            // Create the room category
            $roomCategory = RoomCategory::create([
                'company_id' => $user->company_id,
                'name' => $validated['name'],
                'monthly_rental_fee' => $validated['monthly_rental_fee'],
                'deposit_fee' => $validated['deposit_fee'],
                'management_fee' => $validated['management_fee'],
            ]);


            return redirect()->route('manager.room.category.index')
                ->with('success', [
                    'title' => 'Category Created!',
                    'message' => "Room category '{$roomCategory->name}' has been created successfully."
                ]);

        } catch (ValidationException $e) {
            return back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {

            return back()
                ->with('error', [
                    'title' => 'Error!',
                    'message' => 'An error occurred while creating the room category. Please try again.'
                ])
                ->withInput();
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        try {
            $user = Auth::user();
            
            // Find the room category for the current user's company
            $roomCategory = RoomCategory::where('id', $id)
                ->where('company_id', $user->company_id)
                ->firstOrFail();

            return Inertia::render('manager/room/category/edit', [
                'roomCategory' => $roomCategory
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return redirect()->route('manager.room.category.index')
                ->with('error', [
                    'title' => 'Category Not Found',
                    'message' => 'The specified room category does not exist or you do not have permission to access it.'
                ]);
        } catch (\Exception $e) {
            return redirect('/manager/room')
                ->with('error', [
                    'title' => 'Error!',
                    'message' => 'An error occurred while loading the room category. Please try again.'
                ]);
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
        $user = Auth::user();

        try {
            // Find the room category for the current user's company
            $roomCategory = RoomCategory::where('id', $id)
                ->where('company_id', $user->company_id)
                ->firstOrFail();

            // Validate the request
            $validated = $request->validate([
                'name' => [
                    'required',
                    'string',
                    'max:255',
                    // Check unique name within the same company, excluding current record
                    'unique:room_categories,name,' . $id . ',id,company_id,' . $user->company_id
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
            ], [
                'name.max' => 'Category name cannot exceed 255 characters.',
            ]);

            // Update the room category
            $roomCategory->update([
                'name' => $validated['name'],
                'monthly_rental_fee' => $validated['monthly_rental_fee'],
                'deposit_fee' => $validated['deposit_fee'],
                'management_fee' => $validated['management_fee'],
            ]);

            // Redirect with success message
            return redirect()->route('manager.room.category.index')
                ->with('success', [
                    'title' => 'Category Updated!',
                    'message' => "Room category '{$roomCategory->name}' has been updated successfully."
                ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return redirect()->route('manager.room.category.index')
                ->with('error', [
                    'title' => 'Category Not Found',
                    'message' => 'The specified room category does not exist or you do not have permission to access it.'
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
                    'message' => 'An error occurred while updating the room category. Please try again.'
                ])
                ->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        Try {
            $user = Auth::user();
            $category = RoomCategory::where('id', $id)
                ->where('company_id', $user->company_id)
                ->firstOrFail();

            $categoryName = $category->name;
            $category->delete();

            return redirect()->route('manager.room.category.index')
                ->with('success', [
                    'title' => 'Category Deleted',
                    'message' => "Room category '{$categoryName}' has been deleted successfully."
                ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return back()->with('error', [
                'title' => 'Category Not Found',
                'message' => 'The specified room category does not exist.'
            ]);
        } catch (\Exception $e) {
            return back()->with('error', [
                'title' => 'Error!',
                'message' => 'An error occurred while deleting the room category. Please try again.'
            ]);
        }
    }


}