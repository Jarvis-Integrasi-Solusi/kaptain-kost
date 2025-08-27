<?php

namespace Database\Seeders;

use App\Models\Company;
use GuzzleHttp\Promise\Create;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CompanySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Company::create([
            'name' => 'GHV 2',
            'address' => 'jl. GHV 2, RT001, RW0010 No.21, Kec. Dummy, Jakarta Pusat',
            'telephone' => '081298387456'
        ]);
    }
}
