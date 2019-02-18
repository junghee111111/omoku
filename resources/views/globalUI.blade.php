<div class="overlay">
    <div class="Modal">
        <i aria-hidden="true"></i>
        <span></span>
        {!! csrf_field() !!}
        <input type="text" id="ModalInput">
        <button id="Btn_ModalOk">
            <em class="fas fa-check"></em>
        </button>
        <button id="Btn_ModalCancel">
            <em class="fa fa-times"></em>
        </button>
    </div>
    <div class="Toast">
        <i aria-hidden="true"></i>
        <span></span>
    </div>
</div>