<?php

namespace App\Http\Controllers\Manager\Rental;

use App\Http\Controllers\Controller;
use App\Models\PaymentType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentTypeController extends Controller
{
    public function index()
    {
        $allPaymentTypes = PaymentType::all();

        return Inertia::render('manager/rental/payment-type/index', [
            'payment_types' => $allPaymentTypes,
        ]);
    }

    

}
