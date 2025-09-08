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

    public function show($id)
    {
        $user = Auth::user();
        $operator = User::where('id', $id)
            ->where('role', 'operator')
            ->where('company_id', $user->company_id)
            ->firstOrFail();

        return Inertia::render('manager/user/operator/show', [
            'operator' => $operator
        ]);
    }

    public function create()
    {
        return Inertia::render('manager/user/operator/create');
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
                $imagePath = $request->file('image')->store('images/users/operator', 'public');
            }

            // Create the operator user
            $operator = User::create([
                'company_id' => $user->company_id,
                'name' => $validated['name'],
                'email' => $validated['email'],
                'username' => $validated['username'],
                'telephone' => $validated['telephone'],
                'gender' => $validated['gender'],
                'address' => $validated['address'],
                'password' => bcrypt($validated['password']),
                'role' => 'operator',
                'image' => $imagePath,
                'email_verified_at' => now(),
            ]);

            return redirect()->route('manager.user.operator.index')
                ->with('success', [
                    'title' => 'Operator Created!',
                    'message' => "Operator account for '{$operator->name}' has been created successfully."
                ]);

        } catch (ValidationException $e) {
            return back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            return back()
                ->with('error', [
                    'title' => 'Error!',
                    'message' => 'An error occurred while creating the operator account. Please try again.'
                ])
                ->withInput();
        }
    }

    public function edit($id)
    {
        $user = Auth::user();
        $operator = User::where('id', $id)
            ->where('role', 'operator')
            ->where('company_id', $user->company_id)
            ->firstOrFail();

        return Inertia::render('manager/user/operator/edit', [
            'operator' => $operator
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = Auth::user();
        $operator = User::where('id', $id)
            ->where('role', 'operator')
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
                    'unique:users,email,' . $operator->id
                ],
                'username' => [
                    'nullable',
                    'string',
                    'max:255',
                    'unique:users,username,' . $operator->id
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
            $imagePath = $operator->image; // Keep existing image by default

            // Check if user wants to remove image
            if ($request->get('remove_image')) {
                if ($operator->image && Storage::disk('public')->exists($operator->image)) {
                    Storage::disk('public')->delete($operator->image);
                }
                $imagePath = null;
            }

            // Handle new image upload
            if ($request->hasFile('image')) {
                // Delete old image if exists
                if ($operator->image && Storage::disk('public')->exists($operator->image)) {
                    Storage::disk('public')->delete($operator->image);
                }
                $imagePath = $request->file('image')->store('images/users/operator', 'public');
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

            // Update the operator user
            $operator->update($updateData);

            return redirect()->route('manager.user.operator.index')
                ->with('success', [
                    'title' => 'Operator Updated!',
                    'message' => "Operator account for '{$operator->name}' has been updated successfully."
                ]);

        } catch (ValidationException $e) {
            return back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            return back()
                ->with('error', [
                    'title' => 'Error!',
                    'message' => 'An error occurred while updating the operator account. Please try again.'
                ])
                ->withInput();
        }
    }

    public function destroy($id)
    {
        $user = Auth::user();
        $operator = User::findOrFail($id);

        if ($operator->company_id !== $user->company_id) {
            abort(404);
        }

        try {
            // Delete operator's image if exists
            if ($operator->image && Storage::disk('public')->exists($operator->image)) {
                Storage::disk('public')->delete($operator->image);
            }

            $operatorName = $operator->name;
            $operator->delete();

            return redirect()->route('manager.user.operator.index')
                ->with('success', [
                    'title' => 'Operator Deleted!',
                    'message' => "Operator account for '{$operatorName}' has been deleted successfully."
                ]);

        } catch (\Exception $e) {
            return back()
                ->with('error', [
                    'title' => 'Error!',
                    'message' => 'An error occurred while deleting the operator account. Please try again.'
                ]);
        }
    }
}