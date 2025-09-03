<?php

namespace App\Http\Controllers\Manager\Room;

use App\Http\Controllers\Controller;
use App\Models\Rental;
use App\Models\Room;
use App\Models\RoomImage;
use App\Models\RoomCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Validation\ValidationException;

class RoomController extends Controller
{

    public function index(Request $request)
    {
        $user = Auth::user();
        
        $allRooms = Room::with(['roomCategory', 'roomImages'])
            ->where('company_id', $user->company_id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('manager/room/index', [
            'rooms' => $allRooms, 
            'filters' => [
                'search' => $request->get('search', ''),
            ],
        ]);
    }


    public function create() 
    {
        $user = Auth::user();
        
        $categories = RoomCategory::where('company_id', $user->company_id)
            ->orderBy('name', 'asc')
            ->get();

        return Inertia::render('manager/room/create', [
            'categories' => $categories
        ]);
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
                    'unique:rooms,name,NULL,id,company_id,' . $user->company_id
                ],
                'room_category_id' => [
                    'required',
                    'exists:room_categories,id'
                ],
                'description' => [
                    'nullable',
                    'string',
                    'max:1000'
                ],
                'images' => [
                    'nullable',
                    'array',
                    'max:3' //
                ],
                'images.*' => [
                    'image',
                    'mimes:jpeg,png,jpg,gif',
                    'max:2048' 
                ],
            ], [
                'name.max' => 'Room name cannot exceed 255 characters.',
                'description.max' => 'Description cannot exceed 1000 characters.',
                'images.max' => 'Maximum 3 images allowed.',
                'images.*.image' => 'Each file must be an image.',
                'images.*.mimes' => 'Each image must be a file of type: jpeg, png, jpg.',
                'images.*.max' => 'Each image may not be greater than 2MB.',
            ]);

            // Verify the category belongs to the user's company
            $category = RoomCategory::where('id', $validated['room_category_id'])
                ->where('company_id', $user->company_id)
                ->first();

            if (!$category) {
                return back()
                    ->with('error', [
                        'title' => 'Invalid Category',
                        'message' => 'The selected room category is invalid.'
                    ])
                    ->withInput();
            }

            DB::beginTransaction();

            // Create the room
            $room = Room::create([
                'company_id' => $user->company_id,
                'room_category_id' => $validated['room_category_id'],
                'name' => $validated['name'],
                'description' => $validated['description'],
            ]);

            // Handle multiple image uploads
            if ($request->has('images') && is_array($request->images)) {
                foreach ($request->images as $image) {
                    if ($image) {
                        $imagePath = $image->store('images/room', 'public');
                        
                        RoomImage::create([
                            'room_id' => $room->id,
                            'image' => $imagePath,
                        ]);
                    }
                }
            }

            DB::commit();

            return redirect()->route('manager.room.index')
                ->with('success', [
                    'title' => 'Room Created!',
                    'message' => "Room '{$room->name}' has been created successfully."
                ]);

        } catch (ValidationException $e) {
            DB::rollBack();
            return back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            DB::rollBack();

            return back()
                ->with('error', [
                    'title' => 'Error!',
                    'message' => 'An error occurred while creating the room. Please try again.'
                ])
                ->withInput();
        }
    }

    public function show(string $id)
    {
        try {
            $user = Auth::user();
            
            $room = Room::with(['roomCategory', 'roomImages'])
                ->where('id', $id)
                ->where('company_id', $user->company_id)
                ->firstOrFail();

            $rentals = Rental::with([
                'user:id,name,email',
                'room:id,name',
                'room.roomCategory:id,name',
                'paymentType:id,name',
                'rentalPeriod:id,month'
            ])
            ->where('room_id', $room->id)
            ->orderBy('entry_date', 'desc')
            ->get();


            return Inertia::render('manager/room/show', [
                'room' => $room,
                'rentals' => $rentals
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return redirect()->route('manager.room.index')
                ->with('error', [
                    'title' => 'Room Not Found',
                    'message' => 'The specified room does not exist or you do not have permission to access it.'
                ]);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        try {
            $user = Auth::user();
            
            // Find the room for the current user's company
            $room = Room::with(['roomCategory', 'roomImages'])
                ->where('id', $id)
                ->where('company_id', $user->company_id)
                ->firstOrFail();

            $categories = RoomCategory::where('company_id', $user->company_id)
                ->orderBy('name', 'asc')
                ->get();

            return Inertia::render('manager/room/edit', [
                'room' => $room,
                'categories' => $categories
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return redirect()->route('manager.room.index')
                ->with('error', [
                    'title' => 'Room Not Found',
                    'message' => 'The specified room does not exist or you do not have permission to access it.'
                ]);
        } catch (\Exception $e) {
            return redirect('/manager/room')
                ->with('error', [
                    'title' => 'Error!',
                    'message' => 'An error occurred while loading the room. Please try again.'
                ]);
        }
    }



    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = Auth::user();

        try {
            // Find the room for the current user's company
            $room = Room::with('roomImages')
                ->where('id', $id)
                ->where('company_id', $user->company_id)
                ->firstOrFail();

            // Validate the request
            $validated = $request->validate([
                'name' => [
                    'required',
                    'string',
                    'max:255',
                    // Check unique name within the same company, excluding current record
                    'unique:rooms,name,' . $id . ',id,company_id,' . $user->company_id
                ],
                'room_category_id' => [
                    'required',
                    'exists:room_categories,id'
                ],
                'description' => [
                    'nullable',
                    'string',
                    'max:1000'
                ],
                'images' => [
                    'nullable',
                    'array',
                    'max:3' // Maximum 3 images
                ],
                'images.*' => [
                    'image',
                    'mimes:jpeg,png,jpg,gif',
                    'max:2048' // 2MB max per image
                ],
                'deleted_images' => [
                    'nullable',
                    'array'
                ],
                'deleted_images.*' => [
                    'integer',
                    'exists:room_images,id'
                ],
            ], [
                'name.max' => 'Room name cannot exceed 255 characters.',
                'description.max' => 'Description cannot exceed 1000 characters.',
                'images.max' => 'Maximum 3 images allowed.',
                'images.*.image' => 'Each file must be an image.',
                'images.*.mimes' => 'Each image must be a file of type: jpeg, png, jpg, gif.',
                'images.*.max' => 'Each image may not be greater than 2MB.',
            ]);

            // Verify the category belongs to the user's company
            $category = RoomCategory::where('id', $validated['room_category_id'])
                ->where('company_id', $user->company_id)
                ->first();

            if (!$category) {
                return back()
                    ->with('error', [
                        'title' => 'Invalid Category',
                        'message' => 'The selected room category is invalid.'
                    ])
                    ->withInput();
            }

            DB::beginTransaction();

            // Update the room
            $room->update([
                'room_category_id' => $validated['room_category_id'],
                'name' => $validated['name'],
                'description' => $validated['description'],
            ]);

            // Handle deleted images
            if ($request->has('deleted_images') && is_array($request->deleted_images)) {
                $deletedImages = RoomImage::where('room_id', $room->id)
                    ->whereIn('id', $request->deleted_images)
                    ->get();

                foreach ($deletedImages as $deletedImage) {
                    // Delete physical file
                    if (Storage::disk('public')->exists($deletedImage->image)) {
                        Storage::disk('public')->delete($deletedImage->image);
                    }
                    // Delete from database
                    $deletedImage->delete();
                }
            }

            // Handle new image uploads
            if ($request->has('images') && is_array($request->images)) {
                // Check current image count after deletions
                $currentImageCount = $room->roomImages()->count();
                $newImageCount = count($request->images);
                
                if (($currentImageCount + $newImageCount) > 10) {
                    DB::rollBack();
                    return back()
                        ->with('error', [
                            'title' => 'Too Many Images',
                            'message' => 'Maximum 3 images allowed per room.'
                        ])
                        ->withInput();
                }

                foreach ($request->images as $image) {
                    if ($image) {
                        $imagePath = $image->store('images/room', 'public');
                        
                        RoomImage::create([
                            'room_id' => $room->id,
                            'image' => $imagePath,
                        ]);
                    }
                }
            }

            DB::commit();

            // Redirect with success message
            return redirect()->route('manager.room.index')
                ->with('success', [
                    'title' => 'Room Updated!',
                    'message' => "Room '{$room->name}' has been updated successfully."
                ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            DB::rollBack();
            return redirect()->route('manager.room.index')
                ->with('error', [
                    'title' => 'Room Not Found',
                    'message' => 'The specified room does not exist or you do not have permission to access it.'
                ]);
        } catch (ValidationException $e) {
            DB::rollBack();
            // Return validation errors
            return back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            DB::rollBack();
            // Handle any other errors
            return back()
                ->with('error', [
                    'title' => 'Error!',
                    'message' => 'An error occurred while updating the room. Please try again.'
                ])
                ->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $user = Auth::user();
            $room = Room::with('roomImages')
                ->where('id', $id)
                ->where('company_id', $user->company_id)
                ->firstOrFail();

            $roomName = $room->name;
            
            DB::beginTransaction();

            // Delete all room images
            foreach ($room->roomImages as $roomImage) {
                if (Storage::disk('public')->exists($roomImage->image)) {
                    Storage::disk('public')->delete($roomImage->image);
                }
            }
            
            // Delete room (images will be deleted automatically due to cascade)
            $room->delete();

            DB::commit();

            return redirect()->route('manager.room.index')
                ->with('success', [
                    'title' => 'Room Deleted',
                    'message' => "Room '{$roomName}' has been deleted successfully."
                ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            DB::rollBack();
            return back()->with('error', [
                'title' => 'Room Not Found',
                'message' => 'The specified room does not exist.'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', [
                'title' => 'Error!',
                'message' => 'An error occurred while deleting the room. Please try again.'
            ]);
        }
    }
}