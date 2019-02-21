@extends("master")

@section("head")
    
@stop

@section("content")
<div class="bg">
    <div class="small"></div>
</div>
<!--로비-->
<section class="login">
    <div class="logoWrapper">
        <img src="/img/logo.png">
        <div id="welcomeMessage">
            <div class="welcomeMessage">
                설치가 필요 없는 온라인 오목 게임
                <br/>
                <strong>10초만에 가입 후 바로 시작해 보세요!</strong>
            </div>
        </div>
    </div>
    <!--메인메뉴-->
    <div class="titlecard" id="loginformWrapper">
        <form method="POST" id="loginform" action="{{route('login')}}">
        {!! csrf_field() !!}
            <label>
                닉네임
                <br/>
                <input type="text" name="name" value="{{old('name')}}" maxlength="6" required/>
                <em class="fa fa-user-circle"></em>
            </label>
            <label>
                비밀번호
                <br/>
                <input type="password" name="password" id="password" required/>
                <em class="fa fa-key"></em>
            </label>
            <label>
                <input type="checkbox" checked name="remember"> 자동 로그인
            </label>
            <button type="submit" class="login blue"><em class="fa fa-sign-in-alt"></em> 닉네임으로 로그인</button>
            <button class="signup" onclick="return false;"><em class="fa fa-user-plus"></em> 회원가입</button>
            
        </form>
        <form method="POST" id="registerform" action="{{route('register')}}" style="display:none;">
        {!! csrf_field() !!}
            <label>
                닉네임(6자 이하)
                <br/>
                <input type="text" name="name" value="{{old('name')}}" maxlength="6" required/>
                <em class="fas fa-id-card"></em>
            </label>
            <!--<label>
                이메일
                <br/>
                <input type="email" name="email" value="{{old('email')}}" required/>
                <em class="fa fa-at"></em>
            </label>-->
            <label>
                비밀번호(8자 이상)
                <br/>
                <input type="password" name="password" required/>
                <em class="fa fa-key"></em>
            </label>
            <label>
                비밀번호 확인
                <br/>
                <input type="password" name="password_confirmation" id="password_confirmation" required/>
                <em class="fa fa-check"></em>
            </label>
            
            <label style="text-align:right;">
                감사합니다!
            </label>
            <label style="display:none;">
                <input type="checkbox" required name="laws" id="laws" checked> <a id='go_laws' href="#">이용 약관</a>을 이해했으며 동의합니다.
            </label>
            <label style="display:none;">
                <input type="checkbox" required name="privacy" id="privacy" checked> <a id='go_privacy' href="#">개인정보 취급방침</a>을 이해했으며 동의합니다.
            </label>
            <button type="submit" class="login green"><em class="fa fa-user-check"></em> 회원가입 요청</button>
            <button class="signup back" onclick="return false;"><em class="fa fa-arrow-left"></em> 로그인하기..</button>
            
        </form>
    </div>
