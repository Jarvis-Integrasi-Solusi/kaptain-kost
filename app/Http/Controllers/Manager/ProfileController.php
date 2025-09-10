<?php

namespace App\Http\Controllers\Manager;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ProfileController extends Controller
{

    public function edit()
    {
        $user = Auth::user();
        
        return Inertia::render('manager/profile/edit', [
            'user' => $user,
        ]);
    }

    public function update(Request $request)
    {
        $user = User::find(Auth::id());

        try {
            // Debug log untuk melihat data yang diterima
            Log::info('Manager profile update request data:', $request->all());

            // Validate the request
            $validated = $request->validate([
                'name' => [
                    'required',
                    'string',
                    'max:255'
                ],
                'email' => [
                    'required',
                    'string',
                    'email',
                    'max:255',
                    'unique:users,email,' . $user->id
                ],
                'username' => [
                    'nullable',
                    'string',
                    'max:255',
                    'unique:users,username,' . $user->id
                ],
                'telephone' => [
                    'nullable',
                    'string',
                    'max:20'
                ],
                'gender' => [
                    'nullable',
                    'in:male,female'
                ],
                'address' => [
                    'nullable',
                    'string',
                    'max:500'
                ],
                'guardian_name' => [
                    'nullable',
                    'string',
                    'max:255'
                ],
                'guardian_telephone' => [
                    'nullable',
                    'string',
                    'max:20'
                ],
                'image' => [
                    'nullable',
                    'image',
                    'mimes:jpeg,png,jpg,gif',
                    'max:2048' // 2MB max
                ],
                'remove_image' => [
                    'sometimes',
                    'boolean'
                ],
            ], [
                'gender.in' => 'Gender must be either male or female.',
                'image.max' => 'The image may not be greater than 2MB.',
            ]);

            $imagePath = $user->image;

            if ($request->boolean('remove_image')) {
                Log::info('Removing image for manager user: ' . $user->id);
                
                // Delete existing image file
                if ($user->image && Storage::disk('public')->exists($user->image)) {
                    Storage::disk('public')->delete($user->image);
                    Log::info("Deleted: " . $user->image);
                }
                
                // Set image path to null
                $imagePath = null;
            } 
            // Check if new image is uploaded
            elseif ($request->hasFile('image')) {
                Log::info('Uploading new image for manager user: ' . $user->id);
                
                // Delete existing image file first
                if ($user->image && Storage::disk('public')->exists($user->image)) {
                    Storage::disk('public')->delete($user->image);
                    Log::info("Deleted: " . $user->image);
                }
                
                // Store new image
                $imagePath = $request->file('image')->store('images/users/manager', 'public');
                Log::info('Uploaded new image: ' . $imagePath);
            }

            // Prepare update data (tanpa informasi bank)
            $updateData = [
                'name' => $validated['name'],
                'role' => 'manager', 
                'email' => $validated['email'],
                'username' => $validated['username'],
                'telephone' => $validated['telephone'],
                'gender' => $validated['gender'],
                'address' => $validated['address'],
                'guardian_name' => $validated['guardian_name'],
                'guardian_telephone' => $validated['guardian_telephone'],
                'image' => $imagePath, // This will be null if image was removed
            ];

            Log::info('Updating manager user with data:', $updateData);

            // Update the user
            $user->update($updateData);

            Log::info('Manager user updated successfully');

            return redirect()->route('manager.profile.edit')
                ->with('success', [
                    'title' => 'Profile Updated!',
                    'message' => 'Your profile has been updated successfully.'
                ]);

        } catch (ValidationException $e) {
            Log::error('Manager Profile Validation Error:', $e->errors());
            return back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            Log::error('Manager Profile Update Error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return back()
                ->with('error', [
                    'title' => 'Error!',
                    'message' => 'An error occurred while updating your profile. Please try again.'
                ])
                ->withInput();
        }
    }
}