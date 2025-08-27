<?php

namespace App\Http\Controllers\Manager\Room;

use App\Http\Controllers\Controller;
use App\Models\OccupancyStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class OccupancyStatusController extends Controller
{
    public function index(Request $request)
    {
         $user = Auth::user();

         $allOccupancyStatuses = OccupancyStatus::where('company_id', $user->company_id)
             ->orderBy('created_at', 'desc')
             ->get();

        return Inertia::render('manager/room/occupancy-status/index', [
            'occupancy_statuses' => $allOccupancyStatuses,
            'filters' => [
                'search' => $request->get('search', ''),
            ],
        ]);
    }

    public function store(Request $request)
    {
        try {
            $user = Auth::user();

            // Validate the request
            $validated = $request->validate([
                'name' => [
                    'required',
                    'string',
                    'max:255',
                    'unique:occupancy_statuses,name,NULL,id,company_id,' . $user->company_id
                ],
            ]);

            // Create the occupancy status
            $occupancyStatus = OccupancyStatus::create([
                'company_id' => $user->company_id,
                'name' => $validated['name'],
            ]);

            return redirect()->route('manager.room.occupancy-status.index')
                ->with('success', [
                    'title' => 'Occupancy Status Created!', 
                    'message' => "Occupancy status '{$occupancyStatus->name}' has been created successfully."
                ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            return redirect()->back()                
                ->with('error', [
                    'title' => 'Error!',
                    'message' => 'An error occurred while creating the room category. Please try again.'
                ])->withInput();
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $user = Auth::user();

            // Find the occupancy status
            $occupancyStatus = OccupancyStatus::where('company_id', $user->company_id)->findOrFail($id);

            // Validate the request
            $validated = $request->validate([
                'name' => [
                    'required',
                    'string',
                    'max:255',
                    'unique:occupancy_statuses,name,' . $occupancyStatus->id . ',id,company_id,' . $user->company_id
                ],
            ]);

            // Update the occupancy status
            $occupancyStatus->update([
                'name' => $validated['name'],
            ]);

            return redirect()->route('manager.room.occupancy-status.index')
                ->with('success', [
                    'title' => 'Occupancy Status Updated!', 
                    'message' => "Occupancy status '{$occupancyStatus->name}' has been updated successfully."
                ]);
                
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            return redirect()->back()                
                ->with('error', [
                    'title' => 'Error!',
                    'message' => 'An error occurred while updating the room category. Please try again.'
                ])->withInput();        }
    }

    public function destroy($id)
    {
        try {
            $user = Auth::user();

            // Find the occupancy status
            $occupancyStatus = OccupancyStatus::where('company_id', $user->company_id)->findOrFail($id);

            // Delete the occupancy status
            $occupancyStatus->delete();

            return redirect()->route('manager.room.occupancy-status.index')
                ->with('success', [
                    'title' => 'Occupancy Status Deleted!', 
                    'message' => "Occupancy status '{$occupancyStatus->name}' has been deleted successfully."
                ]);
        } catch (\Exception $e) {
            return redirect()->back()                
                ->with('error', [
                    'title' => 'Error!',
                    'message' => 'An error occurred while deleting the occupancy status. Please try again.'
                ])->withInput();
        }
    }

}
