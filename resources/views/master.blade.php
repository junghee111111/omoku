<!DOCTYPE html>
<html lang="{{ config('app.locale') }}">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta name="viewport" content="width=380, initial-scale=1.0, shrink-to-fit=yes, minimal-ui, viewport-fit=cover">
    <title>오모쿠 :: 설치가 필요없는 온라인 오목 게임</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="stylesheet" href="/css/reset.css"/>
    <link rel="stylesheet" href="{{ mix('css/app.css') }}">
    <link rel="stylesheet" href="{{ mix('css/main.css') }}"/>
    <link rel="stylesheet" href="/font/css/all.min.css"/>
    <script src="{{ mix('js/app.js') }}"></script>
    <script src="/js/moment.js" type="text/javascript"></script>
    <script src="/js/jquery.min.js" type="text/javascript"></script>
    <script src="/js/jquery.form.min.js" type="text/javascript"></script>
    <script>
    window.Laravel = {!! json_encode([
        'csrfToken' => csrf_token(),
    ]) !!};
    </script>
    @yield("head")
</head>
<body>
    @include("globalUI")
    @yield("content")
    @include("footer")
</body>
<script src="http://121.181.13.204:7376/socket.io/socket.io.js" type="text/javascript"></script>
@yield("endbody")
<script src="{{mix('js/ui.js')}}" type="text/javascript"></script>
</html>