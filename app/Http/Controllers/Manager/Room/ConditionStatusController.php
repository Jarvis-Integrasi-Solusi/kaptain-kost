<?php

namespace App\Http\Controllers\Manager\Room;

use App\Http\Controllers\Controller;
use App\Models\ConditionStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ConditionStatusController extends Controller
{
    public function index(Request $request)
    {
        $allConditionStatuses = ConditionStatus::all();

        return Inertia::render('manager/room/condition-status/index', [
            'condition_statuses' => $allConditionStatuses,
            'filters' => [
                'search' => $request->get('search', ''),
            ],
        ]);
    }

    public function store(Request $request)
    {
        try {
            // Validate the request
            $validated = $request->validate([
                'name' => [
                    'required',
                    'string',
                    'max:255',
                ],
            ]);

            // Create the condition status
            $conditionStatus = ConditionStatus::create([
                'name' => $validated['name'],
            ]);

            return redirect()->route('manager.room.condition-status.index')
                ->with('success', [
                    'title' => 'Condition Status Created!', 
                    'message' => "Condition status '{$conditionStatus->name}' has been created successfully."
                ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            return redirect()->back()                
                ->with('error', [
                    'title' => 'Error!',
                    'message' => 'An error occurred while creating the condition status. Please try again.'
                ])->withInput();
        }
    }

    public function update(Request $request, $id)
    {
        try {
            // Find the condition status
            $conditionStatus = ConditionStatus::findOrFail($id);

            // Validate the request
            $validated = $request->validate([
                'name' => [
                    'required',
                    'string',
                    'max:255',
                    ],
            ]);

            // Update the condition status
            $conditionStatus->update([
                'name' => $validated['name'],
            ]);

            return redirect()->route('manager.room.condition-status.index')
                ->with('success', [
                    'title' => 'Condition Status Updated!', 
                    'message' => "Condition status '{$conditionStatus->name}' has been updated successfully."
                ]);
                
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            return redirect()->back()                
                ->with('error', [
                    'title' => 'Error!',
                    'message' => 'An error occurred while updating the condition status. Please try again.'
                ])->withInput();        }
    }

    public function destroy($id)
    {
        try {
            // Find the condition status
            $conditionStatus = ConditionStatus::findOrFail($id);

            // Delete the condition status
            $conditionStatus->delete();

            return redirect()->route('manager.room.condition-status.index')
                ->with('success', [
                    'title' => 'Condition Status Deleted!', 
                    'message' => "Condition status '{$conditionStatus->name}' has been deleted successfully."
                ]);
        } catch (\Exception $e) {
            return redirect()->back()                
                ->with('error', [
                    'title' => 'Error!',
                    'message' => 'An error occurred while deleting the condition status. Please try again.'
                ])->withInput();
        }
    }
}