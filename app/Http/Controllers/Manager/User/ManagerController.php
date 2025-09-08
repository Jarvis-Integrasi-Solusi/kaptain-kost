<?php

namespace App\Http\Controllers\Manager\User;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rule;

class ManagerController extends Controller
{
    public function index(Request $request)
    {
        $managers = User::where('role', 'manager')
                        ->where('company_id', Auth::user()->company_id)
                         ->where('id', '!=', Auth::id())
                        ->orderBy('created_at', 'desc')
                        ->get();

        return Inertia::render('manager/user/manager/index', [
            'managers' => $managers,
            'filters' => [
                'search' => $request->get('search', ''),
            ],
        ]);
    }

    public function show($id)
    {
        $user = Auth::user();
        $manager = User::where('id', $id)
            ->where('role', 'manager')
            ->where('company_id', $user->company_id)
            ->firstOrFail();

        return Inertia::render('manager/user/manager/show', [
            'manager' => $manager
        ]);
    }

    public function create()
    {
        return Inertia::render('manager/user/manager/create');
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
                    'max:255'
                ],
                'email' => [
                    'required',
                    'string',
                    'email',
                    'max:255',
                    'unique:users,email'
                ],
                'username' => [
                    'nullable',
                    'string',
                    'max:255',
                    'unique:users,username'
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
                'password' => [
                    'required',
                    'string',
                    'min:8',
                    'confirmed'
                ],
                'image' => [
                    'nullable',
                    'image',
                    'mimes:jpeg,png,jpg,gif',
                    'max:2048' // 2MB max
                ],
            ], [
                'gender.in' => 'Gender must be either male or female.',
                'password.confirmed' => 'Password confirmation does not match.',
                'image.max' => 'The image may not be greater than 2MB.',
            ]);

            // Handle image upload
            $imagePath = null;
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('images/users/manager', 'public');
            }

            // Create the manager user
            $manager = User::create([
                'company_id' => $user->company_id,
                'name' => $validated['name'],
                'email' => $validated['email'],
                'username' => $validated['username'],
                'telephone' => $validated['telephone'],
                'gender' => $validated['gender'],
                'address' => $validated['address'],
                'password' => bcrypt($validated['password']),
                'role' => 'manager',
                'image' => $imagePath,
                'email_verified_at' => now(),
            ]);

            return redirect()->route('manager.user.manager.index')
                ->with('success', [
                    'title' => 'Manager Created!',
                    'message' => "Manager account for '{$manager->name}' has been created successfully."
                ]);

        } catch (ValidationException $e) {
            return back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            return back()
                ->with('error', [
                    'title' => 'Error!',
                    'message' => 'An error occurred while creating the manager account. Please try again.'
                ])
                ->withInput();
        }
    }

    public function edit($id)
    {
        $user = Auth::user();
        $manager = User::where('id', $id)
            ->where('role', 'manager')
            ->where('company_id', $user->company_id)
            ->firstOrFail();

        return Inertia::render('manager/user/manager/edit', [
            'manager' => $manager
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = Auth::user();
        $manager = User::where('id', $id)
            ->where('role', 'manager')
            ->where('company_id', $user->company_id)
            ->firstOrFail();

        try {
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
                    'unique:users,email,' . $manager->id
                ],
                'username' => [
                    'nullable',
                    'string',
                    'max:255',
                    'unique:users,username,' . $manager->id
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
                'password' => [
                    'nullable',
                    'string',
                    'min:8',
                    'confirmed'
                ],
                'image' => [
                    'nullable',
                    'image',
                    'mimes:jpeg,png,jpg,gif',
                    'max:2048' // 2MB max
                ],
                'remove_image' => [
                    'nullable',
                    'boolean'
                ],
            ], [
                'gender.in' => 'Gender must be either male or female.',
                'password.confirmed' => 'Password confirmation does not match.',
                'image.max' => 'The image may not be greater than 2MB.',
            ]);

            // Handle image upload and removal
            $imagePath = $user->image; // Keep existing image by default

            // Check if user wants to remove image
            if ($request->get('remove_image')) {
                if ($user->image && Storage::disk('public')->exists($user->image)) {
                    Storage::disk('public')->delete($user->image);
                }
                $imagePath = null;
            }

            // Handle new image upload
            if ($request->hasFile('image')) {
                // Delete old image if exists
                if ($user->image && Storage::disk('public')->exists($user->image)) {
                    Storage::disk('public')->delete($user->image);
                }
                $imagePath = $request->file('image')->store('images/users/manager', 'public');
            }

            // Prepare update data
            $updateData = [
                'name' => $validated['name'],
                'email' => $validated['email'],
                'username' => $validated['username'],
                'telephone' => $validated['telephone'],
                'gender' => $validated['gender'],
                'address' => $validated['address'],
                'image' => $imagePath,
            ];

            // Only update password if provided
            if (!empty($validated['password'])) {
                $updateData['password'] = bcrypt($validated['password']);
            }

            // Update the manager user
            $manager->update($updateData);

            return redirect()->route('manager.user.manager.index')
                ->with('success', [
                    'title' => 'Manager Updated!',
                    'message' => "Manager account for '{$manager->name}' has been updated successfully."
                ]);

        } catch (ValidationException $e) {
            return back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            return back()
                ->with('error', [
                    'title' => 'Error!',
                    'message' => 'An error occurred while updating the manager account. Please try again.'
                ])
                ->withInput();
        }
    }

    public function destroy($id)
    {
        $user = Auth::user();
        $manager = User::findOrFail($id);

        if ($manager->company_id !== $user->company_id) {
            abort(404);
        }

        try {
            // Delete manager's image if exists
            if ($manager->image && Storage::disk('public')->exists($manager->image)) {
                Storage::disk('public')->delete($manager->image);
            }

            $managerName = $manager->name;
            $manager->delete();

            return redirect()->route('manager.user.manager.index')
                ->with('success', [
                    'title' => 'Manager Deleted!',
                    'message' => "Manager account for '{$managerName}' has been deleted successfully."
                ]);

        } catch (\Exception $e) {
            return back()
                ->with('error', [
                    'title' => 'Error!',
                    'message' => 'An error occurred while deleting the manager account. Please try again.'
                ]);
        }
    }
}