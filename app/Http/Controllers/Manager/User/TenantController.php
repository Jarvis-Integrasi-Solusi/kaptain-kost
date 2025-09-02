<?php

namespace App\Http\Controllers\Manager\User;

use App\Http\Controllers\Controller;
use App\Models\Rental;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Validation\ValidationException;


class TenantController extends Controller
{
    public function index(Request $request)
    {
        $tenants = User::where('role', 'tenant')
                        ->where('company_id', Auth::user()->company_id)
                        ->orderBy('created_at', 'desc')
                        ->get();

        return Inertia::render('manager/user/tenant/index', [
            'tenants' => $tenants,
            'filters' => [
                'search' => $request->get('search', ''),
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('manager/user/tenant/create');
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
                $imagePath = $request->file('image')->store('images/users/tenant', 'public');
            }

            // Create the tenant user
            $tenant = User::create([
                'company_id' => $user->company_id,
                'name' => $validated['name'],
                'email' => $validated['email'],
                'username' => $validated['username'],
                'telephone' => $validated['telephone'],
                'gender' => $validated['gender'],
                'address' => $validated['address'],
                'guardian_name' => $validated['guardian_name'],
                'guardian_telephone' => $validated['guardian_telephone'],
                'password' => bcrypt($validated['password']),
                'role' => 'tenant',
                'image' => $imagePath,
                'email_verified_at' => now(),
            ]);

            return redirect()->route('manager.user.tenant.index')
                ->with('success', [
                    'title' => 'Tenant Created!',
                    'message' => "Tenant account for '{$tenant->name}' has been created successfully."
                ]);

        } catch (ValidationException $e) {
            return back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            return back()
                ->with('error', [
                    'title' => 'Error!',
                    'message' => 'An error occurred while creating the tenant account. Please try again.'
                ])
                ->withInput();
        }
    }

    public function edit($id)
    {
        $user = Auth::user();
        
        // Find the tenant user
        $tenant = User::where('company_id', $user->company_id)
            ->where('role', 'tenant')
            ->findOrFail($id);

        return Inertia::render('manager/user/tenant/edit', [
            'tenant' => $tenant
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = Auth::user();

        try {
            // Find the tenant user
            $tenant = User::where('company_id', $user->company_id)
                ->where('role', 'tenant')
                ->findOrFail($id);

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
                    'unique:users,email,' . $tenant->id
                ],
                'username' => [
                    'nullable',
                    'string',
                    'max:255',
                    'unique:users,username,' . $tenant->id
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
            ], [
                'gender.in' => 'Gender must be either male or female.',
                'password.confirmed' => 'Password confirmation does not match.',
                'image.max' => 'The image may not be greater than 2MB.',
            ]);

            // Handle image upload
            $imagePath = $tenant->image; // Keep existing image by default
            if ($request->hasFile('image')) { 
                // Delete old image if exists
                if ($tenant->image && Storage::disk('public')->exists($tenant->image)) {
                    Storage::disk('public')->delete($tenant->image);
                }
                
                $imagePath = $request->file('image')->store('images/users/tenant', 'public');
            }

            // Prepare update data
            $updateData = [
                'name' => $validated['name'],
                'email' => $validated['email'],
                'username' => $validated['username'],
                'telephone' => $validated['telephone'],
                'gender' => $validated['gender'],
                'address' => $validated['address'],
                'guardian_name' => $validated['guardian_name'],
                'guardian_telephone' => $validated['guardian_telephone'],
                'image' => $imagePath,
            ];

            // Only update password if provided
            if (!empty($validated['password'])) {
                $updateData['password'] = bcrypt($validated['password']);
            }

            // Update the tenant
            $tenant->update($updateData);

            return redirect()->route('manager.user.tenant.index')
                ->with('success', [
                    'title' => 'Tenant Updated!',
                    'message' => "Tenant account for '{$tenant->name}' has been updated successfully."
                ]);

        } catch (ValidationException $e) {
            return back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            return back()
                ->with('error', [
                    'title' => 'Error!',
                    'message' => 'An error occurred while updating the tenant account. Please try again.'
                ])
                ->withInput();
        }
    }

    public function show($id)
    {
        $user = Auth::user();
        
        try {
            // Find the tenant user with additional information
            $tenant = User::where('company_id', $user->company_id)
                ->where('role', 'tenant')
                ->where('id', $id)
                ->firstOrFail();

            // Get all rentals for this tenant
            $rentals = Rental::with([
                'user:id,name,email',
                'room:id,name',
                'room.roomCategory:id,name',
                'paymentType:id,name',
                'rentalPeriod:id,month'
            ])
            ->where('user_id', $tenant->id)
            ->orderBy('entry_date', 'desc')
            ->get();

            return Inertia::render('manager/user/tenant/show', [
                'tenant' => $tenant,
                'rentals' => $rentals
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching tenant details', [
                'tenant_id' => $id,
                'error' => $e->getMessage()
            ]);
            return redirect()->route('manager.user.tenant.index')
                ->with('error', [
                    'title' => 'Tenant Not Found!',
                    'message' => 'The requested tenant could not be found.'
                ]);
        }
    }

    public function destroy($id)
    {
        $user = Auth::user();

        try {
            // Find the tenant user
            $tenant = User::where('company_id', $user->company_id)
                ->where('role', 'tenant')
                ->findOrFail($id);

            // Check if tenant has any rentals
            $rentalCount = Rental::where('user_id', $tenant->id)->count();
            if ($rentalCount > 0) {
                return redirect()->route('manager.user.tenant.index')
                    ->with('error', [
                        'title' => 'Cannot Delete Tenant!',
                        'message' => "Tenant '{$tenant->name}' cannot be deleted because they have rentals."
                    ]);
            }

            // Delete tenant's image if exists
            if ($tenant->image && Storage::disk('public')->exists($tenant->image)) {
                Storage::disk('public')->delete($tenant->image);
            }

            // Delete the tenant
            $tenant->delete();

            return redirect()->route('manager.user.tenant.index')
                ->with('success', [
                    'title' => 'Tenant Deleted!',
                    'message' => "Tenant account for '{$tenant->name}' has been deleted successfully."
                ]);

        } catch (\Exception $e) {
            return redirect()->route('manager.user.tenant.index')
                ->with('error', [
                    'title' => 'Error!',
                    'message' => 'An error occurred while deleting the tenant account. Please try again.'
                ]);
        }
    }
}
