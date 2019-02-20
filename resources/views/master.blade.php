<!DOCTYPE html>
<html lang="{{ config('app.locale') }}">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta name="viewport" content="user-scalable=no,width=380">

    <meta name="subject" content="오모쿠 :: 설치가 필요없는 온라인 오목 게임">
    <meta name="title" content="오모쿠 :: 설치가 필요없는 온라인 오목 게임">
    <meta name="keywords" content="오모쿠,온라인게임,오목게임,오목,온라인오목,무설치온라인오목,오목온라인,오목대전,HTML5게임,HTML5오목,io게임,오목io">

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
    <script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
    <script>
    (adsbygoogle = window.adsbygoogle || []).push({
        google_ad_client: "ca-pub-5685395969412123",
        enable_page_level_ads: true
    });
    </script>
    @yield("head")
</head>
<body>
    @include("globalUI")
    @yield("content")
    @include("footer")
</body>
<<<<<<< HEAD
<script src="http://121.181.13.204:7376/socket.io/socket.io.js" type="text/javascript"></script>
=======
<script src="https://www.omoku.net:7376/socket.io/socket.io.js" type="text/javascript"></script>
>>>>>>> 832535a76dc5b26112315b708af7ac553e7949e4
@yield("endbody")
<script src="{{mix('js/ui.js')}}" type="text/javascript"></script>
</html>
