<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('pitches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); 
            $table->string('title');
            $table->string('company_location');
            $table->string('country');
            $table->string('cell_number');
            $table->string('industry');
            $table->string('stage');
            $table->string('ideal_investor_role');
            $table->decimal('total_raising_amount', 15, 2);
            $table->decimal('minimum_investment', 15, 2);
            $table->text('the_business');
            $table->text('the_market');
            $table->text('progress');
            $table->text('objective');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('pitches');
    }
};
