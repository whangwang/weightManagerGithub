let small = !($(window).width() > 991);
function toast(msg, type, ms = 4000) {
    //allow type: success danger info warning
    $.simplyToast(msg, type, {
        appendTo: "body",
        customClass: "toast-modi",
        align: "center",
        minWidth: 250,
        maxWidth: 450,
        delay: ms,
        allowDismiss: true,
        spacing: 10
    });
    // console.log(($('.toast-modi').height()/2));
    $('.toast-modi').css('top', 'calc( 85vh - ' + ($('.toast-modi').height() / 2) + 'px )');
}
$(document).ready(function(){
    $('body').on('click','.modalBackground',function(e){
        e.stopPropagation();
        $(this).fadeOut(500);
        $('body').css('overflow','auto');
    });
    $('body').on('click','.modalContent',function(e){
        e.stopPropagation();
    });
    $('body').on('click','.modalAnchor:not(.unabled)',function(){
        $($(this).data('target')).fadeIn(500);
        $('body').css('overflow','hidden');
        $($(this).data('target')).removeData();
        $($(this).data('target')).data($(this).data());
        if( typeof $(this).data('switchbase') != 'undefined'){
            $($(this).data('switchbase')).removeClass('active');
            $($(this).data('switchto')).addClass('active');
        }
    });
    $('body').on('click','.modalClose',function(){
        $($(this).data('target')).fadeOut(500);
        $('body').css('overflow','auto');
    });
});
function closeModal(target){
    target.fadeOut(500);
    $('body').css('overflow','auto');
}
function openModal(target){
    target.fadeIn(500);
    $('body').css('overflow','hidden');
}
function copyStringToClipboard (str) {
    // Create new element
    var el = document.createElement('textarea');
    // Set value (string to be copied)
    el.value = str;
    // Set non-editable to avoid focus and move outside of view
    el.setAttribute('readonly', '');
    el.style = {position: 'absolute', left: '-9999px'};
    document.body.appendChild(el);
    // Select text inside element
    el.select();
    // Copy text to clipboard
    document.execCommand('copy');
    // Remove temporary element
    document.body.removeChild(el);
 }