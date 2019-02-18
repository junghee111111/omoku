@extends("master")

@section("head")
    
@stop

@section("content")
<div class="bg"></div>
@include("ingame");
<script>
$(document).ready(function(){
    $("section.ingame").show();
})
</script>
@stop