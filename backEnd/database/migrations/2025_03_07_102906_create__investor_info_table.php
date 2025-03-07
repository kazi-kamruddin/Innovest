<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateInvestorInfoTable extends Migration
{
    public function up()
    {
        Schema::create('investor_info', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->text('fields_of_interest')->nullable(); 
            $table->decimal('investment_range_min', 15, 2)->nullable();
            $table->decimal('investment_range_max', 15, 2)->nullable();
            $table->text('preferred_industries')->nullable();
            $table->timestamps();  
        });
    }

    public function down()
    {
        Schema::dropIfExists('investor_info');
    }
}