</section>
<!--인게임-->
<?php
if(Auth::check()){
    ?>
    <section class="lobby">
        <div class="logoWrapper">
            <img src="/img/logo.png">
            <div class="myinfo">
                <em class="fa fa-user"></em>
                <span class="username" omoku-data="name">-</span>
                <em class="fa fa-caret-down"></em>
                <ul>
                    <li>내 정보</li>
                    <li>
                        <a href="/auth/logout">
                        로그아웃
                        </a>
                    </li>
                </ul>
            </div>
        </div>
        <div class="body">
            <section class="home segment">
                <div class="card">
                    <h1>
                        <span omoku-data="name"></span>
                        <span class="fas fa-dot-circle gold">&nbsp;<span omoku-data="gold"><?=Auth::user()->gold;?></span></span>
                    </h1>
                    <h2 style="margin-top:7px;line-height:100%;font-weight:normal;">
                        <span omoku-data="winAll"><?=(Auth::user()->wins+Auth::user()->loses);?></span> 전 
                        <span class="wins" omoku-data="wins"><?=Auth::user()->wins;?></span> 승
                        <span class="loses" omoku-data="loses"><?=Auth::user()->loses;?></span> 패
                        <?php
                        $ratio = 0;
                        if(Auth::user()->wins+Auth::user()->loses>0){
                            $ratio = (Auth::user()->wins/(Auth::user()->wins+Auth::user()->loses))*100;
                        }
                        ?>
                        (승률 <span omoku-data="winRate"><?=$ratio;?></span>%)
                    </h2>
                </div><!--프로필-->
                <div class="card">
                    <h1>
                    <span class="fa fa-bullhorn"></span>&nbsp;
                        공지사항
                    </h1>
                    <h2>오모쿠 오픈베타를 시작합니다.</h2>
                    <p>
                        현재 오픈 베타 중이며 서버가 불안정할 수 있습니다.
                        <br/>감사합니다.
                    </p>
                </div><!--공지사항-->
                <div class="card">
                    <h1>
                        <span class="fa fa-comments"></span>&nbsp;
                        로비 채팅 - <span omoku-data="counter"></span> 명 접속중
                    </h1>
                    <textarea readonly id="chatContents">게임 서버에 연결하는 중..</textarea>
                    <input maxlength="40" type="text" placeholder="여기에 채팅 입력 후 엔터키로 전송" id="chatInput"/>
                </div><!--채팅-->
                <div class="card">
                    <h1>
                        <span class="fas fa-exclamation-circle"></span>&nbsp;
                        팁
                    </h1>
                    <p>
                    화면 오른쪽이 잘리는 분들은 <strong class="colorRed" style="display:inline">두 손가락으로 화면을 끝까지 줌 아웃</strong>한 상태로 이용하세요!
                    <br />
                    개발자 이메일 : <a href="mailto://tokki.lab@gmail.com">tokki.lab@gmail.com</a>
                    </p>
                </div><!--채팅-->
            </section>
            <section class="ranking segment">
                <div class="card white">
                    <h1>
                        랭킹
                    </h1>
                    <div class="rankBoard">
                        로드중..
                    </div>
                </div>
            </section>
            <section class="store segment">
                <div class="card white">
                    <h1>
                        상점 <em class="fa fa-dot-circle gold">&nbsp;<span omoku-data='gold'></span></em> 소지
                    </h1>
                    <div class="storeBoard">
                        <ul class="menu">
                            <li type="dol" class="on">바둑돌</li>
                            <li type="board">바둑판</li>
                        </ul>
                        <ul class="item">
                            
                        </ul>
                    </div>
                </div>
            </section>
            <section class="account segment">
                <div class="card white">
                    <h1>
                        인벤토리
                    </h1>
                    <div class="inventory">
                        <ul class="purchaseList">

                        </ul>
                    </div>
                </div>
                <div class="card white">
                    <h1>
                        계정
                    </h1>
                    <div class="accountBoard">
                        <ul>
                            <li>
                                <div class="left">회원번호</div>
                                <div class="right"><?=Auth::user()->id;?></div>
                            </li>
                            <li>
                                <div class="left">닉네임</div>
                                <div class="right" omoku-data="name"><?=Auth::user()->name;?></div>
                            </li>
                            <!--<li>
                                <div class="left">이메일</div>
                                <div class="right"><?=Auth::user()->email;?></div>
                            </li>-->
                            <li>
                                <div class="left">골드</div>
                                <div class="right"><i class="gold fa fa-dot-circle" omoku-data="gold"><?=Auth::user()->gold;?></i></div>
                            </li>
                            <li>
                                <div class="left">가입일</div>
                                <div class="right"><?=Auth::user()->created_at;?></div>
                            </li>
                            <li>
                                <div class="left">마지막 접속일</div>
                                <div class="right"><?=Auth::user()->updated_at;?></div>
                            </li>
                            <li>
                                <div class="left">전적</div>
                                <div class="right">
                                <span omoku-data="winAll"><?=(Auth::user()->wins+Auth::user()->loses);?></span> 전 
                                <span class="wins" omoku-data="wins"><?=Auth::user()->wins;?></span> 승
                                <span class="loses" omoku-data="loses"><?=Auth::user()->loses;?></span> 패
                                <?php
                                $ratio = 0;
                                if(Auth::user()->wins+Auth::user()->loses>0){
                                    $ratio = (Auth::user()->wins/(Auth::user()->wins+Auth::user()->loses))*100;
                                }
                                ?>
                                (승률 <span omoku-data="winRate"><?=$ratio;?></span>%)
                                </div>
                            </li>
                        </ul>
                        <button id="Btn_changeName">닉네임 변경&nbsp;(<i class="gold fa fa-dot-circle">500</i>&nbsp;차감)</button>
                        <button id="Btn_changePasswd">비밀번호 변경</button>
                        <button id="Btn_removeUser">회원 탈퇴</button>
                        <button id="Btn_logout">로그아웃</button>
                    </div>
                </div>
                
            </section>
            <div class="startBtnWrapper">
                <div class="inviteListWrapper">
                    
                </div>
                <button class="startBtn" id="connectFriend">
                <em class="fa fa-user-friends"></em>&nbsp;
                친구와 연결하기
                </button>
                <button class="startBtn" id="startMatch">
                <em class="fas fa-random"></em>&nbsp;
                랜덤 매치메이킹
                </button>
                <button class="runningBtn" id="running">
                <em class="fas fa-sync-alt spin"></em>&nbsp;
                사용자를 찾는중.. 클릭시 취소
                </button>
                <button class="runningBtn matched" id="matched">
                <em class="fas fa-user-check"></em>&nbsp;
                대전 상대 결정! 곧 게임을 시작합니다.
                </button>
            </div>
            
        </div>
        <nav class="bottom">
            <ul>
                <li class="on" segment="home">
                    <em class="fa fa-home"></em>
                    <span>로비</span>
                </li>
                <li segment="ranking">
                    <em class="fa fa-trophy"></em>
                    <span>랭킹</span>
                </li>
                <li segment="store">
                    <em class="fa fa-shopping-bag"></em>
                    <span>상점</span>
                </li>
                <li segment="account">
                    <em class="fa fa-user-alt"></em>
                    <span omoku-data="name"></span>
                </li>
            </ul>
        </nav>
    </section>

<?php
}
?>

@include("ingame")
@stop
@section("endbody")
<script src="{{mix('js/main.js')}}" type="text/javascript"></script>
@stop